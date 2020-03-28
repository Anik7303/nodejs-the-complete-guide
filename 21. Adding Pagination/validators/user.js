const { check, body } = require('express-validator');

const User = require('../models/user');

module.exports.login = [
    body('email')
        .isEmail().withMessage('invalid email')
];

module.exports.signup = [
    body('username')
        .isAlphanumeric().withMessage('username can not contain special characters')
        .custom(value => {
            return User
                .findOne({ username: value })
                .then(user => {
                    if(user) return Promise.reject('this username is in use, please enter a different username');
                });
        }),
    body('email')
        .isEmail().withMessage('please enter a valid email')
        .custom((value) => {
            return User
                .findOne({ email: value })
                .then(user => {
                    if(user) return Promise.reject('this email already exist, please use another email');
                });
        }),
    body('password')
        .isLength({ min: 8 }).withMessage('password has to be atleast 8 characters long')
        .isAlphanumeric().withMessage('password can contain only letters and numbers'),
    body('confirmPassword')
        .custom((value, { req }) => {
            if(value !== req.body.password) throw new Error('passwords do not match');
            return true;
        })
];

module.exports.resetPassword = [
    body('email')
        .isEmail().withMessage('enter a valid email')
        .custom((value) => {
            return User
                .findOne({ email: value })
                .then(user => {
                    if(!user) return Promise.reject('this email does not belong to any registered user');
                });
        })
];

module.exports.setNewPassword = [
    body('password')
        .isLength({ min: 8 }).withMessage('password should be atleast 8 characters long')
        .isAlphanumeric().withMessage('password can only contain numbers and letters'),
    body('confirmPassword')
        .custom((value, { req }) => {
            if(value !== req.body.password) {
                throw new Error('passwords do not match');
            }
            return true;
        })
];
