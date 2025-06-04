const bcrypt = require('bcrypt');
const User = require('../models/user');
const Product = require('../models/product');

class AdminController {


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

    async handleAddUser(req, res) {
        try {
            const { username, email, password, full_name, role, phone, address } = req.body;

            // Validation
            if (!username || !email || !password || !full_name) {
                return res.status(400).send('Vui lòng nhập đầy đủ thông tin bắt buộc');
            }

            if (password.length < 6) {
                return res.status(400).send('Mật khẩu phải có ít nhất 6 ký tự');
            }

            const isUsernameExists = await User.isUsernameTaken(username);
            if (isUsernameExists) {
                return res.status(400).send('Username đã tồn tại');
            }

            const isEmailExists = await User.isEmailTaken(email);
            if (isEmailExists) {
                return res.status(400).send('Email đã tồn tại');
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const userData = {
                username,
                email,
                password: hashedPassword, 
                full_name,
                role: role || 'customer',
                phone: phone || null,
                address: address || null
            };

            console.log('Admin creating user with hashed password');
            await User.createUser(userData);
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

    async handleEditUser(req, res) {
        try {
            const userId = req.params.id;
            const { username, email, full_name, role, phone, address, password } = req.body;

            // Check conflicts
            const isUsernameExists = await User.isUsernameTakenByOther(username, userId);
            if (isUsernameExists) {
                return res.status(400).send('Username đã tồn tại');
            }

            const isEmailExists = await User.isEmailTakenByOther(email, userId);
            if (isEmailExists) {
                return res.status(400).send('Email đã tồn tại');
            }
            let userData = {
                username,
                email,
                full_name,
                role: role || 'customer',
                phone: phone || null,
                address: address || null
            };
            if (password && password.trim() !== '') {
                if (password.length < 6) {
                    return res.status(400).send('Mật khẩu phải có ít nhất 6 ký tự');
                }
                userData.password = await bcrypt.hash(password, 10);
                console.log('Admin updating user with new hashed password');
            }

            await User.updateUser(userId, userData);
            res.redirect('/admin/users');
        } catch (error) {
            console.error('Lỗi cập nhật user:', error);
            res.status(500).send('Lỗi server');
        }
    }

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

            const products = await Product.getAllProductsForAdmin();
            res.render('admin/product/product', { 
                products,
                pageTitle: 'Quản lý sản phẩm'
            });
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
            const product = await Product.getProductByIdForAdmin(req.params.id);
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

    async handleRestoreProduct(req, res) {
        try {
            const productId = req.params.id;
            await Product.restoreProduct(productId);
            res.redirect('/admin/products');
        } catch (error) {
            console.error('Lỗi khôi phục product:', error);
            res.redirect('/admin/products');
        }
    }
}

module.exports = new AdminController();
