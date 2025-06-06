const Order = require('../models/order');
const Cart = require('../models/cart');
const User = require('../models/user');

class OrderController {
    async getOrders(req, res) {
        try {
            const userId = req.session.user.user_id;
            const orders = await Order.getOrdersByUserId(userId);
            
            res.render('client/order/orders', {
                pageTitle: 'Đơn hàng của tôi',
                orders,
                user: req.session.user
            });
        } catch (error) {
            console.error('Lỗi getOrders:', error);
            res.status(500).send('Lỗi server');
        }
    }

    // THÊM: Lấy chi tiết đơn hàng cho user
    async getOrderDetail(req, res) {
        try {
            const orderId = req.params.id;
            const userId = req.session.user.user_id;
            
            const order = await Order.getOrderById(orderId);
            
            // Kiểm tra đơn hàng có thuộc về user này không
            if (!order || order.user_id !== userId) {
                return res.status(404).render('client/error/404', {
                    pageTitle: 'Không tìm thấy',
                    message: 'Đơn hàng không tồn tại hoặc bạn không có quyền xem'
                });
            }

            res.render('client/order/order-detail', {
                pageTitle: `Đơn hàng #${order.order_id}`,
                order,
                user: req.session.user
            });
        } catch (error) {
            console.error('Lỗi getOrderDetail:', error);
            res.status(500).send('Lỗi server');
        }
    }
    
    async cancelOrder(req, res) {
        try {
            const orderId = req.params.id;
            const userId = req.session.user.user_id;
            
            const order = await Order.getOrderById(orderId);
            
            // Kiểm tra quyền và trạng thái đơn hàng
            if (!order || order.user_id !== userId) {
                return res.redirect('/orders?error=Không tìm thấy đơn hàng');
            }
            
            if (order.status !== 'pending') {
                return res.redirect('/orders?error=Không thể hủy đơn hàng này');
            }
            
            await Order.updateOrderStatus(orderId, 'cancelled');
            
            res.redirect('/orders?success=Đã hủy đơn hàng thành công');
        } catch (error) {
            console.error('Lỗi cancelOrder:', error);
            res.redirect('/orders?error=Không thể hủy đơn hàng');
        }
    }

    async getCheckoutPage(req, res) {
        try {
            const userId = req.session.user.user_id;
            const cartItems = await Cart.getCartByUserId(userId);
            const cartTotal = await Cart.getCartTotal(userId);
            
            if (cartItems.length === 0) {
                return res.redirect('/cart?error=Giỏ hàng trống');
            }
            
            const user = await User.getUserById(userId);
            
            res.render('client/order/checkout', {
                pageTitle: 'Thanh toán',
                cartItems,
                cartTotal,
                user,
                error: req.query.error || null,
                success: req.query.success || null
            });
        } catch (error) {
            console.error('Lỗi checkout page:', error);
            res.redirect('/cart?error=Không thể tải trang thanh toán');
        }
    }
    
    async processCheckout(req, res) {
        try {
            const userId = req.session.user.user_id;
            const { shipping_address, phone, notes, payment_method } = req.body;
            
            if (!shipping_address || !phone) {
                return res.redirect('/cart/checkout?error=Vui lòng nhập đầy đủ địa chỉ và số điện thoại');
            }

            const phoneRegex = /^[0-9]{10,11}$/;
            if (!phoneRegex.test(phone)) {
                return res.redirect('/cart/checkout?error=Số điện thoại không hợp lệ');
            }
            
            const cartItems = await Cart.getCartByUserId(userId);
            if (cartItems.length === 0) {
                return res.redirect('/cart?error=Giỏ hàng trống');
            }
            
            const cartTotal = await Cart.getCartTotal(userId);
            
            const orderData = {
                user_id: userId,
                total_amount: cartTotal,
                shipping_address,
                phone,
                notes,
                payment_method: payment_method || 'cod',
                items: cartItems.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price
                }))
            };
            
            const result = await Order.createOrder(orderData);
            
            req.session.cartCount = 0;
            
            res.redirect(`/cart/checkout/success?order=${result.order_id}`);
            
        } catch (error) {
            console.error('Lỗi process checkout:', error);
            if (error.message.includes('không đủ hàng')) {
                res.redirect('/cart/checkout?error=' + error.message);
            } else {
                res.redirect('/cart/checkout?error=Đặt hàng thất bại, vui lòng thử lại');
            }
        }
    }
    
    async getCheckoutSuccess(req, res) {
        try {
            const orderId = req.query.order;
            
            if (orderId) {
                const order = await Order.getOrderById(orderId);
                
                if (order && order.user_id === req.session.user.user_id) {
                    return res.render('client/order/success', {
                        pageTitle: 'Đặt hàng thành công',
                        order
                    });
                }
            }
            
            res.render('client/order/success', {
                pageTitle: 'Đặt hàng thành công',
                order: null
            });
            
        } catch (error) {
            console.error('Lỗi checkout success:', error);
            res.render('client/order/success', {
                pageTitle: 'Đặt hàng thành công',
                order: null
            });
        }
    }
    
    async getAdminOrderPage(req, res) {
        try {
            const orders = await Order.getAllOrders();
            res.render('admin/order/order', {
                pageTitle: 'Quản lý đơn hàng',
                orders
            });
        } catch (error) {
            console.error('Lỗi admin orders:', error);
            res.status(500).send('Lỗi server');
        }
    }
    
    async getAdminOrderDetail(req, res) {
        try {
            const orderId = req.params.id;
            const order = await Order.getOrderById(orderId);
            
            if (!order) {
                return res.status(404).send('Đơn hàng không tồn tại');
            }
            
            res.render('admin/order/detail', {
                pageTitle: 'Chi tiết đơn hàng',
                order
            });
        } catch (error) {
            console.error('Lỗi admin order detail:', error);
            res.status(500).send('Lỗi server');
        }
    }
    
    async updateOrderStatus(req, res) {
        try {
            const orderId = req.params.id;
            const { status } = req.body;
            
            await Order.updateOrderStatus(orderId, status);
            res.redirect(`/admin/orders/${orderId}?success=Cập nhật trạng thái thành công`);
            
        } catch (error) {
            console.error('Lỗi update order status:', error);
            res.redirect(`/admin/orders/${req.params.id}?error=Cập nhật thất bại`);
        }
    }
}

module.exports = new OrderController();