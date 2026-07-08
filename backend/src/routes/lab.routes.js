const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Lab test routes
router.post('/', authorize(['Doctor']), labController.createLabTest);
router.get('/', authorize(['Admin', 'Doctor', 'LabTechnician']), labController.getAllLabTests);
router.get('/patient/:patient_id', authorize(['Admin', 'Doctor', 'LabTechnician']), labController.getLabTestsByPatient);
router.get('/pending', authorize(['Doctor']), labController.getPendingLabTests);
router.put('/:id/status', authorize(['Admin', 'Doctor', 'LabTechnician']), labController.updateLabTestStatus);
router.put('/:id/results', authorize(['LabTechnician']), labController.submitResults);
router.put('/:id/approve', authorize(['Doctor', 'Admin']), labController.approveReport);

module.exports = router;
