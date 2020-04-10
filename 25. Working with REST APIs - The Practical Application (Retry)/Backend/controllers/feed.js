const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Post = require('../models/post');

const throwError = (err) => {
    const error = new Error(err);
    if(!error.statusCode) error.statusCode = 500;
    next(error);
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath);
}

module.exports.getPosts = (req, res, next) => {
    Post
        .find()
        .then(posts => {
            console.log(posts);
            if(posts) {
                return res
                    .status(200)
                    .json({
                        message: 'Posts fetched successfully',
                        posts: posts
                    });
            } else {
                return res
                    .status(200)
                    .json({
                        message: 'No post found',
                        posts: []
                    });
            }
        })
        .catch(err => {
            throwError(err);
        });
};

module.exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post
        .findById(postId)
        .then(post => {
            if(!post) {
                const error = new Error('Post with id: ' + postId + ' not found!');
                error.statusCode = 404;
                throw(error);
            }
            return res
                .status(200)
                .json({
                    message: 'Post fetched',
                    post: post
                });
        })
        .catch(err => {
            throwError(err);
        });
};

module.exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    const title = req.body.title;
    const content = req.body.content;

    if(!errors.isEmpty()) {
        const error = new Error(errors.array().toString());
        error.statusCode = 422;
        throw error;
    }

    if(!req.file) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

    const post = new Post({
        title: title,
        content: content,
        imageUrl: req.file.path,
        creator: { name: 'Anik' }
    });

    post
        .save()
        .then(result => {
            if(result) {
                return res
                    .status(201) // status code 201 => sucess and created a resource
                    .json({
                        message: 'Post created successfully',
                        post: result
                    });
            }
        })
        .catch(err => {
            throw err;
        });
};

module.exports.updatePost = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error(error.array().toString());
        error.statusCode = 422;
        next(error);
    }

    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.body.image;
    if(req.file) {
        imageUrl = req.file.path;
    }

    Post
        .findById(postId)
        .then(post => {
            if(!post) {
                const error = new Error('No post found with id: ' + postId);
            }

            if(imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl);
            }
            
            post.title = title;
            post.content = content;
            post.imageUrl = imageUrl;
            return post.save();
        })
        .then(result => {
            if(result) {
                res
                    .status(200)
                    .json({
                        message: 'Post updated!',
                        post: result
                    });
            } else {
                res
                    .status(422)
                    .json({
                        message: 'Post update failed',
                        post: {}
                    });
            }
        })
        .catch(err => {
            throwError(err);
        });
};
