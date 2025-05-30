const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function createAdmin() {
    try {
        // Kết nối database
        const connection = await mysql.createConnection({
          host: 'localhost',
            user: 'root',
            password: '04118482',
            database: 'hypecake',
        });

        // Hash mật khẩu
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Xóa admin cũ (nếu có)
        await connection.query('DELETE FROM users WHERE username = ?', ['admin']);

        // Tạo admin mới
        const query = `
            INSERT INTO users (username, email, password, full_name, phone, address, role, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        await connection.query(query, [
            'admin',
            'admin@bakery.com',
            hashedPassword,
            'Quản trị viên',
            '0123456789',
            '123 Đường ABC, Quận 1, TP.HCM',
            'admin'
        ]);

        console.log('✅ Tạo tài khoản admin thành công!');
        console.log('Username: admin');
        console.log('Password: admin123');
        
        await connection.end();
    } catch (error) {
        console.error('❌ Lỗi tạo admin:', error);
    }
}

createAdmin();