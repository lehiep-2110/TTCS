const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireGuest } = require('../middleware/auth');

// GET /login
router.get('/', requireGuest, authController.getLoginPage);

// POST /login  
router.post('/', requireGuest, authController.handleLogin);

// Logout routes
router.get('/logout', authController.logout);
router.post('/logout', authController.logout);

module.exports = router;
