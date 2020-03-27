const express = require('express');

const authController = require('../controllers/auth');

const isLogged = require('../middleware/is-logged');

const router = express.Router();

router.get('/login', isLogged, authController.getLogin);

router.get('/signup', isLogged, authController.getSignup);

router.get('/reset', isLogged, authController.getReset);

router.get('/reset/:resetToken', authController.getNewPassword);

router.post('/login', isLogged, authController.postLogin);

router.post('/signup', isLogged, authController.postSignup);

router.post('/logout', authController.postLogout);

router.post('/reset', isLogged, authController.postReset);

router.post('/new-password', isLogged, authController.postNewPassword);

module.exports = router;
