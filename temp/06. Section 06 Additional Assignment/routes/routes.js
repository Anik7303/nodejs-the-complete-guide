const express = require('express');

const router = express.Router();

const users = [];

router.get('/', (req, res, next) => {
    res.render('index', {pageTitle: 'Add User', path:'/'});
});

router.get('/users', (req, res, next) => {
    res.render('users', {pageTitle: 'Users', path: '/users', users: users});
});

router.post('/add-user', (req, res, next) => {
    users.push({name: req.body.username});
    console.log(users);
    res.redirect('/users');
});

module.exports.router = router;
module.exports.users = users;