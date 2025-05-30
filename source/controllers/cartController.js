const Cart = require('../models/cart');
const Product = require('../models/product');

class CartController {
    // Hiển thị giỏ hàng - hỗ trợ guest
    async viewCart(req, res) {
        try {
            let cartItems = [];
            let cartTotal = 0;
            let cartItemCount = 0;

            if (req.session.user) {
                // User đã đăng nhập - lấy từ DB
                const userId = req.session.user.user_id;
                cartItems = await Cart.getCartByUserId(userId);
                cartTotal = await Cart.getCartTotal(userId);
                cartItemCount = await Cart.getCartItemCount(userId);
            } else {
                // Guest - lấy từ session
                const guestCart = req.session.guestCart || [];
                
                if (guestCart.length > 0) {
                    const productIds = guestCart.map(item => item.product_id);
                    const products = await Cart.getProductsForGuestCart(productIds);
                    
                    // Combine guest cart với product info
                    cartItems = guestCart.map(guestItem => {
                        const product = products.find(p => p.product_id == guestItem.product_id);
                        if (product) {
                            return {
                                ...product,
                                quantity: guestItem.quantity,
                                subtotal: product.price * guestItem.quantity,
                                created_at: guestItem.created_at
                            };
                        }
                        return null;
                    }).filter(item => item !== null);

                    cartTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
                    cartItemCount = guestCart.reduce((sum, item) => sum + item.quantity, 0);
                }
            }

            res.render('client/cart/cart', { 
                cartItems, 
                cartTotal,
                cartItemCount,
                pageTitle: 'Giỏ hàng',
                success: req.query.success,
                error: req.query.error,
                isGuest: !req.session.user
            });
        } catch (err) {
            console.error('Lỗi hiển thị giỏ hàng:', err);
            res.status(500).send('Lỗi server');
        }
    }

    // Thêm sản phẩm vào giỏ hàng - hỗ trợ guest
    async addToCart(req, res) {
        try {
            const productId = parseInt(req.params.id);
            const quantity = parseInt(req.body.quantity) || 1;

            // Kiểm tra sản phẩm có tồn tại không
            const product = await Product.getProductById(productId);
            if (!product) {
                return res.redirect('back?error=Sản phẩm không tồn tại');
            }

            if (product.status !== 'active') {
                return res.redirect('back?error=Sản phẩm hiện không khả dụng');
            }

            if (req.session.user) {
                // User đã đăng nhập - lưu vào DB
                const userId = req.session.user.user_id;
                await Cart.addToCart(userId, productId, quantity);
                req.session.cartCount = await Cart.getCartItemCount(userId);
            } else {
                // Guest - lưu vào session
                if (!req.session.guestCart) {
                    req.session.guestCart = [];
                }

                const existingItemIndex = req.session.guestCart.findIndex(
                    item => item.product_id === productId
                );

                if (existingItemIndex >= 0) {
                    // Tăng số lượng
                    req.session.guestCart[existingItemIndex].quantity += quantity;
                } else {
                    // Thêm mới
                    req.session.guestCart.push({
                        product_id: productId,
                        quantity: quantity,
                        created_at: new Date()
                    });
                }

                // Cập nhật cart count cho guest
                req.session.cartCount = req.session.guestCart.reduce(
                    (sum, item) => sum + item.quantity, 0
                );
            }

            // Redirect với thông báo thành công
            const referer = req.get('Referer') || '/cart';
            const separator = referer.includes('?') ? '&' : '?';
            res.redirect(`${referer}${separator}success=Đã thêm vào giỏ hàng`);

        } catch (err) {
            console.error('Lỗi thêm vào giỏ hàng:', err);
            res.redirect('back?error=Không thể thêm vào giỏ hàng');
        }
    }

    // Cập nhật số lượng - hỗ trợ guest
    async updateCart(req, res) {
        try {
            // SỬA: Đổi từ productId sang product_id để match với form
            const productId = parseInt(req.body.product_id); // Thay đổi từ productId
            const quantity = parseInt(req.body.quantity);

            if (!productId || !quantity) {
                return res.redirect('/cart?error=Dữ liệu không hợp lệ');
            }

            if (req.session.user) {
                const userId = req.session.user.user_id;
                await Cart.updateQuantity(userId, productId, quantity);
                req.session.cartCount = await Cart.getCartItemCount(userId);
            } else {
                if (req.session.guestCart) {
                    const itemIndex = req.session.guestCart.findIndex(
                        item => item.product_id === productId
                    );

                    if (itemIndex >= 0) {
                        if (quantity <= 0) {
                            req.session.guestCart.splice(itemIndex, 1);
                        } else {
                            req.session.guestCart[itemIndex].quantity = quantity;
                        }

                        req.session.cartCount = req.session.guestCart.reduce(
                            (sum, item) => sum + item.quantity, 0
                        );
                    }
                }
            }

            res.redirect('/cart?success=Đã cập nhật giỏ hàng');

        } catch (err) {
            console.error('Lỗi cập nhật giỏ hàng:', err);
            res.redirect('/cart?error=Không thể cập nhật');
        }
    }

    // Xóa sản phẩm - hỗ trợ guest
    async removeFromCart(req, res) {
        try {
            const productId = parseInt(req.params.id);

            if (req.session.user) {
                // User đã đăng nhập
                const userId = req.session.user.user_id;
                await Cart.removeFromCart(userId, productId);
                req.session.cartCount = await Cart.getCartItemCount(userId);
            } else {
                // Guest
                if (req.session.guestCart) {
                    req.session.guestCart = req.session.guestCart.filter(
                        item => item.product_id !== productId
                    );

                    req.session.cartCount = req.session.guestCart.reduce(
                        (sum, item) => sum + item.quantity, 0
                    );
                }
            }

            res.redirect('/cart?success=Đã xóa sản phẩm');

        } catch (err) {
            console.error('Lỗi xóa sản phẩm:', err);
            res.redirect('/cart?error=Không thể xóa');
        }
    }

    // Xóa toàn bộ giỏ hàng - hỗ trợ guest
    async clearCart(req, res) {
        try {
            if (req.session.user) {
                // User đã đăng nhập
                const userId = req.session.user.user_id;
                await Cart.clearCart(userId);
            } else {
                // Guest
                req.session.guestCart = [];
            }

            req.session.cartCount = 0;
            res.redirect('/cart?success=Đã xóa toàn bộ giỏ hàng');

        } catch (err) {
            console.error('Lỗi xóa giỏ hàng:', err);
            res.redirect('/cart?error=Không thể xóa giỏ hàng');
        }
    }
}

module.exports = new CartController();