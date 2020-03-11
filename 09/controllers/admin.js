const Product = require('../models/product');

module.exports.postAddProduct = (req, res, next) => {
    // const title = req.body.title;
    // const imageUrl = req.body.imageUrl;
    // const price = req.body.price;
    // const descripiton = req.body.description;

    // const product = new Product(title, imageUrl, price, description);

    const product = new Product(
        null,
        req.body.title,
        req.body.imageUrl,
        req.body.description,
        req.body.price
    );
    product.save();
    res.redirect('/');
};

module.exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle:'Add Product',
        path: '/admin/add-product',
        editing: false
    });
};


module.exports.getEditProduct = (req, res, next) => {
    // fetch the specific product details
    const editMode = req.query.edit;
    if(!editMode) return res.redirect('/');
    const productId = req.params.productId;
    Product.fetch(productId, product => {
        if(!product) res.redirect('/');
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/products',
            editing: editMode,
            product: product
        });
    });
};

module.exports.postEditProduct = (req, res, next) => {
    const product = new Product(
        req.body.id,
        req.body.title,
        req.body.imageUrl,
        req.body.description,
        req.body.price
    );
    product.save();
    res.redirect('/admin/products');
};

module.exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('admin/product-list', {
            pageTitle: '',
            path: '/admin/products',
            products: products
        });
    });
};