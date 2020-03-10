const Product = require('../models/product');

module.exports.getIndex = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('shop/index', {
            pageTitle: 'Shop',
            path: '/',
            products: products
        });
    });
};

module.exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('shop/product-list', {
            pageTitle: 'All Products',
            path: '/products',
            products: products
        });
    });
};

module.exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.fetch(productId, product => {
        res.render('shop/product-details', {
            pageTitle: product.title,
            path: '/products',
            product: product
        });
    });
};

module.exports.getCart = (req, res, next) => {
    res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart'
    });
};

module.exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    // Product.fetch(productId, product => {});
    console.log(productId);
    res.redirect('/cart');
};

module.exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders'
    });
};

module.exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout'
    });
};