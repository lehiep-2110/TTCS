const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

// User profile routes
router.get('/profile', requireAuth, userController.getProfile);
router.post('/profile', requireAuth, userController.updateProfile);
router.post('/change-password', requireAuth, userController.changePassword);
module.exports = router;