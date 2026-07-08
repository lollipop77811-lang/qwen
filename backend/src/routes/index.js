const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const patientRoutes = require('./patient.routes');
const appointmentRoutes = require('./appointment.routes');
const encounterRoutes = require('./encounter.routes');
const prescriptionRoutes = require('./prescription.routes');
const labRoutes = require('./lab.routes');
const ipdRoutes = require('./ipd.routes');
const inventoryRoutes = require('./inventory.routes');
const bedRoutes = require('./bed.routes');
const vitalsRoutes = require('./vitals.routes');
const adminRoutes = require('./admin.routes');
const reportsRoutes = require('./reports.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/patients', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/encounters', encounterRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/lab-tests', labRoutes);
router.use('/ipd', ipdRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/beds', bedRoutes);
router.use('/vitals', vitalsRoutes);
router.use('/admin', adminRoutes);
router.use('/reports', reportsRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router;
