const User = require('../models/user');
const Cart = require('../models/cart');
const bcrypt = require('bcrypt');

class AuthController {
    getLoginPage(req, res) {
        res.render('auth/login', { 
            pageTitle: 'Đăng nhập',
            error: req.query.error || null,
            success: req.query.success || null
        });
    }

    async handleLogin(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.render('auth/login', {
                    error: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu',
                    pageTitle: 'Đăng nhập'
                });
            }

            const user = await User.getUserByUsername(username);
            if (!user) {
                return res.render('auth/login', {
                    error: 'Tên đăng nhập hoặc mật khẩu không đúng',
                    pageTitle: 'Đăng nhập'
                });
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.render('auth/login', {
                    error: 'Tên đăng nhập hoặc mật khẩu không đúng',
                    pageTitle: 'Đăng nhập'
                });
            }

            // SỬA: Sử dụng full_name thay vì fullname
            req.session.user = {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                phone: user.phone,
                address: user.address,
                role: user.role
            };

            // Merge guest cart
            if (req.session.guestCart && req.session.guestCart.length > 0) {
                try {
                    await Cart.mergeGuestCartToUser(req.session.guestCart, user.user_id);
                    delete req.session.guestCart;
                } catch (cartError) {
                    console.error('Lỗi merge cart:', cartError);
                }
            }

            try {
                req.session.cartCount = await Cart.getCartItemCount(user.user_id);
            } catch (cartError) {
                console.error('Lỗi get cart count:', cartError);
                req.session.cartCount = 0;
            }

            const redirectTo = req.session.redirectTo || (user.role === 'admin' ? '/admin' : '/');
            delete req.session.redirectTo;
            
            res.redirect(redirectTo);

        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            res.render('auth/login', {
                error: 'Lỗi server, vui lòng thử lại',
                pageTitle: 'Đăng nhập'
            });
        }
    }

    logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Lỗi đăng xuất:', err);
                return res.redirect('/');
            }
            res.redirect('/');
        });
    }

    getRegisterPage(req, res) {
        res.render('auth/register', {
            pageTitle: 'Đăng ký',
            error: req.query.error || null,
            success: req.query.success || null
        });
    }

    async handleRegister(req, res) {
        try {
            // SỬA: Sử dụng full_name thay vì fullname, thêm phone, address
            const { username, email, password, confirmPassword, full_name, phone, address } = req.body;

            if (!username || !email || !password || !confirmPassword || !full_name) {
                return res.render('auth/register', {
                    error: 'Vui lòng nhập đầy đủ thông tin bắt buộc',
                    pageTitle: 'Đăng ký'
                });
            }

            if (password !== confirmPassword) {
                return res.render('auth/register', {
                    error: 'Mật khẩu xác nhận không khớp',
                    pageTitle: 'Đăng ký'
                });
            }

            if (password.length < 6) {
                return res.render('auth/register', {
                    error: 'Mật khẩu phải có ít nhất 6 ký tự',
                    pageTitle: 'Đăng ký'
                });
            }

            const existingUserByUsername = await User.getUserByUsername(username);
            if (existingUserByUsername) {
                return res.render('auth/register', {
                    error: 'Tên đăng nhập đã được sử dụng',
                    pageTitle: 'Đăng ký'
                });
            }

            const existingUserByEmail = await User.getUserByEmail(email);
            if (existingUserByEmail) {
                return res.render('auth/register', {
                    error: 'Email đã được sử dụng',
                    pageTitle: 'Đăng ký'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await User.createUser({
                username,
                email,
                password: hashedPassword,
                full_name,
                phone,
                address,
                role: 'customer'
            });

            req.session.user = {
                user_id: newUser.user_id,
                username: newUser.username,
                email: newUser.email,
                full_name: newUser.full_name,
                role: newUser.role
            };

            // Merge guest cart
            if (req.session.guestCart && req.session.guestCart.length > 0) {
                try {
                    await Cart.mergeGuestCartToUser(req.session.guestCart, newUser.user_id);
                    delete req.session.guestCart;
                } catch (cartError) {
                    console.error('Lỗi merge cart for new user:', cartError);
                }
            }

            try {
                req.session.cartCount = await Cart.getCartItemCount(newUser.user_id);
            } catch (cartError) {
                console.error('Lỗi get cart count for new user:', cartError);
                req.session.cartCount = 0;
            }

            res.redirect('/');

        } catch (error) {
            console.error('Lỗi đăng ký:', error);
            res.render('auth/register', {
                error: 'Lỗi server, vui lòng thử lại',
                pageTitle: 'Đăng ký'
            });
        }
    }
}

module.exports = new AuthController();