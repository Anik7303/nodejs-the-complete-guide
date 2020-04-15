const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const io = require('../socket');
const Post = require('../models/post');
const User = require('../models/user');

const throwError = (next, err) => {
    err.statusCode = err.statusCode || 500;
    next(err);
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, (err) => console.log(err));
}

module.exports.getPosts = async (req, res, next) => {
    const page = req.query.page || 1;
    const perPage = 2;

    try {
        const totalItems = await Post.find()
            .countDocuments();
        const posts = await Post.find()
            .populate('creator', '_id name email')
            .skip((page - 1) * perPage)
            .limit(perPage);

        if(posts) {
            res
                .status(200)
                .json({
                    message: 'Posts fetched successfully',
                    posts: posts,
                    totalItems: totalItems || 0
                });
        } else {
            res
                .status(200)
                .json({
                    message: 'No post found',
                    posts: [],
                    totalItems: totalItems || 0
                });
        }
    } catch(error) {
        throwError(next, error);
    }
};

module.exports.getPost = async (req, res, next) => {
    const postId = req.params.postId;

    try {
        const post = await Post.findById(postId)
            .populate('creator', '_id name email');
        if(!post) {
            const error = new Error('Post with id: ' + postId + ' not found');
            error.statusCode = 404;
            throw error;
        }
        res
            .status(200)
            .json({
                message: 'Post fetched',
                post: post
            });
    } catch(error) {
        throwError(next, error);
    }
};

module.exports.createPost = async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error1 = new Error('Validation failed!');
        error1.statusCode = 422;
        error1.data = errors.array();
        throw error1;
    }

    if(!req.file) {
        const error2 = new Error('No image provided');
        error2.statusCode = 422;
        throw error2;
    }

    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file.path.replace('\\', '/');

    try {
        const user = await User.findById(req.userId);
        if(!user) {
            const error = new Error('no user found');
            error.statusCode = 404;
            throw error;
        }

        const post = new Post({
            title: title,
            content: content,
            imageUrl: imageUrl,
            creator: user._id
        });

        let result = await post.save();
        if(!result) {
            const error = new Error('Post creation unsuccessful');
            error.statusCode = 500;
            throw error;
        }

        user.posts.push(post);
        result = await user.save();
        if(result) {
            res
                .status(201)
                .json({
                    message: 'Post creation successful',
                    post: post,
                    creator: user
                });
        }
    } catch(error) {
        throwError(next, error);
    }
};

module.exports.updatePost = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error(error.array().toString());
        error.statusCode = 422;
        next(error);
    }

    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;

    if(req.file) {
        imageUrl = req.file.path.replace('\\', '/');
    }

    try {
        const post = await Post.findById(postId);
    
        if(!post) {
            const error = new Error('No post found with id: ' + postId);
            error.statusCode = 404;
            throw error;
        }
        if(post.creator._id.toString() !== req.userId.toString()) {
            const error = new Error('Not authroized to edit this post');
            error.statusCode = 403;
            throw error;
        }
        if(imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl);
        }
        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl;

        const result = await post.save();

        res
            .status(201)
            .json({
                message: 'Post update successful',
                post: result
            });
    } catch(error) {
        throwError(next, error);
    }
};

module.exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;

    try {
        const post = await Post.findById(postId);
        if(!post) {
            const error = new Error('Post with id: ' + postId + ' not found');
            error.statusCode = 404;
            throw error;
        }

        if(post.creator._id.toString() !== req.userId.toString()) {
            const error = new Error('Not authorized to delete this post');
            error.statusCode = 403;
            throw error;
        }

        const imageUrl = post.imageUrl;

        await Post.findByIdAndRemove(postId);
        
        const user = await User.findById(req.userId);

        user.posts.pull(postId);
        const result = await user.save();

        if(result) {
            clearImage(imageUrl);
            res
                    .status(200)
                    .json({ message: 'Post deleted!' });
            } else {
                res
                    .status(422)
                    .json({ message: 'Something went wrong, post deletion failed!'});
            }
    } catch(error) {
        throwError(next, error);
    }
};
