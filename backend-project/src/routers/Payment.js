const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/exit', async (req, res) => {
    const { plate_number, user_id } = req.body;

    try {
        // 1. Fetch active session record details along with driver identity data
        const [records] = await db.query(`
            SELECT r.*, c.driver_name 
            FROM parking_records r
            JOIN cars c ON r.plate_number = c.plate_number
            WHERE r.plate_number = ? AND r.status = 'active'
        `, [plate_number]);

        if (records.length === 0) {
            return res.status(404).json({ message: "No active parking records found for this plate number." });
        }

        const activeSession = records[0];
        const entryTime = new Date(activeSession.entry_time);
        const exitTime = new Date(); // Current system time
        
        // 2. Compute bill metrics (500 RWF / Hr, minimum 1 hour)
        const durationInMs = Math.abs(exitTime - entryTime);
        const durationHours = Math.ceil(durationInMs / (1000 * 60 * 60)) || 1; 
        const amountPaid = durationHours * 500;

        // 3. Update active track records mapping file properties
        await db.query(`
            UPDATE parking_records 
            SET exit_time = ?, duration_hours = ?, status = 'completed' 
            WHERE id = ?
        `, [exitTime, durationHours, activeSession.id]);

        // 4. Free up the slot room space
        await db.query(`
            UPDATE parking_slots SET status = 'available' WHERE slot_number = ?
        `, [activeSession.slot_number]);

        // 5. Store payment logs statement details inside auditing ledger
        await db.query(`
            INSERT INTO payments (record_id, amount_paid, payment_date, user_id) 
            VALUES (?, ?, ?, ?)
        `, [activeSession.id, amountPaid, exitTime, user_id]);

        // 6. Fetch processing cashier user identity profile
        const [users] = await db.query('SELECT name FROM users WHERE id = ?', [user_id]);
        const processedBy = users[0]?.name || "System Manager";

        // Return bill response details directly back to our active UI state hook
        res.json({
            message: "Checkout transaction recorded successfully.",
            bill: {
                record_id: activeSession.id,
                plate_number: activeSession.plate_number,
                driver_name: activeSession.driver_name,
                slot_number: activeSession.slot_number,
                entry_time: activeSession.entry_time,
                exit_time: exitTime,
                duration_hours: durationHours,
                amount_paid: amountPaid,
                processed_by: processedBy
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
export default router;