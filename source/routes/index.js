// source/routes/index.js hoặc source/routes/route.js

const homeRouter = require('./home');
const productRouter = require('./product');
const cartRouter = require('./cart');
const loginRouter = require('./login');
const signupRouter = require('./signup');
const adminRouter = require('./admin');
const orderRouter = require('./order');
const userRouter = require('./user');
// Import middleware
const setViewData = require('../middleware/viewData');

function route(app) {
    // QUAN TRỌNG: Áp dụng middleware TRƯỚC tất cả routes
    app.use(setViewData);
    
    // Routes
    app.use('/', homeRouter);              
    app.use('/product', productRouter);    
    app.use('/cart', cartRouter);          
    app.use('/login', loginRouter);        
    app.use('/signup', signupRouter);      
    app.use('/admin', adminRouter);        
    app.use('/order', orderRouter);
    app.use('/user', userRouter);
    // 404 handler
    app.use((req, res) => {
        res.status(404).render('error/404', {
            pageTitle: '404 - Không tìm thấy trang'
        });
    });

    // Error handler
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).render('error/500', {
            pageTitle: '500 - Lỗi server'
        });
    });
}

module.exports = route;
