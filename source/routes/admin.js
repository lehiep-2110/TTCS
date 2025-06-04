const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const orderController = require('../controllers/orderController');
const { requireAdmin } = require('../middleware/auth');

// Tất cả routes admin đều cần xác thực admin
router.use(requireAdmin);

// GET /admin - dashboard
router.get('/', adminController.getAdminUserPage);


// === USER MANAGEMENT ===
router.get('/users', adminController.getAdminUserPage);
router.get('/users/add', adminController.showAddUserForm);
router.post('/users/add', adminController.handleAddUser); 
router.get('/users/edit/:id', adminController.showEditUserForm);
router.post('/users/edit/:id', adminController.handleEditUser); 
router.post('/users/delete/:id', adminController.handleDeleteUser); 

// === PRODUCT MANAGEMENT ===
router.get('/products', adminController.getAdminProductPage);
router.get('/products/add', adminController.showAddProductForm);
router.post('/products/add', adminController.handleAddProduct);
router.get('/products/edit/:id', adminController.showEditProductForm);
router.post('/products/edit/:id', adminController.handleEditProduct);
router.post('/products/delete/:id', adminController.handleDeleteProduct);
router.post('/products/restore/:id', adminController.handleRestoreProduct);

// === ORDER MANAGEMENT ===
router.get('/orders', orderController.getAdminOrderPage);
router.get('/orders/:id', orderController.getAdminOrderDetail);
router.post('/orders/:id/status', orderController.updateOrderStatus);

// === CATEGORY MANAGEMENT ===
// router.get('/categories', adminController.getAdminCategoryPage);
// router.get('/categories/add', adminController.showAddCategoryForm);
// router.post('/categories/add', adminController.addCategory);
// router.get('/categories/edit/:id', adminController.showEditCategoryForm);
// router.post('/categories/edit/:id', adminController.updateCategory);
// router.post('/categories/delete/:id', adminController.deleteCategory);

module.exports = router;