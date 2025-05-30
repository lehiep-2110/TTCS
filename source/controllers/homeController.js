const Product = require('../models/product');

class HomeController {
    async getHomePage(req, res) {
        try {
            // Lấy sản phẩm nổi bật
            const products = await Product.getAllProducts();
            // SỬA: THÊM dòng này
            const categories = await Product.getAllCategories();

            res.render('client/home/home', {
                pageTitle: 'Trang chủ - Hype Cake',
                products: products,
                categories: categories, // Bây giờ đã có
            });
        } catch (error) {
            console.error('Lỗi trang chủ:', error);
            res.render('client/home/home', {
                pageTitle: 'Trang chủ - Hype Cake',
                products: [],
                categories: [], // Bây giờ đã có
            });
        }
    }

    getAboutPage(req, res) {
        res.render('client/pages/about', {
            pageTitle: 'Giới thiệu - Hype Cake'
        });
    }

    getContactPage(req, res) {
        res.render('client/pages/contact', {
            pageTitle: 'Liên hệ - Hype Cake'
        });
    }
}

module.exports = new HomeController();