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
            const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [userId]);
            return rows[0];
        } catch (err) {
            console.error('Lỗi getUserById:', err);
            throw err;
        }
    }

    async createUser(userData) {
        // SỬA: Sử dụng full_name thay vì fullname
        const { username, email, password, full_name, phone, address, role } = userData;
        try {
            const query = `
                INSERT INTO users (username, email, password, full_name, phone, address, role, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            `;
            const [result] = await db.query(query, [username, email, password, full_name, phone || null, address || null, role]);
            
            return {
                user_id: result.insertId,
                username,
                email,
                full_name,
                role
            };
        } catch (err) {
            console.error('Lỗi createUser:', err);
            throw err;
        }
    }

    async updateUser(userId, userData) {
        // SỬA: Sử dụng full_name thay vì fullname
        const { username, email, full_name, password, role, phone, address } = userData;
        try {
            let query, params;
            
            if (password) {
                query = `
                    UPDATE users 
                    SET username = ?, email = ?, full_name = ?, password = ?, role = ?, phone = ?, address = ?, updated_at = NOW()
                    WHERE user_id = ?
                `;
                params = [username, email, full_name, password, role, phone, address, userId];
            } else {
                query = `
                    UPDATE users 
                    SET username = ?, email = ?, full_name = ?, role = ?, phone = ?, address = ?, updated_at = NOW()
                    WHERE user_id = ?
                `;
                params = [username, email, full_name, role, phone, address, userId];
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
}

module.exports = new User();
