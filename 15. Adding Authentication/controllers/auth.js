const User = require('../models/user');
// const cookies = require('../util/cookie');

module.exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: false
    });
};

module.exports.postLogin = (req, res, next) => {
    // res.setHeader('Set-Cookie', 'loggedIn=true; Max-Age=10; httpOnly');
    // res.setHeader('Set-Cookie', 'loggedIn=true; Max-Age:10; Secure');
    User
        .findById('5e764b52bab7561e14009ad1')
        .then(user => {
            req.session.user = user;
            req.session.isLoggedIn = true;
            req.session.save(err => {
                if(err) console.log(err);
                res.redirect('/');
            });
        })
        .catch(err => console.log(err));
};

module.exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        if(err) console.log(err);
        res.redirect('/');
    });
}
