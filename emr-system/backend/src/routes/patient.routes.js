import { Router } from 'express';
import { 
  createPatient, 
  getAllPatients, 
  getPatientById, 
  getPatientByUhid,
  updatePatient,
  getPatientHistory,
  getPatientStats
} from '../controllers/patient.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { 
  createPatientValidation, 
  updatePatientValidation, 
  uuidParamValidation,
  paginationValidation 
} from '../middleware/validation.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/patients
 * @desc    Get all patients with pagination and search
 * @access  Private (All roles)
 */
router.get('/', paginationValidation, getAllPatients);

/**
 * @route   GET /api/patients/stats
 * @desc    Get patient statistics for dashboard
 * @access  Private (Admin, FrontDesk)
 */
router.get('/stats', authorize(['Admin', 'FrontDesk']), getPatientStats);

/**
 * @route   POST /api/patients
 * @desc    Create new patient
 * @access  Private (Admin, FrontDesk, Doctor)
 */
router.post('/', authorize(['Admin', 'FrontDesk', 'Doctor']), createPatientValidation, createPatient);

/**
 * @route   GET /api/patients/uhid/:uhid
 * @desc    Get patient by UHID
 * @access  Private (All roles)
 */
router.get('/uhid/:uhid', getPatientByUhid);

/**
 * @route   GET /api/patients/:id
 * @desc    Get patient by ID
 * @access  Private (All roles)
 */
router.get('/:id', uuidParamValidation, getPatientById);

/**
 * @route   GET /api/patients/:id/history
 * @desc    Get patient's visit history
 * @access  Private (Doctor, Nurse)
 */
router.get('/:id/history', authorize(['Doctor', 'Nurse', 'Admin']), getPatientHistory);

/**
 * @route   PUT /api/patients/:id
 * @desc    Update patient
 * @access  Private (Admin, FrontDesk, Doctor)
 */
router.put('/:id', authorize(['Admin', 'FrontDesk', 'Doctor']), updatePatientValidation, updatePatient);

export default router;
