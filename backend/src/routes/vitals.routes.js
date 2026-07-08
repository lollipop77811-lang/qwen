const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const pool = require('../config/database');

router.use(authenticate);

// Record patient vitals
router.post('/', authorize(['Doctor', 'Nurse']), async (req, res) => {
  try {
    const { 
      patient_id, 
      admission_id,
      bp_systolic, 
      bp_diastolic, 
      pulse, 
      temperature, 
      spo2, 
      respiratory_rate,
      weight,
      notes 
    } = req.body;

    if (!patient_id || !bp_systolic || !bp_diastolic || !pulse) {
      return res.status(400).json({ 
        success: false, 
        message: 'Patient ID, BP, and pulse are required' 
      });
    }

    const result = await pool.query(
      `INSERT INTO patient_vitals 
       (patient_id, admission_id, bp_systolic, bp_diastolic, pulse, temperature, spo2, respiratory_rate, weight, notes, recorded_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [patient_id, admission_id || null, bp_systolic, bp_diastolic, pulse, temperature || null, spo2 || null, respiratory_rate || null, weight || null, notes || null, req.user.id]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Vitals recorded successfully',
      data: { vitals: result.rows[0] } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get vitals by patient
router.get('/patient/:patient_id', authorize(['Admin', 'Doctor', 'Nurse']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pv.*, u.name as recorded_by_name
       FROM patient_vitals pv
       JOIN users u ON pv.recorded_by = u.id
       WHERE pv.patient_id = $1
       ORDER BY pv.recorded_at DESC
       LIMIT 50`,
      [req.params.patient_id]
    );

    res.json({ success: true, data: { vitals: result.rows } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get vitals by admission (IPD)
router.get('/admission/:admission_id', authorize(['Admin', 'Doctor', 'Nurse']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pv.*, u.name as recorded_by_name
       FROM patient_vitals pv
       JOIN users u ON pv.recorded_by = u.id
       WHERE pv.admission_id = $1
       ORDER BY pv.recorded_at DESC`,
      [req.params.admission_id]
    );

    res.json({ success: true, data: { vitals: result.rows } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get latest vitals for a patient
router.get('/patient/:patient_id/latest', authorize(['Admin', 'Doctor', 'Nurse']), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pv.*, u.name as recorded_by_name
       FROM patient_vitals pv
       JOIN users u ON pv.recorded_by = u.id
       WHERE pv.patient_id = $1
       ORDER BY pv.recorded_at DESC
       LIMIT 1`,
      [req.params.patient_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No vitals found' });
    }

    res.json({ success: true, data: { vitals: result.rows[0] } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
