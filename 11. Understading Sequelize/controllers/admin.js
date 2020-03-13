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
    const userId = req.user.id;

    // Product
    //     .create({
    //         title: productTitle,
    //         price: productPrice,
    //         imageUrl: productImageUrl,
    //         description: productDescription,
    //         userId: userId
    //     })

    // using assosiated model to create product
    req.user
        .createProduct({
            title: productTitle,
            price: productPrice,
            imageUrl: productImageUrl,
            description: productDescription
        })
        .then(result => {
            console.log(productTitle, 'created!');
            res.redirect('/admin/products');
        })
        .catch(err => {
            if(err) console.log(err);
        });
};

module.exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if(!editMode) return res.redirect('/');
    const productId = req.params.productId;
    
    // Product
    //     .findAll({
    //         where: {
    //             id: productId
    //         }
    //     })

    // using associated model to get specified product
    req.user
        .getProducts({
            where: {
                id: productId
            }
        })
        .then(products => {
            const product = products[0];
            res.render('admin/edit-product', {
                pageTitle: product.title,
                path: '/admin/products',
                editing: editMode,
                product: product
            });
        })
        .catch(err => {
            console.log(err);
        });
};

module.exports.postEditProduct = (req, res, next) => {
    const productId = req.body.id;
    const productTitle = req.body.title;
    const productPrice = req.body.price;
    const productImageUrl = req.body.imageUrl;
    const productDescription = req.body.description;

    Product
        .findAll({
            where: {
                id: productId
            }
        })
        .then(products => {
            const product = products[0];
            product.title = productTitle;
            product.price = productPrice;
            product.imageUrl = productImageUrl;
            product.description = productDescription;
            return product.save();
        })
        .then(result => {
            console.log('update result:', result);
            res.redirect('/admin/products');
        })
        .catch(err => {
            if(err) console.log(err);
        });
};

module.exports.getProducts = (req, res, next) => {
    // Product
    //     .findAll()

    // using associated model to get products
    req.user
        .getProducts()
        .then(products => {
            res.render('admin/product-list', {
                pageTitle: 'All Products',
                path: '/admin/products',
                products: products
            });
        })
        .catch(err => {
            if(err) console.log(err);
        });
};

module.exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product
        .destroy({
            where: {
                id: productId
            }
        })
        .then(result => {
            console.log('delete result:', result);
            res.redirect('/admin/products');
        })
        .catch(err => {
            if(err) console.log(err);
        });

    // another method
    // Product
    //     .findAll({
    //         where: {
    //             id: productId
    //         }
    //     })
    //     .then(products => {
    //         const product = products[0];
    //         return product.destroy();
    //     })
    //     .then(result => {
    //         console.log('delete result:', result);
    //         res.redirect('/admin/products');
    //     })
    //     .catch(err => {
    //         if(err) console.log(err);
    //     });
};