const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// /product - danh sách sản phẩm
router.get('/', productController.getShopPage);

// /product/:id - chi tiết sản phẩm
router.get('/:id', productController.getProductDetail);

module.exports = router;
