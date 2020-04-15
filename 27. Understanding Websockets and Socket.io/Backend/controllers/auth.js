const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const keys = require('../keys');

module.exports.signup = async (req, res, next) => {
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

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            email: email,
            password: hashedPassword,
            name: name
        });

        const result = await user.save();

        res
            .status(201)
            .json({
                message: 'User created',
                userId: result._id
            });
    } catch(error) {
        error.statusCode = error.statusCode || 500;
        next(error);
    }
};

module.exports.login = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await User.findOne({ email: email });
        if(!user) {
            const error = new Error('A user with this email was not found');
            error.statusCode = 404;
            throw error;
        }

        const matched = await bcrypt.compare(password, user.password);
        if(!matched) {
            const error = new Error('Wrong password');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            { email: user.email, name: user.name, userId: user._id.toString() },
            keys.TOKEN_SECRET_KEY,
            { expiresIn: '1h' }
        );
        res
            .status(200)
            .json({
                message: 'user logged in',
                token: token,
                userId: user._id.toString()
            });
    } catch(error) {
        error.statusCode = error.statusCode || 500;
        next(error);
    }
};

module.exports.getUserStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if(!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        res
            .status(200)
            .json({ status: user.status });
    } catch(error) {
        error.statusCode = error.statusCode || 500;
        next(error);
    }
};

module.exports.updateUserStatus = async (req, res, next) => {
    const newStatus = req.body.status;

    try {
        const user = await User.findById(req.userId);
        if(!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        user.status = newStatus;
        await user.save();
        res
            .status(201)
            .json({ message: 'User status updated' });
    } catch(error) {
        error.statusCode = error.statusCode || 500;
        next(error);
    }
};
