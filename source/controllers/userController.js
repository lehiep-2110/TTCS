const User = require('../models/user');
const Order = require('../models/order');

class UserController {
    async getProfile(req, res) {
        try {
            const user = await User.getUserById(req.session.user.user_id);
            res.render('client/user/profile', {
                pageTitle: 'Hồ sơ cá nhân',
                user: user,
                success: req.query.success || null,
                error: req.query.error || null
            });
        } catch (error) {
            console.error('Lỗi lấy profile:', error);
            res.redirect('/?error=Không thể tải hồ sơ');
        }
    }

    async updateProfile(req, res) {
        try {
            const userId = req.session.user.user_id;
            const { username, email, full_name, phone, address } = req.body;

            if (!username || !email || !full_name) {
                return res.redirect('/login/profile?error=Vui lòng nhập đầy đủ thông tin bắt buộc');
            }

            // Check conflicts
            const usernameExists = await User.isUsernameTakenByOther(username, userId);
            if (usernameExists) {
                return res.redirect('/login/profile?error=Tên đăng nhập đã được sử dụng');
            }

            const emailExists = await User.isEmailTakenByOther(email, userId);
            if (emailExists) {
                return res.redirect('/login/profile?error=Email đã được sử dụng');
            }

            await User.updateUser(userId, { username, email, full_name, phone, address });
            
            // Update session
            req.session.user.username = username;
            req.session.user.email = email;
            req.session.user.full_name = full_name;
            req.session.user.phone = phone;
            req.session.user.address = address;
            
            res.redirect('/login/profile?success=Cập nhật thành công');
        } catch (error) {
            console.error('Lỗi cập nhật profile:', error);
            res.redirect('/login/profile?error=Cập nhật thất bại');
        }
    }

    async getOrders(req, res) {
        try {
            const userId = req.session.user.user_id;
            const orders = await Order.getOrdersByUserId(userId);
            
            res.render('client/user/orders', {
                pageTitle: 'Đơn hàng của tôi',
                orders,
                user: req.session.user // Thêm user info
            });
        } catch (error) {
            console.error('Lỗi get orders:', error);
            res.render('client/user/orders', {
                pageTitle: 'Đơn hàng của tôi',
                orders: [],
                user: req.session.user
            });
        }
    }

    async getOrderDetail(req, res) {
        try {
            const orderId = req.params.id;
            const userId = req.session.user.user_id;
            const order = await Order.getOrderById(orderId);
            
            if (!order || order.user_id !== userId) {
                return res.status(404).render('client/user/order-detail', {
                    pageTitle: 'Chi tiết đơn hàng',
                    order: null
                });
            }
            
            res.render('client/user/order-detail', {
                pageTitle: `Chi tiết đơn hàng #${order.order_id}`,
                order
            });
        } catch (error) {
            console.error('Lỗi get order detail:', error);
            res.status(500).render('client/user/order-detail', {
                pageTitle: 'Chi tiết đơn hàng',
                order: null
            });
        }
    }
}

module.exports = new UserController();