const { validationResult } = require('express-validator');

const Post = require('../models/post');

const throwError = (err) => {
    const error = new Error(err);
    if(!error.statusCode) error.statusCode = 500;
    next(error);
}

module.exports.getPosts = (req, res, next) => {
    Post
        .find()
        .then(posts => {
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
        const error = new Error('Validation failed! Entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }

    return console.log(req.file);

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
