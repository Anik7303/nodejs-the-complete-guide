const express = require('express');

const feedController = require('../controllers/feed');

const feedValidator = require('../validators/feed');

const router = express.Router();

// GET /feed/posts
router.get('/posts', feedController.getPosts);

// GET /feed/post/?
router.get('/post/:postId', feedController.getPost);

// POST /feed/post
router.post('/post', feedValidator, feedController.createPost);

// PUT /feed/post/?
router.put('/post/:postId', feedValidator, feedController.updatePost);

module.exports = router;
