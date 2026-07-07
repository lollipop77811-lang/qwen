import { Router } from 'express';
import { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  getDoctors,
  getUserStats 
} from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { updateUserValidation, uuidParamValidation, paginationValidation } from '../middleware/validation.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination and filtering
 * @access  Private/Admin
 */
router.get('/', authorize('Admin'), paginationValidation, getAllUsers);

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics for dashboard
 * @access  Private/Admin
 */
router.get('/stats', authorize('Admin'), getUserStats);

/**
 * @route   GET /api/users/doctors
 * @desc    Get active doctors list
 * @access  Private
 */
router.get('/doctors', getDoctors);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin or self)
 */
router.get('/:id', uuidParamValidation, getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin or self)
 */
router.put('/:id', authorize(['Admin']), updateUserValidation, updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete (deactivate) user
 * @access  Private/Admin
 */
router.delete('/:id', authorize('Admin'), uuidParamValidation, deleteUser);

export default router;
