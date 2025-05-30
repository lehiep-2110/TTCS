const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireGuest, requireAuth } = require('../middleware/auth');

// GET /login
router.get('/', requireGuest, authController.getLoginPage);
// POST /login  
router.post('/', requireGuest, authController.handleLogin);

// Logout routes
router.get('/logout', authController.logout);
router.post('/logout', authController.logout);

// User profile routes
router.get('/profile', requireAuth, require('../controllers/userController').getProfile);
router.post('/profile', requireAuth, require('../controllers/userController').updateProfile);

// Order routes
router.get('/orders', requireAuth, require('../controllers/userController').getOrders);
router.get('/orders/:id', requireAuth, require('../controllers/userController').getOrderDetail);

module.exports = router;
