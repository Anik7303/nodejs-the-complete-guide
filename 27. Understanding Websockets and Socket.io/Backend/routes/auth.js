const express = require('express');

const authValidation = require('../validators/auth');
const authController = require('../controllers/auth');
const isAuth = require('../middlewares/is-auth');

const router = express.Router();

router.put('/signup', authValidation.signup, authController.signup);

router.post('/login', authValidation.login, authController.login);

router.get('/status', isAuth, authController.getUserStatus);

router.patch('/status', isAuth, authValidation.userStatus, authController.updateUserStatus)

module.exports = router;