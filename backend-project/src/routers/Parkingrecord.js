const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Points to your database connection file

/**
 * 1. POST: RECORD VEHICLE ENTRY (CHECK-IN)
 * Frontend form inputs: plate_number, driver_name, phone_number, and a selected slot_number
 */
router.post('/entry', async (req, res) => {
    const { plate_number, driver_name, phone_number, slot_number } = req.body;

    // Quick validation check
    if (!plate_number || !driver_name || !phone_number || !slot_number) {
        return res.status(400).json({ message: 'All registration fields are required.' });
    }

    try {
        // Step A: Check if the parking slot exists and is actually available
        const [slotCheck] = await db.query(
            'SELECT status FROM parking_slots WHERE slot_number = ?', 
            [slot_number]
        );

        if (slotCheck.length === 0) {
            return res.status(404).json({ message: `Parking slot #${slot_number} does not exist.` });
        }
        
        if (slotCheck[0].status === 'occupied') {
            return res.status(400).json({ message: `Slot #${slot_number} is already occupied by another vehicle.` });
        }

        // Step B: Check if this vehicle is already parked inside the system anywhere
        const [activeVehicleCheck] = await db.query(
            'SELECT id FROM parking_records WHERE plate_number = ? AND status = "active"',
            [plate_number]
        );

        if (activeVehicleCheck.length > 0) {
            return res.status(400).json({ message: `Vehicle ${plate_number} is already logged with an active session.` });
        }

        // Step C: Save or update car profile (handles existing returning drivers cleanly)
        await db.query(
            `INSERT INTO cars (plate_number, driver_name, phone_number) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE driver_name = ?, phone_number = ?`,
            [plate_number, driver_name, phone_number, driver_name, phone_number]
        );

        // Step D: Create the active parking record tracker log
        await db.query(
            'INSERT INTO parking_records (plate_number, slot_number, status) VALUES (?, ?, "active")',
            [plate_number, slot_number]
        );

        // Step E: Set the selected slot state to occupied
        await db.query(
            'UPDATE parking_slots SET status = "occupied" WHERE slot_number = ?', 
            [slot_number]
        );

        res.status(201).json({ 
            message: `Vehicle ${plate_number} checked into Slot ${slot_number} successfully!` 
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/**
 * 2. POST: RECORD VEHICLE EXIT & GENERATE COMPREHENSIVE INVOICE (CHECK-OUT)
 * Frontend inputs: plate_number, user_id (The ID of the cashier currently logged in)
 */
router.post('/exit', async (req, res) => {
    const { plate_number, user_id } = req.body;

    if (!plate_number || !user_id) {
        return res.status(400).json({ message: 'Plate number and authorized user ID are required.' });
    }

    try {
        // Step A: Locate active check-in tracking records
        const [records] = await db.query(
            'SELECT * FROM parking_records WHERE plate_number = ? AND status = "active"',
            [plate_number]
        );

        if (records.length === 0) {
            return res.status(404).json({ message: 'No active transaction session found for this plate number.' });
        }

        const activeRecord = records[0];
        const entryTime = new Date(activeRecord.entry_time);
        const exitTime = new Date(); // Right now

        // Step B: Calculate duration constraints (500 RWF hourly scale rule)
        const timeDifferenceMs = exitTime.getTime() - entryTime.getTime();
        
        // Math.ceil rounds fractions up (e.g., 10 minutes becomes 1 hr)
        let durationHours = Math.ceil(timeDifferenceMs / (1000 * 60 * 60));
        
        // Safeguard case for instant clicking or clock variances
        if (durationHours <= 0) {
            durationHours = 1;
        }

        const ratePerHour = 500;
        const totalCalculatedBill = durationHours * ratePerHour;

        // Step C: Update original parking log record to complete
        await db.query(
            `UPDATE parking_records 
             SET exit_time = ?, duration_hours = ?, status = "completed" 
             WHERE id = ?`,
            [exitTime, durationHours, activeRecord.id]
        );

        // Step D: Free up the slot state back to available
        await db.query(
            'UPDATE parking_slots SET status = "available" WHERE slot_number = ?', 
            [activeRecord.slot_number]
        );

        // Step E: Store permanent proof of financial clearing inside Payments
        await db.query(
            'INSERT INTO payments (record_id, amount_paid, user_id) VALUES (?, ?, ?)',
            [activeRecord.id, totalCalculatedBill, user_id]
        );

        // Step F: Build unified comprehensive invoice details for frontend UI consumption
        // Updated 'u.name AS processed_by' to accurately align with the frontend UI key requirements
        const [invoiceDetails] = await db.query(
            `SELECT 
                r.plate_number,
                c.driver_name,
                c.phone_number,
                r.slot_number,
                r.entry_time,
                r.exit_time,
                r.duration_hours,
                p.amount_paid,
                p.payment_date,
                u.name AS processed_by
             FROM parking_records r
             JOIN cars c ON r.plate_number = c.plate_number
             JOIN payments p ON p.record_id = r.id
             JOIN users u ON p.user_id = u.id
             WHERE r.id = ?`,
            [activeRecord.id]
        );

        res.json({ 
            message: 'Exit checkout processed successfully', 
            bill: invoiceDetails[0] 
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/**
 * 3. GET: ACQUIRE CURRENTLY ACTIVE SESSIONS FOR SELECTION DROPDOWNS ON FRONTEND
 */
router.get('/active', async (req, res) => {
    try {
        const [activeLogs] = await db.query(
            `SELECT r.id, r.plate_number, r.slot_number, c.driver_name, r.entry_time 
             FROM parking_records r
             JOIN cars c ON r.plate_number = c.plate_number
             WHERE r.status = "active" 
             ORDER BY r.entry_time DESC`
        );
        res.json(activeLogs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * 4. PUT: UPDATE ACTIVE PARKING RECORD (Move vehicle to another slot room)
 */
router.put('/update/:id', async (req, res) => {
    const { slot_number } = req.body;
    try {
        // Step A: Find the previous tracking record to free its room slot
        const [oldRecord] = await db.query('SELECT slot_number FROM parking_records WHERE id = ?', [req.params.id]);
        if (oldRecord.length === 0) {
            return res.status(404).json({ message: "Active parking session record not found." });
        }

        const previousSlot = oldRecord[0].slot_number;

        // Step B: Double-check if target destination slot is available
        const [targetCheck] = await db.query('SELECT status FROM parking_slots WHERE slot_number = ?', [slot_number]);
        if (targetCheck.length === 0) {
            return res.status(404).json({ message: `Target slot #${slot_number} does not exist.` });
        }
        if (targetCheck[0].status === 'occupied' && previousSlot !== parseInt(slot_number)) {
            return res.status(400).json({ message: `Target slot #${slot_number} is already occupied.` });
        }

        // Step C: Free previous slot space
        await db.query('UPDATE parking_slots SET status = "available" WHERE slot_number = ?', [previousSlot]);
        
        // Step D: Save new track details and lock down the new parking slot
        await db.query('UPDATE parking_records SET slot_number = ? WHERE id = ?', [slot_number, req.params.id]);
        await db.query('UPDATE parking_slots SET status = "occupied" WHERE slot_number = ?', [slot_number]);
        
        res.json({ message: `Parking slot allocation successfully moved to Slot #${slot_number}.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * 5. DELETE: REMOVE/CANCEL ACTIVE LOG COMPLETELY FROM MANAGEMENT ARRAYS
 */
router.delete('/record/:id', async (req, res) => {
    try {
        const [record] = await db.query('SELECT slot_number FROM parking_records WHERE id = ?', [req.params.id]);
        if (record.length > 0) {
            // Re-open slot bay location
            await db.query('UPDATE parking_slots SET status = "available" WHERE slot_number = ?', [record[0].slot_number]);
        }
        await db.query('DELETE FROM parking_records WHERE id = ?', [req.params.id]);
        res.json({ message: "Parking session tracker entry cleared successfully." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;