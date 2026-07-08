const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

// Generate Prescription PDF
exports.generatePrescriptionPDF = async (req, res) => {
  try {
    const { encounter_id } = req.params;

    // Get encounter details with prescriptions
    const encounterResult = await pool.query(
      `SELECT e.*, p.name as patient_name, p.uhid, p.dob, p.gender, p.phone,
              u.name as doctor_name
       FROM encounters e
       JOIN patients p ON e.patient_id = p.id
       JOIN users u ON e.doctor_id = u.id
       WHERE e.id = $1`,
      [encounter_id]
    );

    if (encounterResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Encounter not found' });
    }

    const encounter = encounterResult.rows[0];

    // Get prescriptions
    const prescriptions = await pool.query(
      'SELECT * FROM prescriptions WHERE encounter_id = $1 ORDER BY created_at',
      [encounter_id]
    );

    // Get hospital settings
    const settingsResult = await pool.query('SELECT * FROM hospital_settings ORDER BY id DESC LIMIT 1');
    const hospital = settingsResult.rows[0] || {
      hospital_name: 'Health Care Hospital',
      address: '123 Medical Street, City',
      phone: '+1 234 567 8900',
      email: 'info@hospital.com'
    };

    // Create PDF
    const doc = new PDFDocument({ margin: 40 });
    const filename = `prescription_${encounter.uhid}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../../uploads/pdfs', filename);

    // Ensure uploads directory exists
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text(hospital.hospital_name, { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(hospital.address, { align: 'center' });
    doc.text(`Phone: ${hospital.phone} | Email: ${hospital.email}`, { align: 'center' });
    doc.moveDown();
    doc.lineWidth(1).moveTo(40, doc.y).lineTo(570, doc.y).stroke();
    doc.moveDown();

    // Patient Info
    doc.fontSize(12).font('Helvetica-Bold').text('PRESCRIPTION', { align: 'center' });
    doc.moveDown(0.5);
    
    doc.fontSize(10).font('Helvetica');
    doc.text(`Patient Name: ${encounter.patient_name}`, { continued: true });
    doc.text(`UHID: ${encounter.uhid}`, { align: 'right' });
    
    doc.text(`Age/Gender: ${calculateAge(encounter.dob)}/${encounter.gender}`);
    doc.text(`Date: ${new Date(encounter.date).toLocaleDateString()}`);
    doc.text(`Phone: ${encounter.phone}`);
    doc.text(`Doctor: Dr. ${encounter.doctor_name}`);
    doc.moveDown();

    // Clinical Notes
    if (encounter.chief_complaints) {
      doc.font('Helvetica-Bold').text('Chief Complaints:');
      doc.font('Helvetica').text(encounter.chief_complaints);
      doc.moveDown(0.5);
    }

    if (encounter.diagnosis) {
      doc.font('Helvetica-Bold').text('Diagnosis:');
      doc.font('Helvetica').text(encounter.diagnosis);
      doc.moveDown(0.5);
    }

    // Prescriptions
    doc.font('Helvetica-Bold').text('Medications:', { underline: true });
    doc.moveDown(0.5);

    prescriptions.rows.forEach((med, index) => {
      doc.font('Helvetica-Bold').text(`${index + 1}. ${med.medicine_name}`);
      doc.font('Helvetica').text(`   Dosage: ${med.dosage}`);
      if (med.frequency) doc.text(`   Frequency: ${med.frequency}`);
      if (med.duration) doc.text(`   Duration: ${med.duration}`);
      if (med.instructions) doc.text(`   Instructions: ${med.instructions}`);
      doc.moveDown(0.3);
    });

    // Footer
    doc.moveDown(2);
    doc.lineWidth(0.5).moveTo(40, doc.y).lineTo(570, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(8).font('Helvetica').text('This is a computer-generated prescription.', { align: 'center' });
    doc.text('For verification, scan the QR code or visit our website.', { align: 'center' });
    
    // Add QR code placeholder (in production, use a QR library)
    doc.rect(480, doc.y - 20, 80, 80).stroke();
    doc.fontSize(6).text('QR Code', { align: 'center' });

    doc.end();

    stream.on('finish', () => {
      res.download(filePath, filename, (err) => {
        if (err) console.error('Download error:', err);
        // Optionally delete file after download
        // fs.unlinkSync(filePath);
      });
    });

  } catch (error) {
    console.error('Generate prescription PDF error:', error);
    res.status(500).json({ success: false, message: 'Error generating PDF' });
  }
};

// Generate Discharge Summary PDF
exports.generateDischargeSummaryPDF = async (req, res) => {
  try {
    const { admission_id } = req.params;

    // Get admission details
    const admissionResult = await pool.query(
      `SELECT ia.*, p.name as patient_name, p.uhid, p.dob, p.gender, p.blood_group, p.phone,
              b.ward_name, b.bed_number, u.name as doctor_name
       FROM ipd_admissions ia
       JOIN patients p ON ia.patient_id = p.id
       JOIN beds b ON ia.bed_id = b.id
       JOIN users u ON ia.admitting_doctor_id = u.id
       WHERE ia.id = $1`,
      [admission_id]
    );

    if (admissionResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }

    const admission = admissionResult.rows[0];

    // Get vitals during stay
    const vitals = await pool.query(
      `SELECT * FROM patient_vitals WHERE admission_id = $1 ORDER BY recorded_at`,
      [admission_id]
    );

    // Get hospital settings
    const settingsResult = await pool.query('SELECT * FROM hospital_settings ORDER BY id DESC LIMIT 1');
    const hospital = settingsResult.rows[0] || {
      hospital_name: 'Health Care Hospital',
      address: '123 Medical Street, City',
      phone: '+1 234 567 8900'
    };

    // Create PDF
    const doc = new PDFDocument({ margin: 40 });
    const filename = `discharge_summary_${admission.uhid}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../../uploads/pdfs', filename);

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text(hospital.hospital_name, { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(hospital.address, { align: 'center' });
    doc.text(`Phone: ${hospital.phone}`, { align: 'center' });
    doc.moveDown();
    doc.lineWidth(1).moveTo(40, doc.y).lineTo(570, doc.y).stroke();
    doc.moveDown();

    // Title
    doc.fontSize(16).font('Helvetica-Bold').text('DISCHARGE SUMMARY', { align: 'center', underline: true });
    doc.moveDown();

    // Patient Information
    doc.font('Helvetica-Bold').fontSize(12).text('PATIENT INFORMATION');
    doc.font('Helvetica').fontSize(10);
    doc.text(`Name: ${admission.patient_name}`);
    doc.text(`UHID: ${admission.uhid}`);
    doc.text(`Age/Gender: ${calculateAge(admission.dob)}/${admission.gender}`);
    doc.text(`Blood Group: ${admission.blood_group || 'N/A'}`);
    doc.text(`Phone: ${admission.phone}`);
    doc.moveDown();

    // Admission Details
    doc.font('Helvetica-Bold').fontSize(12).text('ADMISSION DETAILS');
    doc.font('Helvetica').fontSize(10);
    doc.text(`Ward: ${admission.ward_name}`);
    doc.text(`Bed: ${admission.bed_number}`);
    doc.text(`Admitting Doctor: Dr. ${admission.doctor_name}`);
    doc.text(`Admission Date: ${new Date(admission.admission_date).toLocaleString()}`);
    if (admission.discharge_date) {
      doc.text(`Discharge Date: ${new Date(admission.discharge_date).toLocaleString()}`);
    }
    doc.moveDown();

    // Diagnosis
    if (admission.diagnosis) {
      doc.font('Helvetica-Bold').fontSize(12).text('DIAGNOSIS');
      doc.font('Helvetica').fontSize(10);
      doc.text(admission.diagnosis);
      doc.moveDown();
    }

    // Hospital Course
    if (admission.admission_notes) {
      doc.font('Helvetica-Bold').fontSize(12).text('HOSPITAL COURSE');
      doc.font('Helvetica').fontSize(10);
      doc.text(admission.admission_notes);
      doc.moveDown();
    }

    // Treatment Given
    if (admission.treatment_given) {
      doc.font('Helvetica-Bold').fontSize(12).text('TREATMENT GIVEN');
      doc.font('Helvetica').fontSize(10);
      doc.text(admission.treatment_given);
      doc.moveDown();
    }

    // Discharge Medications
    if (admission.discharge_medications) {
      doc.font('Helvetica-Bold').fontSize(12).text('DISCHARGE MEDICATIONS');
      doc.font('Helvetica').fontSize(10);
      doc.text(admission.discharge_medications);
      doc.moveDown();
    }

    // Follow-up Instructions
    if (admission.follow_up_instructions) {
      doc.font('Helvetica-Bold').fontSize(12).text('FOLLOW-UP INSTRUCTIONS');
      doc.font('Helvetica').fontSize(10);
      doc.text(admission.follow_up_instructions);
      doc.moveDown();
    }

    if (admission.follow_up_date) {
      doc.font('Helvetica-Bold').fontSize(12).text('FOLLOW-UP DATE');
      doc.font('Helvetica').fontSize(10);
      doc.text(new Date(admission.follow_up_date).toLocaleDateString());
      doc.moveDown();
    }

    // Discharge Summary
    if (admission.discharge_summary) {
      doc.font('Helvetica-Bold').fontSize(12).text('DISCHARGE SUMMARY');
      doc.font('Helvetica').fontSize(10);
      doc.text(admission.discharge_summary);
      doc.moveDown();
    }

    // Footer
    doc.moveDown(2);
    doc.lineWidth(0.5).moveTo(40, doc.y).lineTo(570, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(8).font('Helvetica').text('Thank you for choosing our hospital.', { align: 'center' });
    doc.text('For any queries, please contact us at ' + hospital.phone, { align: 'center' });

    doc.end();

    stream.on('finish', () => {
      res.download(filePath, filename, (err) => {
        if (err) console.error('Download error:', err);
      });
    });

  } catch (error) {
    console.error('Generate discharge summary PDF error:', error);
    res.status(500).json({ success: false, message: 'Error generating PDF' });
  }
};

// Helper function to calculate age
function calculateAge(dob) {
  if (!dob) return 'N/A';
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Generate Lab Report PDF
exports.generateLabReportPDF = async (req, res) => {
  try {
    const { lab_test_id } = req.params;

    const result = await pool.query(
      `SELECT lt.*, p.name as patient_name, p.uhid, p.dob, p.gender,
              u.name as doctor_name
       FROM lab_tests lt
       JOIN patients p ON lt.patient_id = p.id
       JOIN users u ON lt.doctor_id = u.id
       WHERE lt.id = $1`,
      [lab_test_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lab test not found' });
    }

    const test = result.rows[0];

    // Get hospital settings
    const settingsResult = await pool.query('SELECT * FROM hospital_settings ORDER BY id DESC LIMIT 1');
    const hospital = settingsResult.rows[0] || {
      hospital_name: 'Health Care Hospital',
      address: '123 Medical Street, City',
      phone: '+1 234 567 8900'
    };

    const doc = new PDFDocument({ margin: 40 });
    const filename = `lab_report_${test.uhid}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../../uploads/pdfs', filename);

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text(hospital.hospital_name, { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('PATHOLOGY LABORATORY REPORT', { align: 'center' });
    doc.text(hospital.address, { align: 'center' });
    doc.text(`Phone: ${hospital.phone}`, { align: 'center' });
    doc.moveDown();
    doc.lineWidth(1).moveTo(40, doc.y).lineTo(570, doc.y).stroke();
    doc.moveDown();

    // Patient Info
    doc.font('Helvetica').fontSize(10);
    doc.text(`Patient Name: ${test.patient_name}`, { continued: true });
    doc.text(`UHID: ${test.uhid}`, { align: 'right' });
    doc.text(`Age/Gender: ${calculateAge(test.dob)}/${test.gender}`);
    doc.text(`Test: ${test.test_name}`);
    doc.text(`Date: ${new Date(test.created_at).toLocaleDateString()}`);
    doc.text(`Referring Doctor: Dr. ${test.doctor_name}`);
    doc.moveDown();

    // Results
    doc.font('Helvetica-Bold').fontSize(12).text('TEST RESULTS');
    doc.font('Helvetica').fontSize(10);
    doc.moveDown(0.5);

    if (test.result) {
      doc.text(`Result: ${test.result}`);
    }
    if (test.ref_range) {
      doc.text(`Reference Range: ${test.ref_range}`);
    }
    if (test.abnormal_flags) {
      doc.font('Helvetica-Bold').text('Abnormal Flags:', { color: '#FF0000' });
      doc.font('Helvetica').text(test.abnormal_flags);
    }
    if (test.notes) {
      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').text('Notes:');
      doc.font('Helvetica').text(test.notes);
    }

    // Status
    doc.moveDown(1);
    doc.font('Helvetica-Bold').text(`Status: ${test.status.toUpperCase()}`);

    // Footer
    doc.moveDown(2);
    doc.lineWidth(0.5).moveTo(40, doc.y).lineTo(570, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(8).font('Helvetica').text('This report is electronically generated.', { align: 'center' });

    doc.end();

    stream.on('finish', () => {
      res.download(filePath, filename, (err) => {
        if (err) console.error('Download error:', err);
      });
    });

  } catch (error) {
    console.error('Generate lab report PDF error:', error);
    res.status(500).json({ success: false, message: 'Error generating PDF' });
  }
};
