const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const keys = require('../keys');

module.exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('validation failed');
        error.data = errors.array();
        error.statusCode = 422;
        throw error;
    }

    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email: email,
                name: name,
                password: hashedPassword
            });
            return user.save();
        })
        .then(result => {
            res
                .status(201)
                .json({
                    message: 'User created',
                    userId: result._id
                });
        })
        .catch(err => {
            err.statusCode = err.statusCode || 500;
            next(err);
        })
};

module.exports.login = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    User
        .findOne({ email: email })
        .then(user => {
            if(!user) {
                const error = new Error('A user with this email was not found');
                error.statusCode = 401;
                throw error;
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then(result => {
            if(!result) {
                const error = new Error('Wrong password');
                error.statusCode = 401;
                throw error;
            }
            const token = jwt.sign({
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            }, keys.TOKEN_SECRET_KEY, { expiresIn: '1h' });

            res
                .status(200)
                .json({
                    token: token,
                    userId: loadedUser._id.toString()
                });
        })
        .catch(err => {
            err.statusCode = err.statusCode || 500;
            next(err);
        })
}
