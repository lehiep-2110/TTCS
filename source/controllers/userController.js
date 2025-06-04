const User = require('../models/user');
const Order = require('../models/order');
const bcrypt = require('bcrypt');

class UserController {
    async getProfile(req, res) {
        try {
            const user = await User.getUserById(req.session.user.user_id);
            res.render('client/user/profile', {
                pageTitle: 'Profile',
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
                return res.redirect('/user/profile?error=Vui lòng nhập đầy đủ thông tin bắt buộc');
            }

            // Check conflicts
            const usernameExists = await User.isUsernameTakenByOther(username, userId);
            if (usernameExists) {
                return res.redirect('/user/profile?error=Tên đăng nhập đã được sử dụng');
            }

            const emailExists = await User.isEmailTakenByOther(email, userId);
            if (emailExists) {
                return res.redirect('/user/profile?error=Email đã được sử dụng');
            }

            // FIX: Chỉ update thông tin cá nhân, KHÔNG update role
            await User.updateUserProfile(userId, { 
                username, 
                email, 
                full_name, 
                phone: phone || null, 
                address: address || null 
            });
            
            // Update session
            req.session.user.username = username;
            req.session.user.email = email;
            req.session.user.full_name = full_name;
            req.session.user.phone = phone || null;
            req.session.user.address = address || null;
            // QUAN TRỌNG: KHÔNG update role trong session
            
            res.redirect('/user/profile?success=Cập nhật thành công');
        } catch (error) {
            console.error('Lỗi cập nhật profile:', error);
            res.redirect('/user/profile?error=Cập nhật thất bại');
        }
    }

    async changePassword(req, res) {
        try {
            const userId = req.session.user.user_id;
            const { currentPassword, newPassword, confirmPassword } = req.body;

            // Validation đơn giản
            if (!currentPassword || !newPassword || !confirmPassword) {
                return res.redirect('/user/profile?error=Vui lòng nhập đầy đủ thông tin');
            }

            if (newPassword.length < 6) {
                return res.redirect('/user/profile?error=Mật khẩu mới phải có ít nhất 6 ký tự');
            }

            if (newPassword !== confirmPassword) {
                return res.redirect('/user/profile?error=Mật khẩu mới và xác nhận mật khẩu không khớp');
            }

            // Lấy thông tin user từ database
            const user = await User.getUserById(userId);
            if (!user) {
                return res.redirect('/user/profile?error=Không tìm thấy thông tin người dùng');
            }

            // Kiểm tra mật khẩu hiện tại có đúng không
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return res.redirect('/user/profile?error=Mật khẩu hiện tại không đúng');
            }

            // Hash mật khẩu mới và cập nhật
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            await User.updatePassword(userId, hashedNewPassword);

            res.redirect('/user/profile?success=Đổi mật khẩu thành công');

        } catch (error) {
            console.error('Lỗi đổi mật khẩu:', error);
            res.redirect('/user/profile?error=Lỗi server, vui lòng thử lại');
        }
    }
}

module.exports = new UserController();