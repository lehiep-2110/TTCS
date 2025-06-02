const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// /product - danh sách sản phẩm
router.get('/', productController.getShopPage);

// Route tìm kiếm sản phẩm
router.get('/search', productController.searchProducts);

// Route chi tiết sản phẩm (phải đặt cuối cùng)
router.get('/:id', productController.getProductDetail);

module.exports = router;
