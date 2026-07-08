const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

// Admin only routes
router.get('/', authorize(['Admin']), userController.getAllUsers);
router.post('/', authorize(['Admin']), userController.createUser);
router.get('/doctors', userController.getDoctors);

// Individual user routes
router.get('/:id', authorize(['Admin', 'Doctor']), userController.getUserById);
router.put('/:id', authorize(['Admin']), userController.updateUser);
router.delete('/:id', authorize(['Admin']), userController.deleteUser);

module.exports = router;
