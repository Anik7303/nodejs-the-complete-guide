const Product = require('../models/product');

exports.postAddProduct = (req, res, next) => {
    const product = new Product(req.body.title);
    product.save();
    res.redirect('/');
};

exports.getAddProduct = (req, res, next) => {
    res.render('add-product', {
        pageTitle:'Add Product',
        path: '/admin/add-product'
    });
};

exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('shop', {
            pageTitle: 'Shop',
            path: '/',
            prods: products
        });
    });
};