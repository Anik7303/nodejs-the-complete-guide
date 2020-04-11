const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Post = require('../models/post');

const throwError = (next, err) => {
    const error = new Error(err);
    error.statusCode = err.statusCode || 500;
    next(error);
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', 'images', filePath);
    fs.unlink(filePath, (err) => console.log(err));
}

module.exports.getPosts = (req, res, next) => {
    const page = req.query.page || 1;
    const perPage = 2;
    let totalItems;

    Post
        .find()
        .countDocuments()
        .then(count => {
            totalItems = count || 0;

            return Post
                .find()
                .skip((page - 1) * perPage)
                .limit(perPage);
        })
        .then(posts => {
            if(posts) {
                res
                    .status(200)
                    .json({
                        message: 'Posts fetched successfully',
                        posts: posts,
                        totalItems: totalItems
                    });
            } else {
                res
                    .status(200)
                    .json({
                        message: 'No post found',
                        posts: [],
                        totalItems: totalItems
                    })
            }
        })
        .catch(err => throwError(next, err));
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
            throwError(next, err);
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
        imageUrl: req.file.filename,
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
    let imageUrl = req.body.image;
    if(req.file) {
        imageUrl = req.file.filename;
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
            throwError(next, err);
        });
};

module.exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    let imageUrl;

    Post
        .findById(postId)
        .then(post => {
            if(!post) {
                const error = new Error('post with id: ' + postId + ' no found!');
                error.statusCode = 422;
                next(error);
            }
            // check user login validity
            imageUrl = post.imageUrl;
            return Post.findOneAndRemove(postId);
        })
        .then(result => {
            if(result) {
                clearImage(imageUrl);
                res
                    .status(200)
                    .json({ message: 'post deleted!' });
            } else {
                res
                    .status(422)
                    .json({ message: 'something went wrong, post deletion failed!'});
            }
        })
        .catch(err => throwError(next, err));
};
