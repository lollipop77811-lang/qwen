const express = require('express');
const router = express.Router();
const ipdController = require('../controllers/ipdController');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// IPD admission routes
router.post('/admit', authorize(['Doctor', 'Admin']), ipdController.admitPatient);
router.get('/admissions', authorize(['Admin', 'Doctor', 'Nurse']), ipdController.getActiveAdmissions);
router.get('/admissions/:id', authorize(['Admin', 'Doctor', 'Nurse']), ipdController.getAdmissionById);
router.put('/admissions/:id/transfer', authorize(['Doctor', 'Admin']), ipdController.transferBed);
router.put('/admissions/:id/discharge', authorize(['Doctor']), ipdController.dischargePatient);
router.get('/stats', authorize(['Admin', 'Doctor', 'Nurse']), ipdController.getIpdStats);

module.exports = router;
