const express = require('express');

const isAuth = require('../middlewares/is-auth');

const feedController = require('../controllers/feed');

const feedValidator = require('../validators/feed');

const router = express.Router();

// GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts);

// GET /feed/post/?
router.get('/post/:postId', isAuth, feedController.getPost);

// POST /feed/post
router.post('/post', isAuth, feedValidator, feedController.createPost);

// PUT /feed/post/?
router.put('/post/:postId', isAuth, feedValidator, feedController.updatePost);

// DELETE /feed/post/?
router.delete('/post/:postId', isAuth, feedController.deletePost);

module.exports = router;
