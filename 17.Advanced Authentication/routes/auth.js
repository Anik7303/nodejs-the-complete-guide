const express = require('express');

const authController = require('../controllers/auth');

const isLogged = require('../middleware/is-logged');

const router = express.Router();

router.get('/login', isLogged, authController.getLogin);

router.get('/signup', isLogged, authController.getSignup);

router.post('/login', isLogged, authController.postLogin);

router.post('/signup', isLogged, authController.postSignup);

router.post('/logout', authController.postLogout);

module.exports = router;
