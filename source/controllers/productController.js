const Product = require('../models/product');

class ProductController {
    // Hiển thị chi tiết sản phẩm
    async getProductDetail(req, res) {
        try {
            const productId = req.params.id;
            const product = await Product.getProductById(productId);
            const categories = await Product.getAllCategories();
            
            if (!product) {
                return res.status(404).send('Sản phẩm không tồn tại');
            }
            
            res.render('client/product/productDetail', { product, categories });
        } catch (err) {
            console.error('Lỗi hiển thị chi tiết sản phẩm:', err);
            res.status(500).send('Lỗi server');
        }
    }

    // Hiển thị trang shop/danh sách sản phẩm
    async getShopPage(req, res) {
        try {
            const categoryId = req.query.category;
            const keyword = req.query.search;
            const sortBy = req.query.sort || 'default';
            let products;
            
            if (keyword) {
                products = await Product.searchProducts(keyword);
            } else if (categoryId) {
                products = await Product.getProductsByCategory(categoryId);
            } else {
                products = await Product.getAllProducts();
            }

            // Sort products
            switch(sortBy) {
                case 'name':
                    products.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'price-low':
                    products.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    products.sort((a, b) => b.price - a.price);
                    break;
                default:
                    // Giữ nguyên thứ tự mặc định
                    break;
            }
            
            const categories = await Product.getAllCategories();
            res.render('client/product/shop', { 
                products, 
                categories, 
                selectedCategory: categoryId,
                searchKeyword: keyword,
                sortBy: sortBy
            });
        } catch (err) {
            console.error('Lỗi hiển thị trang shop:', err);
            res.status(500).send('Lỗi server');
        }
    }

    // Tìm kiếm sản phẩm
    async searchProducts(req, res) {
        try {
            const keyword = req.query.q;
            const products = await Product.searchProducts(keyword);
            const categories = await Product.getAllCategories();
            
            res.render('client/product/shop', { 
                products, 
                categories, 
                searchKeyword: keyword 
            });
        } catch (err) {
            console.error('Lỗi tìm kiếm sản phẩm:', err);
            res.status(500).send('Lỗi server');
        }
    }
}

module.exports = new ProductController();
