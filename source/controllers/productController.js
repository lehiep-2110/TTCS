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
    // Cập nhật method getProductsPage với error handling tốt hơn
    async getProductsPage(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 9;
            const offset = (page - 1) * limit;
            
            const keyword = req.query.search || '';
            const categoryId = req.query.category || null;
            const sortBy = req.query.sort || 'default';

            console.log('Request params:', {
                page, limit, offset, keyword, categoryId, sortBy
            });

            // Validate page number
            if (page < 1) {
                return res.redirect('/product?page=1');
            }

            // Lấy tổng số sản phẩm để tính pagination
            const totalProducts = await Product.getTotalProductsCount(keyword, categoryId);
            
            // Lấy số lượng sản phẩm theo category
            const categoriesWithCount = await Product.getProductCountByCategory();
            const totalActiveProducts = await Product.getTotalActiveProductsCount();
            
            if (totalProducts === 0) {
                return res.render('client/product/shop', {
                    pageTitle: 'Cửa hàng - HypeCake',
                    products: [],
                    categories: categoriesWithCount,
                    totalActiveProducts,
                    selectedCategory: categoryId,
                    searchKeyword: keyword,
                    sortBy: sortBy,
                    pagination: {
                        currentPage: 1,
                        totalPages: 0,
                        totalProducts: 0,
                        hasNext: false,
                        hasPrev: false,
                        nextPage: 1,
                        prevPage: 1,
                        limit
                    }
                });
            }

            const totalPages = Math.ceil(totalProducts / limit);

            // Validate page không vượt quá totalPages
            if (page > totalPages) {
                return res.redirect(`/product?page=${totalPages}${keyword ? `&search=${keyword}` : ''}${categoryId ? `&category=${categoryId}` : ''}${sortBy !== 'default' ? `&sort=${sortBy}` : ''}`);
            }

            // Lấy sản phẩm với phân trang
            const products = await Product.getAllProductsWithPagination({
                searchKeyword: keyword,
                selectedCategory: categoryId,
                sortBy: sortBy,
                limit: limit,
                offset: offset
            });

            res.render('client/product/shop', {
                pageTitle: 'Cửa hàng - HypeCake',
                products,
                categories: categoriesWithCount,
                totalActiveProducts,
                selectedCategory: categoryId,
                searchKeyword: keyword,
                sortBy: sortBy,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalProducts,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                    nextPage: page + 1,
                    prevPage: page - 1,
                    limit
                }
            });
        } catch (err) {
            console.error('Lỗi hiển thị trang shop:', err);
            
            // Fallback
            try {
                const products = await Product.getAllProducts();
                const categories = await Product.getAllCategories();
                
                res.render('client/product/shop', {
                    pageTitle: 'Cửa hàng - HypeCake',
                    products,
                    categories,
                    totalActiveProducts: products.length,
                    selectedCategory: null,
                    searchKeyword: '',
                    sortBy: 'default',
                    pagination: null
                });
            } catch (fallbackError) {
                console.error('Fallback cũng lỗi:', fallbackError);
                res.status(500).send('Lỗi server: Không thể tải danh sách sản phẩm');
            }
        }
    }
}

module.exports = new ProductController();
