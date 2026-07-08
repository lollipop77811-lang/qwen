const pool = require('../config/database');

// Create encounter (consultation)
exports.createEncounter = async (req, res) => {
  try {
    const { 
      patient_id, 
      chief_complaints, 
      history_of_present_illness,
      past_medical_history,
      examination_notes,
      diagnosis,
      treatment_plan,
      vitals
    } = req.body;

    if (!patient_id || !chief_complaints) {
      return res.status(400).json({ 
        success: false, 
        message: 'Patient ID and chief complaints are required' 
      });
    }

    const result = await pool.query(
      `INSERT INTO encounters 
       (patient_id, doctor_id, chief_complaints, history_of_present_illness, past_medical_history, examination_notes, diagnosis, treatment_plan, vitals) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [patient_id, req.user.id, chief_complaints, history_of_present_illness || null, past_medical_history || null, examination_notes || null, diagnosis || null, treatment_plan || null, vitals || null]
    );

    // Update appointment status to completed if exists
    await pool.query(
      `UPDATE appointments 
       SET status = 'completed' 
       WHERE patient_id = $1 AND doctor_id = $2 AND DATE(date) = CURRENT_DATE AND status = 'in-progress'`,
      [patient_id, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Encounter created successfully',
      data: { encounter: result.rows[0] }
    });
  } catch (error) {
    console.error('Create encounter error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get encounter by ID
exports.getEncounterById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, p.name as patient_name, p.uhid, u.name as doctor_name
       FROM encounters e
       JOIN patients p ON e.patient_id = p.id
       JOIN users u ON e.doctor_id = u.id
       WHERE e.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Encounter not found' 
      });
    }

    // Get prescriptions for this encounter
    const prescriptions = await pool.query(
      'SELECT * FROM prescriptions WHERE encounter_id = $1',
      [req.params.id]
    );

    // Get lab tests ordered in this encounter
    const labTests = await pool.query(
      `SELECT lt.* FROM lab_tests lt
       WHERE lt.encounter_id = $1`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: { 
        encounter: result.rows[0],
        prescriptions: prescriptions.rows,
        labTests: labTests.rows
      }
    });
  } catch (error) {
    console.error('Get encounter error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get encounters by patient
exports.getEncountersByPatient = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, u.name as doctor_name
       FROM encounters e
       JOIN users u ON e.doctor_id = u.id
       WHERE e.patient_id = $1
       ORDER BY e.date DESC`,
      [req.params.patient_id]
    );

    res.json({
      success: true,
      data: { encounters: result.rows }
    });
  } catch (error) {
    console.error('Get patient encounters error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get today's encounters for doctor
exports.getTodayEncounters = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, p.name as patient_name, p.uhid
       FROM encounters e
       JOIN patients p ON e.patient_id = p.id
       WHERE e.doctor_id = $1 AND DATE(e.date) = CURRENT_DATE
       ORDER BY e.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: { encounters: result.rows }
    });
  } catch (error) {
    console.error('Get today encounters error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Update encounter
exports.updateEncounter = async (req, res) => {
  try {
    const { 
      chief_complaints, 
      history_of_present_illness,
      past_medical_history,
      examination_notes,
      diagnosis,
      treatment_plan,
      vitals
    } = req.body;

    const result = await pool.query(
      `UPDATE encounters 
       SET chief_complaints = COALESCE($1, chief_complaints),
           history_of_present_illness = COALESCE($2, history_of_present_illness),
           past_medical_history = COALESCE($3, past_medical_history),
           examination_notes = COALESCE($4, examination_notes),
           diagnosis = COALESCE($5, diagnosis),
           treatment_plan = COALESCE($6, treatment_plan),
           vitals = COALESCE($7, vitals)
       WHERE id = $8 
       RETURNING *`,
      [chief_complaints, history_of_present_illness, past_medical_history, examination_notes, diagnosis, treatment_plan, vitals, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Encounter not found' 
      });
    }

    res.json({
      success: true,
      message: 'Encounter updated successfully',
      data: { encounter: result.rows[0] }
    });
  } catch (error) {
    console.error('Update encounter error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
