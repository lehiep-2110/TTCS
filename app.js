const express = require('express');
const session = require('express-session');
const app = express();
const path = require('path');
const route = require('./source/routes'); // index.js trong routes/
const port = 3000;
// cấu hình view engine
app.set('views', path.join(__dirname, 'source', 'views'));
app.set('view engine', 'ejs');

// cấu hình thư mục chứa file tĩnh (CSS, JS, ảnh...)
app.use(express.static(path.join(__dirname, 'source', 'public')));
app.use(express.urlencoded({ extended: true }));

// Cấu hình session
app.use(session({
    secret: 'your-secret-key', // Thay bằng secret key mạnh
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // true nếu dùng HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 giờ
    }
}));

// cấu hình router
route(app);

// chạy server
app.listen(port, () => {
    console.log(`✅ Server đang chạy tại http://localhost:${port}`);
});
