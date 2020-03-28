const path = require('path');

const fileHelper = require('../util/file');
const Product = require('../models/product');

const ITEMS_PER_PAGE = require('../util/general-keys').ITEMS_PER_PAGE;

const { validationResult } = require('express-validator');

module.exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle:'Add Product',
        path: '/admin/add-product',
        editing: false,
        errorMessage: [],
        validationErrors: []
    });
};

module.exports.getProducts = (req, res, next) => {
    let page = req.query.page || 1;
    page = Math.max(page, 1);

    let errorMessage = req.flash('error');
    let alertMessage = req.flash('alert');
    let successMessage = req.flash('success');
    let message;
    let messageType;
    if(alertMessage.length > 0) {
        message = alertMessage;
        messageType = 'alert';
    } else if (errorMessage.length > 0) {
        message = errorMessage;
        messageType = 'error';
    } else if (successMessage.length > 0) {
        message = successMessage;
        messageType = 'success';
    } else {
        message = null;
        messageType = null;
    }

    let totalItems;

    Product
        .find()
        .countDocuments()
        .then(count => {
            if(!count) return next(new Error('no product found for the user'));
            totalItems = count;

            return Product
                .find({ userId: req.user._id })
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            if(!products) return next(new Error('no products found for this user'));

            const lastPage = Math.ceil(totalItems / ITEMS_PER_PAGE);
            const hasPreviousPage = page > 1;
            const hasNextPage = page < lastPage;

            res.render('admin/product-list', {
                pageTitle: 'All Products',
                path: '/admin/products',
                products: products,
                message: message,
                messageType: messageType,
                currentPage: page,
                hasPreviousPage: hasPreviousPage,
                hasNextPage: hasNextPage,
                lastPage: lastPage
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

module.exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if(!editMode) return res.redirect('/');
    const productId = req.params.productId;
    
    Product
        .findById(productId)
        .then(product => {
            if(!product || product.userId.toString() !== req.user._id.toString()) {
                req.flash('alert', 'You can not edit this product information.');
                res.redirect('/admin/products');
            } else {
                res.render('admin/edit-product', {
                    pageTitle: product.title,
                    path: '/admin/products',
                    editing: editMode,
                    product: product,
                    errorMessage: [],
                    validationErrors: []
                });
            }
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

module.exports.postAddProduct = (req, res, next) => {
    const productTitle = req.body.title;
    const productPrice = req.body.price;
    const productImage = req.file;
    const productDescription = req.body.description;
    const userId = req.session.user._id;
    const errors = validationResult(req);
    let hasError = false;
    let errorMessage = [];
    let validationErrors = [];

    if(!productImage) {
        hasError = true;
        errorMessage = ['attached file is not an image'];
        validationErrors = [{ param: 'image' }];
    }

    if(!errors.isEmpty() || hasError) {
        errorMessage = [...errorMessage, ...errors.array().map(error => error.msg)];
        validationErrors = [...validationErrors, ...errors.array()];
        return res
            .status(422)
            .render('admin/edit-product', {
                pageTitle:'Add Product',
                path: '/admin/add-product',
                editing: false,
                errorMessage: errorMessage,
                product: {
                    title: productTitle,
                    price: productPrice,
                    description: productDescription
                },
                validationErrors: validationErrors
            });
    }

    const product = new Product({
        title: productTitle,
        price: productPrice,
        imageUrl: productImage.path,
        description: productDescription,
        userId: userId
    });
    
    product
        .save()
        .then(result => {
            res.redirect('/admin/products');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

module.exports.postEditProduct = (req, res, next) => {
    const productId = req.body.id;
    const productTitle = req.body.title;
    const productPrice = req.body.price;
    const productImage = req.file;
    const productDescription = req.body.description;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res
            .status(422)
            .render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/products',
                editing: true,
                errorMessage: errors.array().map(error => error.msg),
                product: {
                    _id: productId,
                    title: productTitle,
                    price: productPrice,
                    description: productDescription
                },
                validationErrors: errors.array()
            });
    }

    Product
        .findById(productId)
        .then(product => {
            if(product.userId.toString() === req.user._id.toString()) {
                product.title = productTitle;
                product.price = productPrice;
                if(productImage) {
                    fileHelper.deleteFile(product.imageUrl);
                    product.imageUrl = productImage.path;
                }
                product.description = productDescription;
                return product.save();
            } else {
                req.flash('alert', 'You can not edit this product information.');
            }
        })
        .then(result => {
            if(result) req.flash('success', 'Product update successful');
            res.redirect('/admin/products');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

module.exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;

    Product
        .findById(productId)
        .then(product => {
            if(!product) {
                return next(new Error('product not found'));
            }
            fileHelper.deleteFile(product.imageUrl);
            return Product
                // .findByIdAndRemove(productId) // deprecated without setting 'useFindAndModify: false'
                // .findByIdAndDelete(productId)
                .deleteOne({
                    _id: product._id,
                    userId: product.userId
                });
        })
        .then(result => {
            if(result && result.deletedCount > 0) req.flash('success', 'Product successfully deleted.');
            else req.flash('alert', 'You can not delete this product.');
            res.redirect('/admin/products');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};
