const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Post = require('../models/post');
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
        const errors = [];

        if(!validator.isEmail(email)) {
            errors.push('Invalid email');
        }

        if(validator.isEmpty(password) || !validator.isLength(password, { min: 8 })) {
            errors.push('Password should be atleast 8 characters long');
        }

        if(errors.length > 0) {
            const error = new Error('Validation failed');
            error.data = errors;
            error.statusCode = 422;
            throw error;
        }

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
                userId: user._id.toString(),
                name: user.name,
                email: user.email
            },
            keys.TOKEN_SECRET_KEY,
            { expiresIn: '1h' }
        );

        return { token: token, userId: user._id.toString() };
    },
    createPost: async function({ postInput }, req) {
        if(!req.isAuth) {
            const error = new Error('Not authenticated');
            error.statusCode = 401;
            throw error;
        }
        const errors = [];

        if(validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, { min: 5 })) {
            errors.push('Title should be atleast 5 characters long');
        }
        if(validator.isEmpty(postInput.content) || !validator.isLength(postInput.content, { min: 5 })) {
            errors.push('Content should be atleast 5 characters long');
        }
        if(validator.isEmpty(postInput.imageUrl)) {
            errors.push('Image is required');
        }
        if(errors.length > 0) {
            const error = new Error('Validation failed');
            error.data = errors;
            error.statusCode = 422;
            throw error;
        }

        const user = await User.findById(req.userId);
        if(!user) {
            const error = new Error('User with id (' + req.userId + ') not found');
            error.statusCode = 401;
            throw error;
        }

        const post = new Post({
            title: postInput.title,
            content: postInput.content,
            imageUrl: postInput.imageUrl,
            creator: user._id
        });
        const createdPost = await post.save();

        user.posts.push(post);
        const updatedUser = await user.save();

        return {
            ...createdPost._doc,
            _id: createdPost._doc._id.toString(),
            createdAt: createdPost.createdAt.toISOString(),
            updatedAt: createdPost.updatedAt.toISOString(),
            creator: {
                ...updatedUser._doc,
                _id: updatedUser._doc._id.toString(),
                posts: updatedUser._doc.posts.map(post => post.toString())
            }
        };
    },
    posts: async function(args, req) {
        if(!req.isAuth) {
            const error = new Error('Not authenticated');
            error.statusCode = 401;
            throw error;
        }
        const totalItems = await Post.find().countDocuments();
        const posts = await Post.find().populate('creator').sort({ createdAt: -1 });

        if(!posts) {
            return {
                posts: [],
                totalPosts: totalItems || 0
            };
        }
        return {
            posts: posts.map(post => {
                return {
                    ...post._doc,
                    _id: post._doc._id.toString(),
                    createdAt: post._doc.createdAt.toISOString(),
                    updatedAt: post._doc.updatedAt.toISOString(),
                    creator: {
                        ...post._doc.creator._doc,
                        _id: post._doc.creator._doc._id.toString()
                    }
                }
            }),
            totalPosts: totalItems
        };
    }
}
