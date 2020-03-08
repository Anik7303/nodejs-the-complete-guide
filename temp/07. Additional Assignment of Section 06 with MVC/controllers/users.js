const User = require('../models/user');

module.exports.getAddUser = (req, res, next) => {
    res.render('add-user', {pageTitle: 'Add User', path: '/add-user'});
};

module.exports.postAddUser = (req, res, next) => {
    const user = new User(req.body.name, req.body.imageLink);
    user.save();
    res.redirect('/users');
};

module.exports.getUsers = (req, res, next) => {
    User.fetchAll((users) => {
        res.render('users', {pageTitle: 'Users', path: '/users', users: users})
    });
};