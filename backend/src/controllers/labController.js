const pool = require('../config/database');

// Create lab test order
exports.createLabTest = async (req, res) => {
  try {
    const { 
      patient_id, 
      encounter_id,
      test_name, 
      instructions,
      priority = 'routine'
    } = req.body;

    if (!patient_id || !test_name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Patient ID and test name are required' 
      });
    }

    const result = await pool.query(
      `INSERT INTO lab_tests 
       (patient_id, doctor_id, encounter_id, test_name, instructions, priority, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'ordered') 
       RETURNING *`,
      [patient_id, req.user.id, encounter_id || null, test_name, instructions || null, priority]
    );

    res.status(201).json({
      success: true,
      message: 'Lab test ordered successfully',
      data: { labTest: result.rows[0] }
    });
  } catch (error) {
    console.error('Create lab test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get all lab tests (for lab dashboard)
exports.getAllLabTests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT lt.*, p.name as patient_name, p.uhid, u.name as doctor_name
      FROM lab_tests lt
      JOIN patients p ON lt.patient_id = p.id
      JOIN users u ON lt.doctor_id = u.id
    `;
    
    let countQuery = 'SELECT COUNT(*) FROM lab_tests lt';
    const values = [];

    if (status) {
      query += ` WHERE lt.status = $${values.length + 1}`;
      countQuery += ` WHERE lt.status = $${values.length + 1}`;
      values.push(status);
    }

    query += ' ORDER BY lt.created_at DESC LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
    values.push(parseInt(limit), parseInt(offset));

    const [testsResult, countResult] = await Promise.all([
      pool.query(query, values),
      pool.query(countQuery, status ? [status] : [])
    ]);

    res.json({
      success: true,
      data: {
        labTests: testsResult.rows,
        pagination: {
          total: parseInt(countResult.rows[0].count),
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(countResult.rows[0].count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all lab tests error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get lab tests by patient
exports.getLabTestsByPatient = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT lt.*, u.name as doctor_name
       FROM lab_tests lt
       JOIN users u ON lt.doctor_id = u.id
       WHERE lt.patient_id = $1
       ORDER BY lt.created_at DESC`,
      [req.params.patient_id]
    );

    res.json({
      success: true,
      data: { labTests: result.rows }
    });
  } catch (error) {
    console.error('Get patient lab tests error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Update lab test status
exports.updateLabTestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const validStatuses = ['ordered', 'sample_collected', 'processing', 'completed', 'approved', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    const result = await pool.query(
      `UPDATE lab_tests 
       SET status = $1 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lab test not found' 
      });
    }

    res.json({
      success: true,
      message: 'Lab test status updated',
      data: { labTest: result.rows[0] }
    });
  } catch (error) {
    console.error('Update lab test status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Submit lab test results
exports.submitResults = async (req, res) => {
  try {
    const { result, ref_range, abnormal_flags, notes } = req.body;
    const { id } = req.params;

    if (!result) {
      return res.status(400).json({ 
        success: false, 
        message: 'Result is required' 
      });
    }

    const resultData = await pool.query(
      `UPDATE lab_tests 
       SET result = $1, 
           ref_range = $2, 
           abnormal_flags = $3, 
           notes = $4,
           status = 'completed',
           completed_at = CURRENT_TIMESTAMP
       WHERE id = $5 
       RETURNING *`,
      [result, ref_range || null, abnormal_flags || null, notes || null, id]
    );

    if (resultData.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lab test not found' 
      });
    }

    res.json({
      success: true,
      message: 'Results submitted successfully',
      data: { labTest: resultData.rows[0] }
    });
  } catch (error) {
    console.error('Submit results error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Approve lab report (by pathologist/doctor)
exports.approveReport = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE lab_tests 
       SET status = 'approved',
           approved_by = $1,
           approved_at = CURRENT_TIMESTAMP
       WHERE id = $2 
       RETURNING *`,
      [req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lab test not found' 
      });
    }

    res.json({
      success: true,
      message: 'Report approved successfully',
      data: { labTest: result.rows[0] }
    });
  } catch (error) {
    console.error('Approve report error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get pending lab tests for doctor
exports.getPendingLabTests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT lt.*, p.name as patient_name, p.uhid
       FROM lab_tests lt
       JOIN patients p ON lt.patient_id = p.id
       WHERE lt.doctor_id = $1 AND lt.status NOT IN ('approved', 'cancelled')
       ORDER BY lt.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: { labTests: result.rows }
    });
  } catch (error) {
    console.error('Get pending lab tests error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
