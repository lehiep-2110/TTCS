const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireGuest } = require('../middleware/auth');

// GET /signup - hiển thị form đăng ký
router.get('/', requireGuest, authController.getRegisterPage);

// POST /signup - xử lý đăng ký
router.post('/', requireGuest, authController.handleRegister);

module.exports = router;
