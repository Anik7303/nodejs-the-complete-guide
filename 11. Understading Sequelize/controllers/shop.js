const Product = require('../models/product');
const Cart = require('../models/cart');

module.exports.getIndex = (req, res, next) => {
    Product
        .findAll()
        .then(products => {
            res.render('shop/index', {
                pageTitle: 'Shop',
                path: '/',
                products: products
            });
        })
        .catch(err => {
            if(err) console.log(err);
        });
};

module.exports.getProducts = (req, res, next) => {
    Product
        .findAll()
        .then(products => {
            res.render('shop/product-list', {
                pageTitle: 'Products',
                path: '/products',
                products: products
            });
        })
        .catch(err => {
            if(err) console.log(err);
        });
};

module.exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product
        .findAll({
            where: {
                id: productId
            }
        })
        .then(products => {
            const product = products[0];
            res.render('shop/product-details', {
                pageTitle: product.title,
                path: '/products',
                product: product
            });
        })
        .catch(err => {
            if(err) console.log(err);
        });
};

module.exports.getCart = (req, res, next) => {
    req.user
        .getCart()
        .then(cart => {
            return cart.getProducts();
        })
        .then(products => {
            res.render('shop/cart', {
                pageTitle: 'Cart',
                path: '/cart',
                products: products
            })
        })
        .catch(err => {
            if(err) console.log(err);
        });
};

module.exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    Product.fetch(productId, product => {
        Cart.addProduct(productId, product.price);
    });
    res.redirect('/cart');
};

module.exports.postDeleteCartProduct = (req, res, next) => {
    Product.fetch(req.body.productId, product => {
        Cart.removeProduct(product.id, product.price, err => {
            if(!err) {
                res.redirect('/cart');
            }
        });
    });
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