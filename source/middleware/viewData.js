const Cart = require('../models/cart');

const setViewData = async (req, res, next) => {
    try {
        // Thông tin user
        res.locals.user = req.session.user || null;
        res.locals.isAuthenticated = !!req.session.user;
        res.locals.isAdmin = req.session.user?.role === 'admin';
        
        // Cart count
        if (req.session.user) {
            // User đã đăng nhập - lấy từ DB
            if (req.session.cartCount === undefined) {
                const cartCount = await Cart.getCartItemCount(req.session.user.user_id);
                req.session.cartCount = cartCount;
            }
            res.locals.cartCount = req.session.cartCount;
        } else {
            // Guest - lấy từ session
            const guestCart = req.session.guestCart || [];
            const cartCount = guestCart.reduce((sum, item) => sum + item.quantity, 0);
            req.session.cartCount = cartCount;
            res.locals.cartCount = cartCount;
        }
        
        // Global variables
        res.locals.currentPath = req.path;
        res.locals.success = req.query.success || null;
        res.locals.error = req.query.error || null;

        // Helper function để build pagination URL
        res.locals.buildPaginationUrl = function(page) {
            const url = new URL(req.originalUrl, `${req.protocol}://${req.get('host')}`);
            url.searchParams.set('page', page);
            return url.pathname + url.search;
        };
        
        next();
    } catch (error) {
        console.error('Lỗi middleware viewData:', error);
        res.locals.user = null;
        res.locals.isAuthenticated = false;
        res.locals.isAdmin = false;
        res.locals.cartCount = 0;
        res.locals.currentPath = req.path;
        next();
    }
};

module.exports = setViewData;