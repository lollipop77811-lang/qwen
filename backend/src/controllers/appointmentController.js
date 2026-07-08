const pool = require('../config/database');

// Create appointment
exports.createAppointment = async (req, res) => {
  try {
    const { patient_id, doctor_id, date, time, notes } = req.body;

    if (!patient_id || !doctor_id || !date || !time) {
      return res.status(400).json({ 
        success: false, 
        message: 'Patient ID, Doctor ID, date, and time are required' 
      });
    }

    // Generate token number for the day
    const today = new Date().toISOString().slice(0, 10);
    const tokenResult = await pool.query(
      `SELECT COUNT(*) as count FROM appointments 
       WHERE doctor_id = $1 AND DATE(date) = $2`,
      [doctor_id, today]
    );
    
    const tokenNumber = parseInt(tokenResult.rows[0].count) + 1;

    const result = await pool.query(
      `INSERT INTO appointments 
       (patient_id, doctor_id, date, time, token_number, notes, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [patient_id, doctor_id, date, time, tokenNumber, notes || null, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: { appointment: result.rows[0] }
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get appointments by doctor
exports.getAppointmentsByDoctor = async (req, res) => {
  try {
    const { date } = req.query;
    const doctorId = req.params.doctor_id;

    let query = `
      SELECT a.*, p.name as patient_name, p.uhid, p.phone, p.gender, p.dob
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.doctor_id = $1
    `;
    const values = [doctorId];

    if (date) {
      query += ` AND DATE(a.date) = $${values.length + 1}`;
      values.push(date);
    } else {
      // Default to today
      query += ` AND DATE(a.date) = $${values.length + 1}`;
      values.push(new Date().toISOString().slice(0, 10));
    }

    query += ' ORDER BY a.time ASC';

    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: { appointments: result.rows }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get appointments by patient
exports.getAppointmentsByPatient = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name as doctor_name
       FROM appointments a
       JOIN users u ON a.doctor_id = u.id
       WHERE a.patient_id = $1
       ORDER BY a.date DESC, a.time DESC`,
      [req.params.patient_id]
    );

    res.json({
      success: true,
      data: { appointments: result.rows }
    });
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const validStatuses = ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    const result = await pool.query(
      `UPDATE appointments 
       SET status = $1 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    res.json({
      success: true,
      message: 'Appointment status updated',
      data: { appointment: result.rows[0] }
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE appointments 
       SET status = 'cancelled' 
       WHERE id = $1 
       RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: { appointment: result.rows[0] }
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get today's queue for doctor
exports.getTodayQueue = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const today = new Date().toISOString().slice(0, 10);

    const result = await pool.query(
      `SELECT a.*, p.name as patient_name, p.uhid, p.age, p.gender
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       WHERE a.doctor_id = $1 AND DATE(a.date) = $2 AND a.status != 'cancelled'
       ORDER BY a.token_number ASC`,
      [doctorId, today]
    );

    res.json({
      success: true,
      data: { queue: result.rows }
    });
  } catch (error) {
    console.error('Get queue error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
