const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Patient routes - accessible by most roles
router.get('/', authorize(['Admin', 'Doctor', 'Nurse', 'FrontDesk', 'LabTechnician', 'Pharmacist']), patientController.getAllPatients);
router.post('/', authorize(['Admin', 'Doctor', 'FrontDesk']), patientController.createPatient);
router.get('/search', patientController.searchPatients);
router.get('/search/:uhid', patientController.getPatientByUhid);
router.get('/:id', patientController.getPatientById);
router.put('/:id', authorize(['Admin', 'Doctor', 'FrontDesk']), patientController.updatePatient);
router.get('/:id/history', authorize(['Admin', 'Doctor']), patientController.getPatientHistory);

module.exports = router;
