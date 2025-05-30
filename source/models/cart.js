const db = require('../config/database');

class Cart {
    // Lấy giỏ hàng user
    async getCartByUserId(userId) {
        if (!userId) return [];
        
        const query = `
            SELECT c.cart_id, c.user_id, c.product_id, c.quantity, c.created_at,
                   p.name, p.price, p.image_url, p.description, p.status,
                   cat.category_name,
                   (c.quantity * p.price) as subtotal
            FROM cart c 
            JOIN products p ON c.product_id = p.product_id 
            JOIN category cat ON p.category_id = cat.category_id
            WHERE c.user_id = ? AND p.status = 'active'
            ORDER BY c.created_at DESC
        `;
        const [rows] = await db.query(query, [userId]);
        return rows;
    }

    // Alias method
    async getCartItems(userId) {
        return await this.getCartByUserId(userId);
    }

    // Lấy thông tin sản phẩm cho guest cart
    async getProductsForGuestCart(productIds) {
        if (!productIds || productIds.length === 0) return [];
        
        const placeholders = productIds.map(() => '?').join(',');
        const query = `
            SELECT p.product_id, p.name, p.price, p.image_url, p.description,
                   cat.category_name
            FROM products p
            JOIN category cat ON p.category_id = cat.category_id
            WHERE p.product_id IN (${placeholders}) AND p.status = 'active'
        `;
        const [rows] = await db.query(query, productIds);
        return rows;
    }

    // QUAN TRỌNG: Merge guest cart vào user cart khi đăng nhập
    async mergeGuestCartToUser(guestCart, userId) {
        try {
            console.log(`Merging ${guestCart.length} guest cart items to user ${userId}`);
            
            for (const guestItem of guestCart) {
                const { product_id, quantity } = guestItem;
                
                // Kiểm tra sản phẩm đã có trong cart user chưa
                const existingItem = await this.getCartItem(userId, product_id);
                
                if (existingItem) {
                    // Nếu đã có thì cộng dồn số lượng
                    const newQuantity = existingItem.quantity + quantity;
                    await this.updateQuantity(userId, product_id, newQuantity);
                    console.log(`Updated existing item ${product_id}: ${existingItem.quantity} + ${quantity} = ${newQuantity}`);
                } else {
                    // Nếu chưa có thì thêm mới
                    await this.addToCart(userId, product_id, quantity);
                    console.log(`Added new item ${product_id} with quantity ${quantity}`);
                }
            }
            
            console.log('Guest cart merge completed successfully');
        } catch (error) {
            console.error('Lỗi merge guest cart:', error);
            throw error;
        }
    }

    // Lấy 1 item cụ thể trong giỏ hàng
    async getCartItem(userId, productId) {
        try {
            const query = 'SELECT * FROM cart WHERE user_id = ? AND product_id = ?';
            const [rows] = await db.query(query, [userId, productId]);
            return rows[0];
        } catch (error) {
            console.error('Lỗi getCartItem:', error);
            throw error;
        }
    }

    // Thêm sản phẩm vào giỏ hàng
    async addToCart(userId, productId, quantity = 1) {
        try {
            // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
            const existingItem = await this.getCartItem(userId, productId);
            
            if (existingItem) {
                // Nếu đã có thì tăng số lượng
                const newQuantity = existingItem.quantity + quantity;
                return await this.updateQuantity(userId, productId, newQuantity);
            } else {
                // Nếu chưa có thì thêm mới
                const query = `
                    INSERT INTO cart (user_id, product_id, quantity, created_at) 
                    VALUES (?, ?, ?, NOW())
                `;
                const [result] = await db.query(query, [userId, productId, quantity]);
                return result;
            }
        } catch (error) {
            console.error('Lỗi addToCart:', error);
            throw error;
        }
    }

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    async updateQuantity(userId, productId, quantity) {
        try {
            const query = 'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?';
            const [result] = await db.query(query, [quantity, userId, productId]);
            return result;
        } catch (error) {
            console.error('Lỗi updateQuantity:', error);
            throw error;
        }
    }

    // Xóa sản phẩm khỏi giỏ hàng
    async removeFromCart(userId, productId) {
        try {
            const query = 'DELETE FROM cart WHERE user_id = ? AND product_id = ?';
            const [result] = await db.query(query, [userId, productId]);
            return result;
        } catch (error) {
            console.error('Lỗi removeFromCart:', error);
            throw error;
        }
    }

    // Xóa toàn bộ giỏ hàng
    async clearCart(userId) {
        try {
            const query = 'DELETE FROM cart WHERE user_id = ?';
            const [result] = await db.query(query, [userId]);
            return result;
        } catch (error) {
            console.error('Lỗi clearCart:', error);
            throw error;
        }
    }

    // Đếm số lượng items trong giỏ hàng
    async getCartItemCount(userId) {
        try {
            const query = 'SELECT SUM(quantity) as total FROM cart WHERE user_id = ?';
            const [rows] = await db.query(query, [userId]);
            return rows[0].total || 0;
        } catch (error) {
            console.error('Lỗi getCartItemCount:', error);
            throw error;
        }
    }

    // Tính tổng tiền giỏ hàng
    async getCartTotal(userId) {
        try {
            const query = `
                SELECT SUM(c.quantity * p.price) as total
                FROM cart c 
                JOIN products p ON c.product_id = p.product_id 
                WHERE c.user_id = ? AND p.status = 'active'
            `;
            const [rows] = await db.query(query, [userId]);
            return rows[0].total || 0;
        } catch (error) {
            console.error('Lỗi getCartTotal:', error);
            throw error;
        }
    }
}

module.exports = new Cart();