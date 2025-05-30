// source/routes/homeRoutes.js
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/homeController'); // Import controller



// Route cho trang chủ (home)
router.get('/', clientController.getHomePage); // Sử dụng controller để xử lý yêu cầu

module.exports = router;
