const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * GET: FETCH COMPLETE DAILY PAYMENT AUDITING LEDGER RECORD ARRAYS
 * Query Parameters Expected: ?date=YYYY-MM-DD
 */
router.get('/daily', async (req, res) => {
    // Falls back to current system date if parameter arguments are missing
    const targetDate = req.query.date || new Date().toISOString().split('T')[0];

    try {
        const queryExecution = `
            SELECT 
                r.plate_number,
                c.driver_name,
                c.phone_number,
                r.slot_number,
                r.entry_time,
                r.exit_time,
                r.duration_hours,
                p.amount_paid,
                p.payment_date,
                u.name AS billed_by
            FROM parking_records r
            JOIN cars c ON r.plate_number = c.plate_number
            JOIN payments p ON p.record_id = r.id
            LEFT JOIN users u ON p.user_id = u.id
            WHERE DATE(p.payment_date) = ?
            ORDER BY p.payment_date DESC
        `;

        const [records] = await db.query(queryExecution, [targetDate]);
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;