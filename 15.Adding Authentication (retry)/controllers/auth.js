const bcrypt = require('bcrypt');

// const cookies = require('../util/cookie');
const User = require('../models/user');

module.exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    console.log(message);
    if(message.length <= 0) {
        message = null;
    }
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: message
    });
};

module.exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    console.log(message);
    if(message.length <= 0) {
        message = null;
    }
    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        errorMessage: message
    });
};

module.exports.postLogin = (req, res, next) => {
    // res.setHeader('Set-Cookie', 'loggedIn=true; Max-Age=10; httpOnly');
    // res.setHeader('Set-Cookie', 'loggedIn=true; Max-Age:10; Secure');
    const email = req.body.email;
    const password = req.body.password;

    User
        .findOne({ email: email })
        .then(user => {
            if(user) {
                bcrypt
                    .compare(password, user.password)
                    .then(matched => {
                        if(matched) {
                            req.session.user = user;
                            req.session.isLoggedIn = true;
                            req.session.save(err => {
                                if(err) console.log(err);
                                res.redirect('/');
                            });
                        } else {
                            req.flash('error', 'password did not match');
                            res.redirect('/login');
                        }
                    })
                    .catch(err => {
                        if(err) console.log(err);
                        res.redirect('/login');
                    });
            } else {
                req.flash('error', 'invalid email or password');
                res.redirect('/login');
            }
        })
        .catch(err => console.log(err));
};

module.exports.postSignup = (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    User
        .findOne({ email: email })
        .then(user => {
            if(user) {
                req.flash('error', 'Email already exists, please use another one');
                res.redirect('/signup');
                return null;
            } else {
                return bcrypt
                    .hash(password, 12)
                    .then(hashedPassword => {
                        const newUser = new User({
                            username: username,
                            email: email,
                            password: hashedPassword
                        });
        
                        return newUser.save();
                    })
                    .catch(err => console.log(err));
            }
        })
        .then(result => {
            if(result) {
                res.redirect('/login');
            }
        })
        .catch(err => console.log(err));
};

module.exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        if(err) console.log(err);
        res.redirect('/');
    });
}
