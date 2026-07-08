const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Prescription routes
router.post('/', authorize(['Doctor']), prescriptionController.createPrescription);
router.get('/encounter/:encounter_id', authorize(['Admin', 'Doctor', 'Pharmacist']), prescriptionController.getPrescriptionsByEncounter);
router.get('/patient/:patient_id', authorize(['Admin', 'Doctor', 'Pharmacist']), prescriptionController.getPrescriptionsByPatient);
router.delete('/:id', authorize(['Doctor']), prescriptionController.deletePrescription);

// Template routes for doctors
router.post('/templates', authorize(['Doctor']), prescriptionController.saveTemplate);
router.get('/templates', authorize(['Doctor']), prescriptionController.getTemplates);
router.delete('/templates/:id', authorize(['Doctor']), prescriptionController.deleteTemplate);

module.exports = router;
