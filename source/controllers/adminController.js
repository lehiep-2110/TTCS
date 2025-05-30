const User = require('../models/user');
const Product = require('../models/product');

class AdminController {
    getAdminPage(req, res) {
        try {
            res.render('admin/dashboard/dashboard', {
                pageTitle: 'Admin Dashboard',
                user: req.session.user
            });
        } catch (error) {
            console.error('Lỗi load admin dashboard:', error);
            res.status(500).render('error/500', {
                pageTitle: '500 - Lỗi server'
            });
        }
    }

    async getAdminUserPage(req, res) {
        try {
            const users = await User.getAllUsers();
            res.render('admin/user/user', { users });
        } catch (error) {
            console.error('Lỗi lấy danh sách user:', error);
            res.status(500).send('Lỗi server');
        }
    }

    async showAddUserForm(req, res) {
        const roles = [
            { value: 'admin', label: 'Admin' },
            { value: 'customer', label: 'Khách hàng' }
        ];
        res.render('admin/user/add', { roles });
    }

    // SỬA: Đổi tên method để match với routes
    async handleAddUser(req, res) {
        try {
            const { username, email } = req.body;

            const isUsernameExists = await User.isUsernameTaken(username);
            if (isUsernameExists) {
                return res.status(400).send('Username đã tồn tại');
            }

            const isEmailExists = await User.isEmailTaken(email);
            if (isEmailExists) {
                return res.status(400).send('Email đã tồn tại');
            }

            await User.createUser(req.body);
            res.redirect('/admin/users');
        } catch (error) {
            console.error('Lỗi thêm user:', error);
            res.status(500).send('Lỗi server');
        }
    }

    async showEditUserForm(req, res) {
        try {
            const user = await User.getUserById(req.params.id);
            const roles = [
                { value: 'admin', label: 'Admin' },
                { value: 'customer', label: 'Khách hàng' }
            ];
            res.render('admin/user/edit', { user, roles });
        } catch (error) {
            console.error('Lỗi lấy thông tin user:', error);
            res.status(500).send('Lỗi server');
        }
    }

    // SỬA: Đổi tên method để match với routes
    async handleEditUser(req, res) {
        try {
            const userId = req.params.id;
            const { username, email } = req.body;

            const isUsernameExists = await User.isUsernameTakenByOther(username, userId);
            if (isUsernameExists) {
                return res.status(400).send('Username đã tồn tại');
            }

            const isEmailExists = await User.isEmailTakenByOther(email, userId);
            if (isEmailExists) {
                return res.status(400).send('Email đã tồn tại');
            }

            await User.updateUser(userId, req.body);
            res.redirect('/admin/users');
        } catch (error) {
            console.error('Lỗi cập nhật user:', error);
            res.status(500).send('Lỗi server');
        }
    }

    // SỬA: Đổi tên method để match với routes
    async handleDeleteUser(req, res) {
        try {
            await User.deleteUser(req.params.id);
            res.redirect('/admin/users');
        } catch (error) {
            console.error('Lỗi xóa user:', error);
            res.status(500).send('Lỗi server');
        }
    }

    async getAdminProductPage(req, res) {
        try {
            const products = await Product.getAllProducts();
            res.render('admin/product/product', { products });
        } catch (error) {
            console.error('Lỗi lấy danh sách product:', error);
            res.status(500).send('Lỗi server');
        }
    }

    async showAddProductForm(req, res) {
        try {
            const categories = await Product.getAllCategories();
            res.render('admin/product/add', { categories });
        } catch (error) {
            console.error('Lỗi lấy categories:', error);
            res.status(500).send('Lỗi server');
        }
    }

    // SỬA: Thêm các methods cho products
    async handleAddProduct(req, res) {
        try {
            await Product.createProduct(req.body);
            res.redirect('/admin/products');
        } catch (error) {
            console.error('Lỗi thêm product:', error);
            res.status(500).send('Lỗi server');
        }
    }

    async showEditProductForm(req, res) {
        try {
            const product = await Product.getProductById(req.params.id);
            const categories = await Product.getAllCategories();
            res.render('admin/product/edit', { product, categories });
        } catch (error) {
            console.error('Lỗi lấy thông tin product:', error);
            res.status(500).send('Lỗi server');
        }
    }

    async handleEditProduct(req, res) {
        try {
            await Product.updateProduct(req.params.id, req.body);
            res.redirect('/admin/products');
        } catch (error) {
            console.error('Lỗi cập nhật product:', error);
            res.status(500).send('Lỗi server');
        }
    }

    async handleDeleteProduct(req, res) {
        try {
            await Product.deleteProduct(req.params.id);
            res.redirect('/admin/products');
        } catch (error) {
            console.error('Lỗi xóa product:', error);
            res.status(500).send('Lỗi server');
        }
    }
}

module.exports = new AdminController();
