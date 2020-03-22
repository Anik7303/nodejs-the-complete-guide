const User = require('../models/user');
// const cookies = require('../util/cookie');

module.exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: false
    });
};

module.exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        isAuthenticated: false
    });
};

module.exports.postLogin = (req, res, next) => {
    // res.setHeader('Set-Cookie', 'loggedIn=true; Max-Age=10; httpOnly');
    // res.setHeader('Set-Cookie', 'loggedIn=true; Max-Age:10; Secure');
    User
        .findOne({
            email: req.body.email
        })
        .then(user => {
            console.log(user);
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

module.exports.postSignup = (req, res, next) => {
    // signup logic
    console.log(req.body);
    const username = req.body.username;
    const email = req.body.email;
    // const password = req.boyd.password;
    // const confirmPassword = req.body.confirmPassword;

    const user = new User({
        username: username,
        email: email
    });
    user.save()
        .then(result => {
            console.log('signup result: ', result);
            req.session.isLoggedIn = true;
            req.session.user = result;
            req.session.save(err => {
                if(err) console.log(err);
                res.redirect('/');
            });
        })
        .catch(err => console.log(err));
}
