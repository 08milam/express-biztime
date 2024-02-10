// routes/companies.js

const express = require('express');
const router = express.Router();

// Sample database module for demonstration
const db = require('../db');

// Middleware to parse JSON requests
router.use(express.json());

// GET /companies - Get list of companies
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT code, name FROM companies');
        return res.json({ companies: result.rows });
    } catch (err) {
        console.error('Error fetching companies:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /companies/:code - Get details of a specific company
router.get('/:code', async (req, res) => {
    const companyCode = req.params.code;
    try {
        const result = await db.query('SELECT * FROM companies WHERE code = $1', [companyCode]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Company not found' });
        }
        return res.json({ company: result.rows[0] });
    } catch (err) {
        console.error('Error fetching company:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /companies - Create a new company
router.post('/', async (req, res) => {
    const { code, name, description } = req.body;
    if (!code || !name || !description) {
        return res.status(400).json({ error: 'Code, name, and description are required' });
    }
    try {
        await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3)', [code, name, description]);
        return res.status(201).json({ company: { code, name, description } });
    } catch (err) {
        console.error('Error creating company:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PUT /companies/:code - Edit existing company
router.put('/:code', async (req, res) => {
    const companyCode = req.params.code;
    const { name, description } = req.body;
    try {
        const result = await db.query('UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING *', [name, description, companyCode]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Company not found' });
        }
        return res.json({ company: result.rows[0] });
    } catch (err) {
        console.error('Error updating company:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE /companies/:code - Deletes company
router.delete('/:code', async (req, res) => {
    const companyCode = req.params.code;
    try {
        const result = await db.query('DELETE FROM companies WHERE code = $1 RETURNING *', [companyCode]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Company not found' });
        }
        return res.json({ status: 'deleted' });
    } catch (err) {
        console.error('Error deleting company:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
