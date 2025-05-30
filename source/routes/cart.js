const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const { requireAuth } = require('../middleware/auth');

// Cart routes
router.get('/', cartController.viewCart);
router.post('/add/:id', cartController.addToCart);
router.post('/update', cartController.updateCart);
router.post('/remove/:id', cartController.removeFromCart);
router.post('/clear', cartController.clearCart);

// ⚠️ SỬA: Checkout routes
router.get('/checkout', requireAuth, orderController.getCheckoutPage);
router.post('/checkout', requireAuth, orderController.processCheckout);
router.get('/checkout/success', requireAuth, orderController.getCheckoutSuccess);

module.exports = router;