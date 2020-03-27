const express = require('express');

const authController = require('../controllers/auth');

const isLogged = require('../middleware/is-logged');

const userValidator = require('../validators/user');

const router = express.Router();

router.get('/login', isLogged, authController.getLogin);

router.get('/signup', isLogged, authController.getSignup);

router.get('/reset', isLogged, authController.getReset);

router.get('/reset/:resetToken', authController.getNewPassword);

router.post('/login', isLogged, userValidator.login, authController.postLogin);

router.post('/signup', isLogged, userValidator.signup, authController.postSignup);

router.post('/logout', authController.postLogout);

router.post('/reset', isLogged, userValidator.resetPassword, authController.postReset);

router.post('/new-password', isLogged, userValidator.setNewPassword, authController.postNewPassword);

module.exports = router;
