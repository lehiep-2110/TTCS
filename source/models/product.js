const db = require('../config/database');

class Product {
    // THÊM method này - QUAN TRỌNG
    async getAllCategories() {
        try {
            const [rows] = await db.query('SELECT * FROM category ORDER BY category_name');
            return rows;
        } catch (error) {
            console.error('Lỗi getAllCategories:', error);
            throw error;
        }
    }

    async getAllProducts() {
        try {
            const query = `
                SELECT p.*, c.category_name 
                FROM products p
                LEFT JOIN category c ON p.category_id = c.category_id
                WHERE p.status = 'active'
                ORDER BY p.created_at DESC
            `;
            const [rows] = await db.query(query);
            return rows;
        } catch (error) {
            console.error('Lỗi getAllProducts:', error);
            throw error;
        }
    }

    async getProductById(id) {
        try {
            const query = `
                SELECT p.*, c.category_name 
                FROM products p
                LEFT JOIN category c ON p.category_id = c.category_id
                WHERE p.product_id = ? AND p.status = 'active'
            `;
            const [rows] = await db.query(query, [id]);
            return rows[0];
        } catch (error) {
            console.error('Lỗi getProductById:', error);
            throw error;
        }
    }

    async getProductsByCategory(categoryId) {
        try {
            const query = `
                SELECT p.*, c.category_name 
                FROM products p
                LEFT JOIN category c ON p.category_id = c.category_id
                WHERE p.category_id = ? AND p.status = 'active'
                ORDER BY p.created_at DESC
            `;
            const [rows] = await db.query(query, [categoryId]);
            return rows;
        } catch (error) {
            console.error('Lỗi getProductsByCategory:', error);
            throw error;
        }
    }

    async searchProducts(keyword) {
        try {
            const query = `
                SELECT p.*, c.category_name 
                FROM products p
                LEFT JOIN category c ON p.category_id = c.category_id
                WHERE (p.name LIKE ? OR p.description LIKE ?) AND p.status = 'active'
                ORDER BY p.created_at DESC
            `;
            const searchTerm = `%${keyword}%`;
            const [rows] = await db.query(query, [searchTerm, searchTerm]);
            return rows;
        } catch (error) {
            console.error('Lỗi searchProducts:', error);
            throw error;
        }
    }

    // THÊM methods cho admin
    async createProduct(productData) {
        const { name, price, stock, category_id, description, image_url } = productData;
        try {
            const query = `
                INSERT INTO products (name, price, stock, category_id, description, image_url, status, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())
            `;
            const [result] = await db.query(query, [name, price, stock, category_id, description, image_url]);
            return result;
        } catch (error) {
            console.error('Lỗi createProduct:', error);
            throw error;
        }
    }

    async updateProduct(productId, productData) {
        const { name, price, stock, category_id, description, image_url, status } = productData;
        try {
            const query = `
                UPDATE products 
                SET name = ?, price = ?, stock = ?, category_id = ?, description = ?, image_url = ?, status = ?
                WHERE product_id = ?
            `;
            const [result] = await db.query(query, [name, price, stock, category_id, description, image_url, status, productId]);
            return result;
        } catch (error) {
            console.error('Lỗi updateProduct:', error);
            throw error;
        }
    }

    async deleteProduct(productId) {
        try {
            // Soft delete
            const query = 'UPDATE products SET status = "deleted" WHERE product_id = ?';
            const [result] = await db.query(query, [productId]);
            return result;
        } catch (error) {
            console.error('Lỗi deleteProduct:', error);
            throw error;
        }
    }
}

module.exports = new Product();
