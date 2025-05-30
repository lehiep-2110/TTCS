// Middleware yêu cầu đăng nhập
const requireAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    } else {
        // Lưu URL hiện tại để redirect sau khi đăng nhập
        req.session.redirectTo = req.originalUrl;
        return res.redirect('/login?error=Vui lòng đăng nhập để tiếp tục');
    }
};

// Middleware chỉ cho phép guest (chưa đăng nhập)
const requireGuest = (req, res, next) => {
    if (req.session && req.session.user) {
        // Đã đăng nhập rồi, redirect về trang phù hợp
        if (req.session.user.role === 'admin') {
            return res.redirect('/admin');
        } else {
            return res.redirect('/');
        }
    } else {
        return next();
    }
};

// Middleware yêu cầu quyền admin
const requireAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    } else {
        if (!req.session.user) {
            // Chưa đăng nhập
            req.session.redirectTo = req.originalUrl;
            return res.redirect('/login?error=Vui lòng đăng nhập để truy cập trang quản trị');
        } else {
            // Đã đăng nhập nhưng không phải admin
            return res.status(403).render('error/403', { 
                message: 'Chỉ admin mới có quyền truy cập trang này',
                pageTitle: '403 - Không có quyền'
            });
        }
    }
};

// Middleware kiểm tra owner hoặc admin (cho edit profile, orders...)
const requireOwnerOrAdmin = (req, res, next) => {
    if (!req.session.user) {
        req.session.redirectTo = req.originalUrl;
        return res.redirect('/login?error=Vui lòng đăng nhập để tiếp tục');
    }

    const userId = req.params.id || req.params.userId;
    const currentUser = req.session.user;

    // Admin có thể truy cập tất cả
    if (currentUser.role === 'admin') {
        return next();
    }

    // User chỉ có thể truy cập tài khoản của mình
    if (currentUser.user_id == userId) {
        return next();
    }

    return res.status(403).render('error/403', {
        message: 'Bạn không có quyền truy cập tài nguyên này',
        pageTitle: '403 - Không có quyền'
    });
};

// Middleware kiểm tra user có đang đăng nhập không (không redirect, chỉ set flag)
const checkAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        res.locals.isAuthenticated = true;
        res.locals.user = req.session.user;
        res.locals.isAdmin = req.session.user.role === 'admin';
    } else {
        res.locals.isAuthenticated = false;
        res.locals.user = null;
        res.locals.isAdmin = false;
    }
    next();
};

// Middleware optional auth (có thể đăng nhập hoặc không)
const optionalAuth = (req, res, next) => {
    // Chỉ set thông tin user nếu đã đăng nhập, không redirect
    if (req.session && req.session.user) {
        res.locals.isAuthenticated = true;
        res.locals.user = req.session.user;
        res.locals.isAdmin = req.session.user.role === 'admin';
    } else {
        res.locals.isAuthenticated = false;
        res.locals.user = null;
        res.locals.isAdmin = false;
    }
    next();
};

module.exports = {
    requireAuth,
    requireGuest,
    requireAdmin,
    requireOwnerOrAdmin,
    checkAuth,
    optionalAuth
};