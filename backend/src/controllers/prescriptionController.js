const pool = require('../config/database');

// Create prescription
exports.createPrescription = async (req, res) => {
  try {
    const { encounter_id, medicines } = req.body;

    if (!encounter_id || !medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Encounter ID and medicines array are required' 
      });
    }

    // Verify encounter exists and belongs to doctor
    const encounterCheck = await pool.query(
      'SELECT id FROM encounters WHERE id = $1 AND doctor_id = $2',
      [encounter_id, req.user.id]
    );

    if (encounterCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Encounter not found or unauthorized' 
      });
    }

    const insertedMedicines = [];

    for (const med of medicines) {
      const { medicine_name, dosage, frequency, duration, instructions } = med;
      
      if (!medicine_name || !dosage) {
        continue; // Skip invalid entries
      }

      const result = await pool.query(
        `INSERT INTO prescriptions 
         (encounter_id, medicine_name, dosage, frequency, duration, instructions) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [encounter_id, medicine_name, dosage, frequency || null, duration || null, instructions || null]
      );
      
      insertedMedicines.push(result.rows[0]);
    }

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: { prescriptions: insertedMedicines }
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get prescriptions by encounter
exports.getPrescriptionsByEncounter = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM prescriptions WHERE encounter_id = $1 ORDER BY created_at',
      [req.params.encounter_id]
    );

    res.json({
      success: true,
      data: { prescriptions: result.rows }
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get prescriptions by patient
exports.getPrescriptionsByPatient = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, e.date as encounter_date, u.name as doctor_name
       FROM prescriptions p
       JOIN encounters e ON p.encounter_id = e.id
       JOIN users u ON e.doctor_id = u.id
       WHERE e.patient_id = $1
       ORDER BY e.date DESC, p.created_at DESC`,
      [req.params.patient_id]
    );

    res.json({
      success: true,
      data: { prescriptions: result.rows }
    });
  } catch (error) {
    console.error('Get patient prescriptions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Delete prescription
exports.deletePrescription = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM prescriptions WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Prescription not found' 
      });
    }

    res.json({
      success: true,
      message: 'Prescription deleted successfully'
    });
  } catch (error) {
    console.error('Delete prescription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Save prescription template
exports.saveTemplate = async (req, res) => {
  try {
    const { name, medicines } = req.body;

    if (!name || !medicines || !Array.isArray(medicines)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Template name and medicines are required' 
      });
    }

    const result = await pool.query(
      `INSERT INTO prescription_templates 
       (doctor_id, name, medicines) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [req.user.id, name, JSON.stringify(medicines)]
    );

    res.status(201).json({
      success: true,
      message: 'Template saved successfully',
      data: { template: result.rows[0] }
    });
  } catch (error) {
    console.error('Save template error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get doctor's templates
exports.getTemplates = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM prescription_templates WHERE doctor_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({
      success: true,
      data: { templates: result.rows }
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Delete template
exports.deleteTemplate = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM prescription_templates WHERE id = $1 AND doctor_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Template not found' 
      });
    }

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
