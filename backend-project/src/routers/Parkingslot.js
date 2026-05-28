const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. POST: CREATE A SINGLE INDIVIDUAL PARKING SLOT Space
router.post('/', async (req, res) => {
    const { slot_number } = req.body;
    if (!slot_number || isNaN(slot_number)) {
        return res.status(400).json({ message: 'A valid numerical slot indicator value is required.' });
    }
    try {
        // Enforce uniqueness validation manually prior to running execution commands
        const [duplicateCheck] = await db.query('SELECT slot_number FROM parking_slots WHERE slot_number = ?', [slot_number]);
        if (duplicateCheck.length > 0) {
            return res.status(400).json({ message: `Slot Room #${slot_number} already exists inside the database architecture.` });
        }

        await db.query('INSERT INTO parking_slots (slot_number, status) VALUES (?, "available")', [slot_number]);
        res.status(201).json({ message: `Slot Room #${slot_number} initialized successfully.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GET: FETCH ALL SLOTS REGISTERED IN DATABASE
router.get('/', async (req, res) => {
    try {
        const [slots] = await db.query('SELECT * FROM parking_slots ORDER BY slot_number ASC');
        res.json(slots);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. GET: FETCH ONLY AVAILABLE UNITS FOR FRONTEND FORM INTAKE DROPDOWNS
router.get('/available', async (req, res) => {
    try {
        const [slots] = await db.query('SELECT * FROM parking_slots WHERE status = "available" ORDER BY slot_number ASC');
        res.json(slots);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. POST: MASS SEED LAYOUT INITIALIZER
router.post('/seed', async (req, res) => {
    const { totalSlots } = req.body;
    if (!totalSlots || isNaN(totalSlots)) {
        return res.status(400).json({ message: 'Provide a valid array sequence limit value.' });
    }
    try {
        for (let i = 1; i <= totalSlots; i++) {
            await db.query(
                'INSERT INTO parking_slots (slot_number, status) VALUES (?, "available") ON DUPLICATE KEY UPDATE status=status',
                [i]
            );
        }
        res.json({ message: `Successfully seeded layout configuration grid sequence up to #${totalSlots}.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. PUT: MANUAL UPDATE TO CHANGE/TOGGLE STATUS OVERRIDES
router.put('/toggle-status', async (req, res) => {
    const { slot_number, target_status } = req.body;
    try {
        await db.query('UPDATE parking_slots SET status = ? WHERE slot_number = ?', [target_status, slot_number]);
        res.json({ message: `Slot #${slot_number} structural status changed to '${target_status}'.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. DELETE: SAFELY REMOVE INDIVIDUAL SLOTS IF UNTRACKED BY ACTIVE ARCHIVES
router.delete('/:slot_number', async (req, res) => {
    const { slot_number } = req.params;
    try {
        // Safeguard integrity validation check: block drop operations if cars are currently parked inside the target spot
        const [activeCheck] = await db.query(
            'SELECT id FROM parking_records WHERE slot_number = ? AND status = "active"', 
            [slot_number]
        );
        if (activeCheck.length > 0) {
            return res.status(400).json({ 
                message: `Cannot remove Slot #${slot_number}. A vehicle currently occupies this unit.` 
            });
        }

        // Clean dependent record trackers before breaking constraints if needed, or simply delete if empty
        await db.query('DELETE FROM parking_slots WHERE slot_number = ?', [slot_number]);
        res.json({ message: `Slot Unit #${slot_number} permanently cleared from directory registry map.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;