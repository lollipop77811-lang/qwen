const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const pool = require('../config/database');

router.use(authenticate);

// Get audit logs (Admin only)
router.get('/audit-logs', authorize(['Admin']), async (req, res) => {
  try {
    const { page = 1, limit = 50, user_id, action } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT al.*, u.name as user_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
    `;
    
    let countQuery = 'SELECT COUNT(*) FROM audit_logs';
    const values = [];

    if (user_id) {
      query += ` WHERE al.user_id = $${values.length + 1}`;
      countQuery += ` WHERE user_id = $${values.length + 1}`;
      values.push(user_id);
    }

    if (action) {
      const condition = values.length > 0 ? ' AND' : ' WHERE';
      query += `${condition} al.action ILIKE $${values.length + 1}`;
      countQuery += `${condition} action ILIKE $${values.length + 1}`;
      values.push(`%${action}%`);
    }

    query += ' ORDER BY al.created_at DESC LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
    values.push(parseInt(limit), parseInt(offset));

    const [logsResult, countResult] = await Promise.all([
      pool.query(query, values),
      pool.query(countQuery, user_id || action ? [user_id || `%${action}%`] : [])
    ]);

    res.json({
      success: true,
      data: {
        logs: logsResult.rows,
        pagination: {
          total: parseInt(countResult.rows[0].count),
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(countResult.rows[0].count / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get hospital settings
router.get('/settings', authorize(['Admin', 'Doctor', 'FrontDesk']), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hospital_settings ORDER BY id DESC LIMIT 1');
    
    res.json({ 
      success: true, 
      data: { settings: result.rows[0] || null } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update hospital settings (Admin only)
router.put('/settings', authorize(['Admin']), async (req, res) => {
  try {
    const { 
      hospital_name, 
      address, 
      phone, 
      email, 
      logo_url,
      tax_number,
      consultation_fee,
      bed_charge_per_day
    } = req.body;

    // Check if settings exist
    const existing = await pool.query('SELECT id FROM hospital_settings ORDER BY id DESC LIMIT 1');

    let result;
    if (existing.rows.length > 0) {
      result = await pool.query(
        `UPDATE hospital_settings 
         SET hospital_name = COALESCE($1, hospital_name),
             address = COALESCE($2, address),
             phone = COALESCE($3, phone),
             email = COALESCE($4, email),
             logo_url = COALESCE($5, logo_url),
             tax_number = COALESCE($6, tax_number),
             consultation_fee = COALESCE($7, consultation_fee),
             bed_charge_per_day = COALESCE($8, bed_charge_per_day),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $9
         RETURNING *`,
        [hospital_name, address, phone, email, logo_url, tax_number, consultation_fee, bed_charge_per_day, existing.rows[0].id]
      );
    } else {
      result = await pool.query(
        `INSERT INTO hospital_settings 
         (hospital_name, address, phone, email, logo_url, tax_number, consultation_fee, bed_charge_per_day) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
        [hospital_name, address, phone, email, logo_url, tax_number, consultation_fee, bed_charge_per_day]
      );
    }

    res.json({ 
      success: true, 
      message: 'Settings updated successfully',
      data: { settings: result.rows[0] } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get dashboard analytics (Admin/Doctor)
router.get('/analytics', authorize(['Admin', 'Doctor']), async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [
      patientsToday,
      appointmentsToday,
      totalPatients,
      revenueToday,
      pendingLabTests,
      activeIpdPatients
    ] = await Promise.all([
      pool.query(`SELECT COUNT(DISTINCT patient_id) FROM encounters WHERE DATE(date) = $1`, [today]),
      pool.query(`SELECT COUNT(*) FROM appointments WHERE DATE(date) = $1`, [today]),
      pool.query(`SELECT COUNT(*) FROM patients`),
      pool.query(`SELECT SUM(amount) FROM payments WHERE DATE(payment_date) = $1`, [today]),
      pool.query(`SELECT COUNT(*) FROM lab_tests WHERE status NOT IN ('approved', 'cancelled')`),
      pool.query(`SELECT COUNT(*) FROM ipd_admissions WHERE status = 'active'`)
    ]);

    res.json({
      success: true,
      data: {
        patientsToday: parseInt(patientsToday.rows[0].count),
        appointmentsToday: parseInt(appointmentsToday.rows[0].count),
        totalPatients: parseInt(totalPatients.rows[0].count),
        revenueToday: parseFloat(revenueToday.rows[0].sum) || 0,
        pendingLabTests: parseInt(pendingLabTests.rows[0].count),
        activeIpdPatients: parseInt(activeIpdPatients.rows[0].count)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
