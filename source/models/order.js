const db = require('../config/database');

class Order {
    // Tạo đơn hàng mới
    async createOrder(orderData) {
        // SỬA: Thêm phone và notes vào destructuring
        const { user_id, total_amount, shipping_address, phone, notes, payment_method, items } = orderData;
        
        try {
            // Bắt đầu transaction
            await db.query('START TRANSACTION');
            
            // SỬA: Thêm phone và notes vào INSERT query
            const orderQuery = `
                INSERT INTO orders (user_id, total_amount, shipping_address, phone, notes, status, created_at) 
                VALUES (?, ?, ?, ?, ?, 'pending', NOW())
            `;
            const [orderResult] = await db.query(orderQuery, [user_id, total_amount, shipping_address, phone, notes]);
            const orderId = orderResult.insertId;
            
            // Thêm order items
            for (const item of items) {
                const itemQuery = `
                    INSERT INTO order_details (order_id, product_id, quantity, price, subtotal) 
                    VALUES (?, ?, ?, ?, ?)
                `;
                const subtotal = item.price * item.quantity;
                await db.query(itemQuery, [orderId, item.product_id, item.quantity, item.price, subtotal]);
                
                // QUAN TRỌNG: Kiểm tra và cập nhật stock - BỎ COMMENT
                // const stockCheck = await db.query('SELECT stock FROM products WHERE product_id = ?', [item.product_id]);
                // if (stockCheck[0][0].stock < item.quantity) {
                //     throw new Error(`Sản phẩm ${item.product_id} không đủ hàng trong kho`);
                // }
                
                // await db.query(
                //     'UPDATE products SET stock = stock - ? WHERE product_id = ?',
                //     [item.quantity, item.product_id]
                // );
            }
            
            // Xóa giỏ hàng
            await db.query('DELETE FROM cart WHERE user_id = ?', [user_id]);
            await db.query('COMMIT');
            
            return { order_id: orderId };
            
        } catch (error) {
            await db.query('ROLLBACK');
            console.error('Lỗi createOrder:', error);
            throw error;
        }
    }
    
    // Lấy đơn hàng theo user
    async getOrdersByUserId(userId) {
        try {
            const query = `
                SELECT o.*, COUNT(od.detail_id) as item_count
                FROM orders o
                LEFT JOIN order_details od ON o.order_id = od.order_id
                WHERE o.user_id = ?
                GROUP BY o.order_id
                ORDER BY o.created_at DESC
            `;
            const [rows] = await db.query(query, [userId]);
            return rows;
        } catch (error) {
            console.error('Lỗi getOrdersByUserId:', error);
            throw error;
        }
    }
    
    // Lấy chi tiết đơn hàng
    async getOrderById(orderId) {
        try {
            const orderQuery = `
                SELECT o.*, u.username, u.full_name as fullname, u.email, u.phone
                FROM orders o
                JOIN users u ON o.user_id = u.user_id
                WHERE o.order_id = ?
            `;
            const [orderRows] = await db.query(orderQuery, [orderId]);
            
            if (orderRows.length === 0) return null;
            
            const order = orderRows[0];
            
            // SỬA: Lấy từ order_details thay vì order_items
            const itemsQuery = `
                SELECT od.*, p.name, p.image_url
                FROM order_details od
                JOIN products p ON od.product_id = p.product_id
                WHERE od.order_id = ?
            `;
            const [itemsRows] = await db.query(itemsQuery, [orderId]);
            
            order.items = itemsRows;
            return order;
            
        } catch (error) {
            console.error('Lỗi getOrderById:', error);
            throw error;
        }
    }
    
    // Lấy tất cả đơn hàng (admin)
    async getAllOrders() {
        try {
            const query = `
                SELECT o.*, u.username, u.full_name as fullname, COUNT(od.detail_id) as item_count
                FROM orders o
                JOIN users u ON o.user_id = u.user_id
                LEFT JOIN order_details od ON o.order_id = od.order_id
                GROUP BY o.order_id
                ORDER BY o.created_at DESC
            `;
            const [rows] = await db.query(query);
            return rows;
        } catch (error) {
            console.error('Lỗi getAllOrders:', error);
            throw error;
        }
    }
    
    // Cập nhật trạng thái đơn hàng
    async updateOrderStatus(orderId, status) {
        try {
            const query = 'UPDATE orders SET status = ?, updated_at = NOW() WHERE order_id = ?';
            const [result] = await db.query(query, [status, orderId]);
            return result;
        } catch (error) {
            console.error('Lỗi updateOrderStatus:', error);
            throw error;
        }
    }
}

module.exports = new Order();