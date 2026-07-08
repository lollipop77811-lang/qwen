const express = require('express');
const router = express.Router();
const pdfService = require('../services/pdfService');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Generate prescription PDF
router.get('/prescription/:encounter_id', authorize(['Admin', 'Doctor', 'Pharmacist']), pdfService.generatePrescriptionPDF);

// Generate discharge summary PDF
router.get('/discharge-summary/:admission_id', authorize(['Admin', 'Doctor', 'Nurse']), pdfService.generateDischargeSummaryPDF);

// Generate lab report PDF
router.get('/lab-report/:lab_test_id', authorize(['Admin', 'Doctor', 'LabTechnician']), pdfService.generateLabReportPDF);

module.exports = router;
