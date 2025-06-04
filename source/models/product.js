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

    // Thêm method lấy tất cả sản phẩm cho admin (bao gồm cả inactive)
    async getAllProductsForAdmin() {
        try {
            const query = `
                SELECT p.*, c.category_name 
                FROM products p
                LEFT JOIN category c ON p.category_id = c.category_id
                ORDER BY p.created_at DESC
            `;
            const [rows] = await db.query(query);
            return rows;
        } catch (error) {
            console.error('Lỗi getAllProductsForAdmin:', error);
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

    // Thêm method lấy sản phẩm theo ID cho admin (không cần check status)
    async getProductByIdForAdmin(id) {
        try {
            const query = `
                SELECT p.*, c.category_name 
                FROM products p
                LEFT JOIN category c ON p.category_id = c.category_id
                WHERE p.product_id = ?
            `;
            const [rows] = await db.query(query, [id]);
            return rows[0];
        } catch (error) {
            console.error('Lỗi getProductByIdForAdmin:', error);
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
                INSERT INTO products (name, price, category_id, description, image_url, status, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW())
            `;
            const [result] = await db.query(query, [name, price, category_id, description, image_url]);
            return result;
        } catch (error) {
            console.error('Lỗi createProduct:', error);
            throw error;
        }
    }

    async updateProduct(productId, productData) {
        const { name, price, category_id, description, image_url, status } = productData;
        try {
            // Validate status
            if (status && !['active', 'inactive'].includes(status)) {
                throw new Error('Status phải là active hoặc inactive');
            }

            const query = `
                UPDATE products 
                SET name = ?, price = ?, category_id = ?, description = ?, image_url = ?, status = ?, updated_at = NOW()
                WHERE product_id = ?
            `;
            const [result] = await db.query(query, [name, price, category_id, description, image_url, status || 'active', productId]);
            return result;
        } catch (error) {
            console.error('Lỗi updateProduct:', error);
            throw error;
        }
    }

    // Sửa lại deleteProduct - chuyển status thành 'inactive'
    async deleteProduct(productId) {
        try {
            // Kiểm tra sản phẩm có tồn tại không
            const existingProduct = await this.getProductByIdForAdmin(productId);
            if (!existingProduct) {
                throw new Error('Sản phẩm không tồn tại');
            }

            // Soft delete: chuyển status thành 'inactive'
            const query = 'UPDATE products SET status = "inactive", updated_at = NOW() WHERE product_id = ?';
            const [result] = await db.query(query, [productId]);
            
            if (result.affectedRows === 0) {
                throw new Error('Không thể xóa sản phẩm');
            }

            return result;
        } catch (error) {
            console.error('Lỗi deleteProduct:', error);
            throw error;
        }
    }

    // Thêm method khôi phục sản phẩm
    async restoreProduct(productId) {
        try {
            const query = 'UPDATE products SET status = "active", updated_at = NOW() WHERE product_id = ?';
            const [result] = await db.query(query, [productId]);
            
            if (result.affectedRows === 0) {
                throw new Error('Không thể khôi phục sản phẩm');
            }

            return result;
        } catch (error) {
            console.error('Lỗi restoreProduct:', error);
            throw error;
        }
    }

    // Lấy sản phẩm đã ẩn (inactive)
    async getInactiveProducts() {
        try {
            const query = `
                SELECT p.*, c.category_name 
                FROM products p
                LEFT JOIN category c ON p.category_id = c.category_id
                WHERE p.status = 'inactive'
                ORDER BY p.updated_at DESC
            `;
            const [rows] = await db.query(query);
            return rows;
        } catch (error) {
            console.error('Lỗi getInactiveProducts:', error);
            throw error;
        }
    }

    // Thay thế method getAllProductsWithPagination

    async getAllProductsWithPagination({ searchKeyword = '', selectedCategory = null, sortBy = 'default', limit = 9, offset = 0 }) {
        try {
            let query = `
                SELECT p.*, c.category_name 
                FROM products p
                LEFT JOIN category c ON p.category_id = c.category_id
                WHERE p.status = 'active'
            `;
            let params = [];

            // Thêm điều kiện tìm kiếm
            if (searchKeyword && searchKeyword.trim()) {
                query += ` AND p.name LIKE ?`;
                params.push(`%${searchKeyword}%`);
            }

            // Thêm điều kiện lọc theo category
            if (selectedCategory && selectedCategory !== null) {
                query += ` AND p.category_id = ?`;
                params.push(parseInt(selectedCategory));
            }

            // Thêm sắp xếp
            switch (sortBy) {
                case 'name':
                    query += ` ORDER BY p.name ASC`;
                    break;
                case 'price-low':
                    query += ` ORDER BY p.price ASC`;
                    break;
                case 'price-high':
                    query += ` ORDER BY p.price DESC`;
                    break;
                default:
                    query += ` ORDER BY p.created_at DESC`;
            }

            // Thêm LIMIT và OFFSET - sử dụng string interpolation thay vì params
            query += ` LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

            console.log('Query:', query);
            console.log('Params:', params);

            // Sử dụng db.query thay vì db.execute cho LIMIT/OFFSET
            const [rows] = await db.query(query, params);
            return rows;
        } catch (error) {
            console.error('Error getting products with pagination:', error);
            throw error;
        }
    }

    // Sửa lại method getTotalProductsCount
    async getTotalProductsCount(searchKeyword = '', categoryId = null) {
        try {
            let query = `
                SELECT COUNT(*) as total
                FROM products p
                WHERE p.status = 'active'
            `;
            let params = [];

            if (searchKeyword && searchKeyword.trim()) {
                query += ` AND p.name LIKE ?`;
                params.push(`%${searchKeyword}%`);
            }

            if (categoryId && categoryId !== null) {
                query += ` AND p.category_id = ?`;
                params.push(parseInt(categoryId));
            }

            console.log('Count Query:', query);
            console.log('Count Params:', params);

            // Sử dụng db.query thay vì db.execute
            const [rows] = await db.query(query, params);
            return rows[0].total;
        } catch (error) {
            console.error('Error counting products:', error);
            throw error;
        }
    }

    // Thêm method này vào class Product

    async getProductCountByCategory() {
        try {
            const query = `
                SELECT 
                    c.category_id,
                    c.category_name,
                    COUNT(p.product_id) as product_count
                FROM category c
                LEFT JOIN products p ON c.category_id = p.category_id AND p.status = 'active'
                GROUP BY c.category_id, c.category_name
                ORDER BY c.category_name
            `;
            const [rows] = await db.query(query);
            return rows;
        } catch (error) {
            console.error('Error getting product count by category:', error);
            throw error;
        }
    }

    async getTotalActiveProductsCount() {
        try {
            const query = `
                SELECT COUNT(*) as total
                FROM products 
                WHERE status = 'active'
            `;
            const [rows] = await db.query(query);
            return rows[0].total;
        } catch (error) {
            console.error('Error getting total active products count:', error);
            throw error;
        }
    }
}

module.exports = new Product();
