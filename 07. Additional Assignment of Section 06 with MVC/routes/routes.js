const express = require('express');

const usersController = require('../controllers/users');

const router = express.Router();

router.get('/add-user', usersController.getAddUser);

router.post('/add-user', usersController.postAddUser);

router.get('/users', usersController.getUsers);

module.exports = router;