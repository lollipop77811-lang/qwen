const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Appointment routes
router.post('/', authorize(['Admin', 'FrontDesk', 'Doctor']), appointmentController.createAppointment);
router.get('/doctor/:doctor_id', authorize(['Admin', 'Doctor', 'FrontDesk']), appointmentController.getAppointmentsByDoctor);
router.get('/patient/:patient_id', authorize(['Admin', 'Doctor', 'Nurse', 'FrontDesk']), appointmentController.getAppointmentsByPatient);
router.get('/queue/today', appointmentController.getTodayQueue);
router.put('/:id/status', authorize(['Admin', 'FrontDesk', 'Doctor']), appointmentController.updateAppointmentStatus);
router.put('/:id/cancel', authorize(['Admin', 'FrontDesk', 'Doctor']), appointmentController.cancelAppointment);

module.exports = router;
