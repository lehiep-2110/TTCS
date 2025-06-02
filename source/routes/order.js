const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireAuth } = require('../middleware/auth');

// Order routes for users
router.get('/', requireAuth, orderController.getOrders);                    // Danh sách đơn hàng
router.get('/:id', requireAuth, orderController.getOrderDetail);            // Chi tiết đơn hàng
router.post('/:id/cancel', requireAuth, orderController.cancelOrder);       // Hủy đơn hàng


module.exports = router;