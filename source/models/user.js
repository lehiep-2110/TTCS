const db = require('../config/database');

class User {
    async getUserByUsername(username) {
        try {
            const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
            return rows[0];
        } catch (err) {
            console.error('Lỗi getUserByUsername:', err);
            throw err;
        }
    }

    async getUserByEmail(email) {
        try {
            const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            return rows[0];
        } catch (err) {
            console.error('Lỗi getUserByEmail:', err);
            throw err;
        }
    }

    async getUserById(userId) {
        try {
            const query = `
                SELECT user_id, username, email, password, full_name, phone, address, role, created_at, updated_at
                FROM users 
                WHERE user_id = ?
            `;
            
            const [rows] = await db.query(query, [userId]);
            return rows.length > 0 ? rows[0] : null;
        } catch (err) {
            console.error('Lỗi getUserById:', err);
            throw err;
        }
    }

    async createUser(userData) {
        const { username, email, password, full_name, phone, address, role } = userData;
        try {
            const userRole = role || 'customer';
            
            const query = `
                INSERT INTO users (username, email, password, full_name, phone, address, role, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            `;
            const [result] = await db.query(query, [
                username, 
                email, 
                password, 
                full_name, 
                phone || null, 
                address || null, 
                userRole
            ]);
            
            return {
                user_id: result.insertId,
                username,
                email,
                full_name,
                phone: phone || null,
                address: address || null,
                role: userRole
            };
        } catch (err) {
            console.error('Lỗi createUser:', err);
            throw err;
        }
    }

    async updateUserProfile(userId, userData) {
        const { username, email, full_name, phone, address } = userData;
        try {
            const query = `
                UPDATE users 
                SET username = ?, email = ?, full_name = ?, phone = ?, address = ?, updated_at = NOW()
                WHERE user_id = ?
            `;
            const params = [username, email, full_name, phone, address, userId];
            
            console.log('Updating user profile:', { userId, userData });
            
            const [result] = await db.query(query, params);
            return result;
        } catch (err) {
            console.error('Lỗi updateUserProfile:', err);
            throw err;
        }
    }

    // Cập nhật method updateUser để handle password correctly
    async updateUser(userId, userData) {
        const { username, email, full_name, password, role, phone, address } = userData;
        try {
            let query, params;
            
            // FIX: Đảm bảo role có giá trị hợp lệ
            const userRole = role || 'customer';
            
            if (password) {
                // Có mật khẩu mới - update tất cả
                query = `
                    UPDATE users 
                    SET username = ?, email = ?, full_name = ?, password = ?, role = ?, phone = ?, address = ?, updated_at = NOW()
                    WHERE user_id = ?
                `;
                params = [username, email, full_name, password, userRole, phone || null, address || null, userId];
                console.log('Updating user with password change');
            } else {
                // Không có mật khẩu mới - update trừ password
                query = `
                    UPDATE users 
                    SET username = ?, email = ?, full_name = ?, role = ?, phone = ?, address = ?, updated_at = NOW()
                    WHERE user_id = ?
                `;
                params = [username, email, full_name, userRole, phone || null, address || null, userId];
                console.log('Updating user without password change');
            }
            
            const [result] = await db.query(query, params);
            return result;
        } catch (err) {
            console.error('Lỗi updateUser:', err);
            throw err;
        }
    }

    async getAllUsers() {
        try {
            const [rows] = await db.query(`
                SELECT user_id, username, email, full_name, phone, address, role, created_at 
                FROM users 
                ORDER BY created_at DESC
            `);
            return rows;
        } catch (err) {
            console.error('Lỗi getAllUsers:', err);
            throw err;
        }
    }

    async deleteUser(userId) {
        try {
            const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [userId]);
            return result;
        } catch (err) {
            console.error('Lỗi deleteUser:', err);
            throw err;
        }
    }

    async isUsernameTaken(username) {
        try {
            const [rows] = await db.query('SELECT user_id FROM users WHERE username = ?', [username]);
            return rows.length > 0;
        } catch (err) {
            console.error('Lỗi isUsernameTaken:', err);
            throw err;
        }
    }

    async isEmailTaken(email) {
        try {
            const [rows] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
            return rows.length > 0;
        } catch (err) {
            console.error('Lỗi isEmailTaken:', err);
            throw err;
        }
    }

    async isUsernameTakenByOther(username, userId) {
        try {
            const [rows] = await db.query('SELECT user_id FROM users WHERE username = ? AND user_id != ?', [username, userId]);
            return rows.length > 0;
        } catch (err) {
            console.error('Lỗi isUsernameTakenByOther:', err);
            throw err;
        }
    }

    async isEmailTakenByOther(email, userId) {
        try {
            const [rows] = await db.query('SELECT user_id FROM users WHERE email = ? AND user_id != ?', [email, userId]);
            return rows.length > 0;
        } catch (err) {
            console.error('Lỗi isEmailTakenByOther:', err);
            throw err;
        }
    }

    async updatePassword(userId, hashedPassword) {
        try {
            const query = `
                UPDATE users 
                SET password = ?, updated_at = NOW()
                WHERE user_id = ?
            `;
            
            const [result] = await db.query(query, [hashedPassword, userId]);
            
            if (result.affectedRows === 0) {
                throw new Error('Không tìm thấy user để cập nhật mật khẩu');
            }
            
            return result;
        } catch (err) {
            console.error('Lỗi updatePassword:', err);
            throw err;
        }
    }
}

module.exports = new User();
