const express = require('express');
const router = express.Router();
const encounterController = require('../controllers/encounterController');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Encounter routes - mainly for doctors
router.post('/', authorize(['Doctor']), encounterController.createEncounter);
router.get('/patient/:patient_id', authorize(['Admin', 'Doctor', 'Nurse']), encounterController.getEncountersByPatient);
router.get('/today', authorize(['Doctor']), encounterController.getTodayEncounters);
router.get('/:id', authorize(['Admin', 'Doctor', 'Nurse']), encounterController.getEncounterById);
router.put('/:id', authorize(['Doctor']), encounterController.updateEncounter);

module.exports = router;
