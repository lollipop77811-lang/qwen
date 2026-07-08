const pool = require('../config/database');

// Create Patient with auto-generated UHID
exports.createPatient = async (req, res) => {
  try {
    const { 
      name, 
      dob, 
      gender, 
      phone, 
      address, 
      blood_group, 
      email,
      emergency_contact,
      insurance_provider,
      insurance_id
    } = req.body;

    if (!name || !dob || !gender || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, DOB, gender, and phone are required' 
      });
    }

    // Generate UHID: HP-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const uhid = `HP-${dateStr}-${randomNum}`;

    const result = await pool.query(
      `INSERT INTO patients 
       (uhid, name, dob, gender, phone, address, blood_group, email, emergency_contact, insurance_provider, insurance_id, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
      [uhid, name, dob, gender, phone, address || null, blood_group || null, email || null, emergency_contact || null, insurance_provider || null, insurance_id || null, req.user.id]
    );

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, details, ip_address) 
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, 'PATIENT_CREATED', `Created patient: ${uhid}`, req.ip]
    );

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: { patient: result.rows[0] }
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get all patients with pagination and search
exports.getAllPatients = async (req, res) => {
  try {
    const { search, page = 1, limit = 15 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, uhid, name, dob, gender, phone, blood_group, created_at 
      FROM patients
    `;
    
    let countQuery = 'SELECT COUNT(*) FROM patients';
    const values = [];

    if (search) {
      query += ` WHERE name ILIKE $1 OR uhid ILIKE $1 OR phone LIKE $1`;
      countQuery += ` WHERE name ILIKE $1 OR uhid ILIKE $1 OR phone LIKE $1`;
      values.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (values.length + 1) + ' OFFSET $' + (values.length + 2);
    values.push(parseInt(limit), parseInt(offset));

    const [patientsResult, countResult] = await Promise.all([
      pool.query(query, values),
      pool.query(countQuery, search ? [`%${search}%`] : [])
    ]);

    res.json({
      success: true,
      data: {
        patients: patientsResult.rows,
        pagination: {
          total: parseInt(countResult.rows[0].count),
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(countResult.rows[0].count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all patients error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get patient by ID with full details
exports.getPatientById = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM patients WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    // Get patient's recent encounters
    const encounters = await pool.query(
      `SELECT id, date, chief_complaints, diagnosis 
       FROM encounters 
       WHERE patient_id = $1 
       ORDER BY date DESC 
       LIMIT 5`,
      [req.params.id]
    );

    // Get patient's appointments
    const appointments = await pool.query(
      `SELECT a.id, a.date, a.time, a.status, a.token_number, u.name as doctor_name
       FROM appointments a
       JOIN users u ON a.doctor_id = u.id
       WHERE a.patient_id = $1
       ORDER BY a.date DESC, a.time DESC
       LIMIT 5`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: { 
        patient: result.rows[0],
        recentEncounters: encounters.rows,
        recentAppointments: appointments.rows
      }
    });
  } catch (error) {
    console.error('Get patient by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get patient by UHID
exports.getPatientByUhid = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM patients WHERE uhid = $1',
      [req.params.uhid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    res.json({
      success: true,
      data: { patient: result.rows[0] }
    });
  } catch (error) {
    console.error('Get patient by UHID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Update patient
exports.updatePatient = async (req, res) => {
  try {
    const { 
      name, 
      dob, 
      gender, 
      phone, 
      address, 
      blood_group, 
      email,
      emergency_contact,
      insurance_provider,
      insurance_id
    } = req.body;

    const result = await pool.query(
      `UPDATE patients 
       SET name = COALESCE($1, name),
           dob = COALESCE($2, dob),
           gender = COALESCE($3, gender),
           phone = COALESCE($4, phone),
           address = COALESCE($5, address),
           blood_group = COALESCE($6, blood_group),
           email = COALESCE($7, email),
           emergency_contact = COALESCE($8, emergency_contact),
           insurance_provider = COALESCE($9, insurance_provider),
           insurance_id = COALESCE($10, insurance_id)
       WHERE id = $11 
       RETURNING *`,
      [name, dob, gender, phone, address, blood_group, email, emergency_contact, insurance_provider, insurance_id, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, details, ip_address) 
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, 'PATIENT_UPDATED', `Updated patient: ${req.params.id}`, req.ip]
    );

    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: { patient: result.rows[0] }
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Search patients (quick search for autocomplete)
exports.searchPatients = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query must be at least 2 characters' 
      });
    }

    const result = await pool.query(
      `SELECT id, uhid, name, dob, gender, phone 
       FROM patients 
       WHERE name ILIKE $1 OR uhid ILIKE $1 OR phone LIKE $1
       ORDER BY created_at DESC 
       LIMIT 10`,
      [`%${q}%`]
    );

    res.json({
      success: true,
      data: { patients: result.rows }
    });
  } catch (error) {
    console.error('Search patients error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get patient history (all encounters, prescriptions, lab tests)
exports.getPatientHistory = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify patient exists
    const patientCheck = await pool.query(
      'SELECT id FROM patients WHERE id = $1',
      [id]
    );

    if (patientCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    // Get all encounters with prescriptions
    const encounters = await pool.query(
      `SELECT e.*, u.name as doctor_name
       FROM encounters e
       JOIN users u ON e.doctor_id = u.id
       WHERE e.patient_id = $1
       ORDER BY e.date DESC`,
      [id]
    );

    // Get all lab tests
    const labTests = await pool.query(
      `SELECT lt.*, u.name as doctor_name
       FROM lab_tests lt
       JOIN users u ON lt.doctor_id = u.id
       WHERE lt.patient_id = $1
       ORDER BY lt.created_at DESC`,
      [id]
    );

    // Get IPD admissions
    const admissions = await pool.query(
      `SELECT ia.*, b.ward_name, b.bed_number, u.name as doctor_name
       FROM ipd_admissions ia
       JOIN beds b ON ia.bed_id = b.id
       JOIN users u ON ia.admitting_doctor_id = u.id
       WHERE ia.patient_id = $1
       ORDER BY ia.admission_date DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        encounters: encounters.rows,
        labTests: labTests.rows,
        admissions: admissions.rows
      }
    });
  } catch (error) {
    console.error('Get patient history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
