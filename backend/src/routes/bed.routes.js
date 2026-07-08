const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const pool = require('../config/database');

router.use(authenticate);

// Get all beds
router.get('/', authorize(['Admin', 'Doctor', 'Nurse', 'FrontDesk']), async (req, res) => {
  try {
    const { ward, status } = req.query;
    let query = 'SELECT * FROM beds';
    const values = [];

    if (ward) {
      query += ' WHERE ward_name = $1';
      values.push(ward);
    }

    if (status) {
      query += values.length > 0 ? ' AND status = $' + (values.length + 1) : ' WHERE status = $' + (values.length + 1);
      values.push(status);
    }

    query += ' ORDER BY ward_name, bed_number';

    const result = await pool.query(query, values);
    res.json({ success: true, data: { beds: result.rows } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add new bed
router.post('/', authorize(['Admin']), async (req, res) => {
  try {
    const { ward_name, bed_number, bed_type } = req.body;
    
    const result = await pool.query(
      `INSERT INTO beds (ward_name, bed_number, bed_type, status) 
       VALUES ($1, $2, $3, 'available') 
       RETURNING *`,
      [ward_name, bed_number, bed_type || 'general']
    );

    res.status(201).json({ success: true, data: { bed: result.rows[0] } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update bed status
router.put('/:id/status', authorize(['Admin', 'Nurse']), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['available', 'occupied', 'maintenance', 'cleaning'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE beds SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Bed not found' });
    }

    res.json({ success: true, data: { bed: result.rows[0] } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get bed occupancy stats by ward
router.get('/stats/occupancy', authorize(['Admin', 'Doctor', 'Nurse']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ward_name,
        COUNT(*) as total_beds,
        COUNT(*) FILTER (WHERE status = 'occupied') as occupied_beds,
        COUNT(*) FILTER (WHERE status = 'available') as available_beds,
        ROUND((COUNT(*) FILTER (WHERE status = 'occupied')::numeric / COUNT(*)::numeric) * 100, 2) as occupancy_rate
      FROM beds
      GROUP BY ward_name
      ORDER BY ward_name
    `);

    res.json({ success: true, data: { stats: result.rows } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
