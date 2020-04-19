const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const keys = require('../keys');

module.exports = {
    createUser: async function({ userInput }, req) {
        const errors = [];
        if(!validator.isEmail(userInput.email)) {
            errors.push('invalid email');
        }
        if(validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, { min: 8 })) {
            errors.push('password should be atleast 8 characters long');
        }

        if(errors.length > 0) {
            const error = new Error('validation failed');
            error.data = errors;
            error.statusCode = 422;
            throw error;
        }

        const existingUser = await User.findOne({ email: userInput.email });
        if(existingUser) {
            const error = new Error('A user with this email already exists, please try another email');
            error.statusCode = 401;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(userInput.password, 12);

        const user = new User({
            name: userInput.name,
            email: userInput.email,
            password: hashedPassword
        });

        const createdUser = await user.save();

        return { ...createdUser._doc, _id: createdUser._doc._id.toString() };
    },
    login: async function(args, req) {
        const email = args.email;
        const password = args.password;
        const user = await User.findOne({ email: email });
        if(!user) {
            const error = new Error('User not found');
            error.statusCode = 401;
            throw error;
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if(!isEqual) {
            const error = new Error('Wrong password');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign(
            {
                _id: user._id.toString(),
                name: user.name,
                email: user.email
            },
            keys.TOKEN_SECRET_KEY,
            { expiresIn: '1h' }
        );

        return { token: token, userId: user._id.toString() };
    }
}
