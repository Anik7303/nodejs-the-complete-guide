const { body } = require('express-validator');

const Product = require('../models/product');

module.exports.productInfo = [
    body('title')
        .isString()
        .isLength({ min: 3, max: 25 }).withMessage('title can has to be 3 to 25 characters long'),
    body('imageUrl')
        .isURL().withMessage('please provide a valid url for image'),
    body('price')
        .isFloat(),
    body('description')
        .isLength({ min: 5, max: 200}).withMessage('description should be between 5 to 200 characters')
        .isString()
        .trim()
];
