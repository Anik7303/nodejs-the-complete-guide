const Product = require('../models/product');

module.exports.postAddProduct = (req, res, next) => {
    const product = new Product(
        null,
        req.body.title,
        req.body.imageUrl,
        req.body.description,
        req.body.price
    );
    product
        .save()
        .then(() => {
            res.redirect('/');
        })
        .catch(err => {
            if(err) console.log(err);
        });
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
    Product
        .fetch(productId)
        .then(([rows]) => {
            const product = rows[0];
            if(!product) res.redirect('/');
            res.render('admin/edit-product', {
                pageTitle: product.title,
                path: '/admin/products',
                editing: editMode,
                product: product
            });
        })
        .catch(err => {
            if(err) console.log(err);
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
    product
        .update()
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(err => {
            if(err) console.log(err);
        });
};

module.exports.getProducts = (req, res, next) => {
    Product
        .fetchAll()
        .then(([rows]) => {
            res.render('admin/product-list', {
                pageTitle: 'All Products',
                path: '/admin/products',
                products: rows
            });
        })
        .catch(err => {
            if(err) console.log(err);
        });
};

module.exports.postDeleteProduct = (req, res, next) => {
    Product
        .delete(req.body.productId)
        .then((result) => {
            console.log('delete result:', result);
            res.redirect('/admin/products');
        })
        .catch(err => {
            if(err) console.log(err);
        });
};