const crypto = require('crypto');

const { validationResult } = require('express-validator');

const Post = require('../models/post');

module.exports.getPosts = (req, res, next) => {
    Post
        .find()
        .then(posts => {
            if(posts) {
                const reqPosts = posts.map(post => {
                    return {
                        _id: post._id,
                        title: post.title,
                        content: post.content,
                        imageUrl: post.imageUrl,
                        creator: post.creator,
                        createdAt: post.createdAt
                    };
                });
                console.log(reqPosts);
                res
                    .status(200)
                    .json({
                        message: 'Fetched posts successfully',
                        posts: reqPosts
                    });
            }
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

module.exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post
        .findById(postId)
        .then(post => {
            if(!post) {
                const error = new Error('no post found with id: ' + postId);
                error.statusCode = 500;
                throw error;
            }

            res
                .status(200)
                .json({
                    message: 'Post fetched.',
                    post: {
                        _id: post._id,
                        title: post.title,
                        content: post.content,
                        imageUrl: post.imageUrl,
                        creator: post.creator,
                        createdAt: post.createdAt
                    }
                    // post: post
                });
        })
        .catch(err => {
            if(!err.statusCode) err.statusCode = 500;
            next(err);
        })
};

module.exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed!');
        error.statusCode = 422;
        throw error;
    }

    if(!req.file) {
        console.log('no image found feedjs');
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file.filename;


    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: { name: 'Anik' }
    });
    post.save()
        .then(result => {
            res.status(201).json({
                message: 'Post created successfully',
                post: result
            });
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
