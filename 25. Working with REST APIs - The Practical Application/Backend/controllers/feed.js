const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

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

    if(!errors.isEmpty()) {
        const error = new Error('Validation failed!');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    if(!req.file) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file.path.replace('\\', '/');

    let creator;
    let post;

    User
        .findById(req.userId)
        .then(user => {
            if(user) {
                creator = user;
                post = new Post({
                    title: title,
                    content: content,
                    imageUrl: imageUrl,
                    creator: user
                });
    
                return post.save();
            }
            return null;
        })
        .then(result => {
            if(result) {
                creator.posts.push(post);
                return creator.save();
            }
            return null;
        })
        .then(result => {
            if(result) {
                return res
                    .status(201) // status code 201 => success and created a resource
                    .json({
                        message: 'Post creation successful',
                        post: post,
                        creator: { _id: creator._id, name: creator.name }
                    });
            }
        })
        .catch(err => {
            if(!err.statusCode) err.statusCode = 500;
            next(err);
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
        imageUrl = req.file.path.replace('\\', '/');
    }

    Post
        .findById(postId)
        .then(post => {
            if(!post) {
                const error = new Error('No post found with id: ' + postId);
                error.statusCode = 404;
                throw error;
            }

            if(post.creator._id.toString() !== req.userId.toString()) {
                const error = new Error('Not authorized to edit post');
                error.statusCode = 403;
                throw error;
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

            if(post.creator._id.toString() !== req.userId.toString()) {
                const error = new Error('Not authorized to delete this post');
                error.statusCode = 403;
                throw error;
            }

            return Post.findOneAndRemove(postId);
        })
        .then(result => {
            return User.findById(req.userId);
        })
        .then(user => {
            user.posts.pull(postId);
            return user.save();
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
