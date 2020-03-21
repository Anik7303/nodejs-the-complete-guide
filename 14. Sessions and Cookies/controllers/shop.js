const Product = require('../models/product');
const Order = require('../models/order');

module.exports.getIndex = (req, res, next) => {
    Product
        .find()
        .then(products => {
            res.render('shop/index', {
                pageTitle: 'Shop',
                path: '/',
                products: products,
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(err => console.log(err));
};

module.exports.getProducts = (req, res, next) => {
    Product
        .find()
        // .select('title price -_id')
        // .populate('userId', '_id')
        .then(products => {
            res.render('shop/product-list', {
                pageTitle: 'Products',
                path: '/products',
                products: products,
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(err => console.log(err));
};

module.exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;

    Product
        .findById(productId)
        .then(product => {
            res.render('shop/product-details', {
                pageTitle: product.title,
                path: '/products',
                product: product,
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(err => console.log(err));
};

module.exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            let products = [ ...user.cart.items ].map(product => {
                return { ...product.productId._doc, quantity: product.quantity };
            });
            res.render('shop/cart', {
                pageTitle: 'Cart',
                path: '/cart',
                products: products,
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(err => console.log(err));
};

module.exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    req.user.addToCart(productId)
        .then(result => {
            res.redirect('/');
        })
        .catch(err => console.log(err));
};

module.exports.postDeleteCartProduct = (req, res, next) => {
    const productId = req.body.productId;
    req.user.deleteItemFromCart(productId)
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
};

module.exports.getOrders = (req, res, next) => {
    Order
        .find({
            'user._id': req.user._id
        })
        .then(orders => {
            res.render('shop/orders', {
                pageTitle: 'Orders',
                path: '/orders',
                orders: orders,
                isAuthenticated: req.session.isLoggedIn
            });
        })
        .catch(err => console.log(err));
};

module.exports.postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(item => {
                return {
                    _id: item.productId._id,
                    title: item.productId.title,
                    price: item.productId.price,
                    description: item.productId.description,
                    imageUrl: item.productId.imageUrl,
                    quantity: item.quantity
                };
            });
            const order = new Order({
                user: {
                    _id: user._id,
                    username: user.username
                },
                products: products
            });
            return order.save();
        })
        .then(result => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => console.log(err));
};
