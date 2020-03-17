const Product = require('../models/product');

module.exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle:'Add Product',
        path: '/admin/add-product',
        editing: false
    });
};

module.exports.postAddProduct = (req, res, next) => {
    const productTitle = req.body.title;
    const productPrice = req.body.price;
    const productImageUrl = req.body.imageUrl;
    const productDescription = req.body.description;

    const product = new Product(productTitle, productPrice, productImageUrl, productDescription);
    
    product
        .save()
        .then(result => {
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
};

module.exports.getProducts = (req, res, next) => {
    Product
        .fetchAll()
        .then(products => {
            res.render('admin/product-list', {
                pageTitle: 'All Products',
                path: '/admin/products',
                products: products
            });
        })
        .catch(err => console.log(err));
};

module.exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if(!editMode) return res.redirect('/');
    const productId = req.params.productId;
    
    Product
        .findById(productId)
        .then(product => {
            res.render('admin/edit-product', {
                pageTitle: product.title,
                path: '/admin/products',
                editing: editMode,
                product: product
            });
        })
        .catch(err => console.log(err));
};

module.exports.postEditProduct = (req, res, next) => {
    const productId = req.body.id;
    const productTitle = req.body.title;
    const productPrice = req.body.price;
    const productImageUrl = req.body.imageUrl;
    const productDescription = req.body.description;

    const product = new Product(productTitle, productPrice, productImageUrl, productDescription, productId);
    product
        .save()
        .then(result => {
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
};

module.exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product
        .deleteById(productId)
        .then(result => {
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));

    // another method
    // Product
    //     .findByPk(productId)
    //     .then(product => {
    //         return product.destroy();
    //     })
    //     .then(result => {
    //         res.redirect('/admin/products');
    //     })
    //     .catch(err => console.log(err));
};