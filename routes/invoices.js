// routes/invoices.js

const express = require('express');
const router = express.Router();

// Sample database module for demonstration
const db = require('../db');

// Middleware to parse JSON requests
router.use(express.json());

// GET /invoices - Get info on invoices
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT id, comp_code FROM invoices');
        return res.json({ invoices: result.rows });
    } catch (err) {
        console.error('Error fetching invoices:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /invoices/:id - Get details of a specific invoice
router.get('/:id', async (req, res) => {
    const invoiceId = req.params.id;
    try {
        const result = await db.query('SELECT * FROM invoices WHERE id = $1', [invoiceId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        return res.json({ invoice: result.rows[0] });
    } catch (err) {
        console.error('Error fetching invoice:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /invoices - Add an invoice
router.post('/', async (req, res) => {
    const { comp_code, amt } = req.body;
    if (!comp_code || !amt) {
        return res.status(400).json({ error: 'Company code and amount are required' });
    }
    try {
        const result = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *', [comp_code, amt]);
        return res.status(201).json({ invoice: result.rows[0] });
    } catch (err) {
        console.error('Error adding invoice:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PUT /invoices/:id - Update an invoice
router.put('/:id', async (req, res) => {
    const invoiceId = req.params.id;
    const { amt } = req.body;
    try {
        const result = await db.query('UPDATE invoices SET amt = $1 WHERE id = $2 RETURNING *', [amt, invoiceId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        return res.json({ invoice: result.rows[0] });
    } catch (err) {
        console.error('Error updating invoice:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE /invoices/:id - Delete an invoice
router.delete('/:id', async (req, res) => {
    const invoiceId = req.params.id;
    try {
        const result = await db.query('DELETE FROM invoices WHERE id = $1 RETURNING *', [invoiceId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        return res.json({ status: 'deleted' });
    } catch (err) {
        console.error('Error deleting invoice:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
