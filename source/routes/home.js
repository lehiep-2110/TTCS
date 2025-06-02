// source/routes/homeRoutes.js
const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController'); // Import controller



// Route cho trang chủ (home)
router.get('/', homeController.getHomePage); // Sử dụng controller để xử lý yêu cầu

module.exports = router;
