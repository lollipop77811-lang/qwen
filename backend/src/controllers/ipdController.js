const pool = require('../config/database');

// Admit patient (IPD)
exports.admitPatient = async (req, res) => {
  try {
    const { 
      patient_id, 
      bed_id, 
      diagnosis, 
      admission_notes,
      estimated_discharge_date
    } = req.body;

    if (!patient_id || !bed_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Patient ID and Bed ID are required' 
      });
    }

    // Check bed availability
    const bedCheck = await pool.query(
      'SELECT status FROM beds WHERE id = $1',
      [bed_id]
    );

    if (bedCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bed not found' 
      });
    }

    if (bedCheck.rows[0].status !== 'available') {
      return res.status(400).json({ 
        success: false, 
        message: 'Bed is not available' 
      });
    }

    const result = await pool.query(
      `INSERT INTO ipd_admissions 
       (patient_id, bed_id, admitting_doctor_id, diagnosis, admission_notes, estimated_discharge_date, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'active') 
       RETURNING *`,
      [patient_id, bed_id, req.user.id, diagnosis || null, admission_notes || null, estimated_discharge_date || null]
    );

    // Update bed status
    await pool.query(
      'UPDATE beds SET status = $1 WHERE id = $2',
      ['occupied', bed_id]
    );

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, details, ip_address) 
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, 'IPD_ADMISSION', `Admitted patient ${patient_id} to bed ${bed_id}`, req.ip]
    );

    res.status(201).json({
      success: true,
      message: 'Patient admitted successfully',
      data: { admission: result.rows[0] }
    });
  } catch (error) {
    console.error('Admit patient error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get all active admissions
exports.getActiveAdmissions = async (req, res) => {
  try {
    const { ward, status = 'active' } = req.query;

    let query = `
      SELECT ia.*, p.name as patient_name, p.uhid, p.phone, b.ward_name, b.bed_number, u.name as doctor_name
      FROM ipd_admissions ia
      JOIN patients p ON ia.patient_id = p.id
      JOIN beds b ON ia.bed_id = b.id
      JOIN users u ON ia.admitting_doctor_id = u.id
      WHERE ia.status = $1
    `;
    const values = [status];

    if (ward) {
      query += ` AND b.ward_name = $${values.length + 1}`;
      values.push(ward);
    }

    query += ' ORDER BY ia.admission_date DESC';

    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: { admissions: result.rows }
    });
  } catch (error) {
    console.error('Get active admissions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get admission by ID
exports.getAdmissionById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ia.*, p.name as patient_name, p.uhid, p.dob, p.gender, p.blood_group,
              b.ward_name, b.bed_number, u.name as doctor_name
       FROM ipd_admissions ia
       JOIN patients p ON ia.patient_id = p.id
       JOIN beds b ON ia.bed_id = b.id
       JOIN users u ON ia.admitting_doctor_id = u.id
       WHERE ia.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Admission not found' 
      });
    }

    // Get vitals for this admission
    const vitals = await pool.query(
      `SELECT * FROM patient_vitals 
       WHERE admission_id = $1 
       ORDER BY recorded_at DESC`,
      [req.params.id]
    );

    // Get medications administered
    const medications = await pool.query(
      `SELECT * FROM medication_administration 
       WHERE admission_id = $1 
       ORDER BY administered_at DESC`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: { 
        admission: result.rows[0],
        vitals: vitals.rows,
        medications: medications.rows
      }
    });
  } catch (error) {
    console.error('Get admission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Transfer bed
exports.transferBed = async (req, res) => {
  try {
    const { new_bed_id } = req.body;
    const { id } = req.params;

    // Get current admission
    const currentAdmission = await pool.query(
      'SELECT bed_id FROM ipd_admissions WHERE id = $1 AND status = $2',
      [id, 'active']
    );

    if (currentAdmission.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Active admission not found' 
      });
    }

    const oldBedId = currentAdmission.rows[0].bed_id;

    // Check new bed availability
    const newBedCheck = await pool.query(
      'SELECT status FROM beds WHERE id = $1',
      [new_bed_id]
    );

    if (newBedCheck.rows.length === 0 || newBedCheck.rows[0].status !== 'available') {
      return res.status(400).json({ 
        success: false, 
        message: 'New bed is not available' 
      });
    }

    // Update admission with new bed
    await pool.query(
      'UPDATE ipd_admissions SET bed_id = $1 WHERE id = $2',
      [new_bed_id, id]
    );

    // Update bed statuses
    await pool.query(
      'UPDATE beds SET status = $1 WHERE id = $2',
      ['available', oldBedId]
    );
    
    await pool.query(
      'UPDATE beds SET status = $1 WHERE id = $2',
      ['occupied', new_bed_id]
    );

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, details, ip_address) 
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, 'BED_TRANSFER', `Transferred admission ${id} from bed ${oldBedId} to ${new_bed_id}`, req.ip]
    );

    res.json({
      success: true,
      message: 'Bed transferred successfully'
    });
  } catch (error) {
    console.error('Transfer bed error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Discharge patient
exports.dischargePatient = async (req, res) => {
  try {
    const { discharge_summary, discharge_medications, follow_up_instructions, follow_up_date } = req.body;
    const { id } = req.params;

    // Get admission details
    const admission = await pool.query(
      'SELECT bed_id, patient_id FROM ipd_admissions WHERE id = $1 AND status = $2',
      [id, 'active']
    );

    if (admission.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Active admission not found' 
      });
    }

    const bedId = admission.rows[0].bed_id;

    const result = await pool.query(
      `UPDATE ipd_admissions 
       SET status = 'discharged',
           discharge_date = CURRENT_TIMESTAMP,
           discharge_summary = $1,
           discharge_medications = $2,
           follow_up_instructions = $3,
           follow_up_date = $4
       WHERE id = $5 
       RETURNING *`,
      [discharge_summary || null, discharge_medications || null, follow_up_instructions || null, follow_up_date || null, id]
    );

    // Free up the bed
    await pool.query(
      'UPDATE beds SET status = $1 WHERE id = $2',
      ['available', bedId]
    );

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, details, ip_address) 
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, 'IPD_DISCHARGE', `Discharged admission ${id}`, req.ip]
    );

    res.json({
      success: true,
      message: 'Patient discharged successfully',
      data: { admission: result.rows[0] }
    });
  } catch (error) {
    console.error('Discharge patient error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get IPD statistics
exports.getIpdStats = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [totalBeds, occupiedBeds, activeAdmissions, dischargesToday] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM beds'),
      pool.query("SELECT COUNT(*) FROM beds WHERE status = 'occupied'"),
      pool.query("SELECT COUNT(*) FROM ipd_admissions WHERE status = 'active'"),
      pool.query(`SELECT COUNT(*) FROM ipd_admissions WHERE status = 'discharged' AND DATE(discharge_date) = $1`, [today])
    ]);

    res.json({
      success: true,
      data: {
        totalBeds: parseInt(totalBeds.rows[0].count),
        occupiedBeds: parseInt(occupiedBeds.rows[0].count),
        availableBeds: parseInt(totalBeds.rows[0].count) - parseInt(occupiedBeds.rows[0].count),
        occupancyRate: Math.round((parseInt(occupiedBeds.rows[0].count) / parseInt(totalBeds.rows[0].count)) * 100),
        activeAdmissions: parseInt(activeAdmissions.rows[0].count),
        dischargesToday: parseInt(dischargesToday.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Get IPD stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
