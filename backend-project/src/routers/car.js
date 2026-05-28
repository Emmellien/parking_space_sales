const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. GET CAR PROFILE BY PLATE NUMBER (For instant autofill search)
router.get('/plate/:plate_number', async (req, res) => {
    try {
        const [cars] = await db.query(
            'SELECT * FROM cars WHERE plate_number = ?', 
            [req.params.plate_number.toUpperCase()]
        );
        
        if (cars.length === 0) {
            return res.status(404).json({ message: 'No registered car profile found.' });
        }
        res.json(cars[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GET ALL REGISTERED VEHICLES WITH TOTAL PARKING TRIPS COUNT
router.get('/', async (req, res) => {
    try {
        const [cars] = await db.query(`
            SELECT c.*, COUNT(r.id) AS total_trips 
            FROM cars c
            LEFT JOIN parking_records r ON c.plate_number = r.plate_number
            GROUP BY c.plate_number
            ORDER BY c.driver_name ASC
        `);
        res.json(cars);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. POST: EXPLICITLY CREATE OR UPDATE A CAR REGISTRY PROFILE
router.post('/', async (req, res) => {
    const { plate_number, driver_name, phone_number } = req.body;
    if (!plate_number || !driver_name || !phone_number) {
        return res.status(400).json({ message: 'All car entity attributes are required.' });
    }
    try {
        await db.query(
            `INSERT INTO cars (plate_number, driver_name, phone_number) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE driver_name = ?, phone_number = ?`,
            [plate_number.toUpperCase(), driver_name, phone_number, driver_name, phone_number]
        );
        res.status(201).json({ message: `Car profile ${plate_number} updated successfully.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;