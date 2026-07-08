const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected routes (middleware applied in server.js)
router.get('/profile', authController.getProfile);
router.put('/password', authController.updatePassword);
router.post('/logout', authController.logout);

module.exports = router;
