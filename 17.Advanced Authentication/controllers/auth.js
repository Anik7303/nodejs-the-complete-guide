const crypto = require('crypto');

const bcrypt = require('bcryptjs');

const envKeys = require('../keys');
const User = require('../models/user');
const etherealMail = require('../util/mail'); // uses fake smtp server : ethereal.email

module.exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if(message.length <= 0) message = null;
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: message
    });
};

module.exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if(message.length === 0) message = null;
    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        errorMessage: message
    });
};

module.exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    if(message.length === 0) message = null;
    res.render('auth/reset-password', {
        pageTitle: 'Reset Password',
        path: '/reset',
        errorMessage: message
    })
};

module.exports.getNewPassword = (req, res, next) => {
    const token = req.params.resetToken;
    User
        .findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() }
        })
        .then(user => {
            if(user) {
                let message = req.flash('error');
                if(message.length === 0) message = null;
                res.render('auth/new-password', {
                    pageTitle: 'New Password',
                    path: '/new-password',
                    errorMessage: message,
                    resetToken: token,
                    userId: user._id.toString()
                });
            } else {
                req.flash('error', 'Something went wrong. Please try again later.');
                res.redirect('/login');
            }
        })
        .catch(err => console.log(err));
};

module.exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    
    User
        .findOne({
            email: email
        })
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
                            req.flash('error', 'Password did not match');
                            res.redirect('/login');
                        }
                    }).catch(err => {
                        if(err) console.log(err);
                        req.flash('error', 'Sorry, there was some problem...');
                        res.redirect('/login');
                    });
            } else {
                req.flash('error', 'Invalid email or password');
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
        .findOne({
            email: email
        })
        .then(user => {
            if(user) {
                req.flash('error', 'Email already exists, please use another email');
                return res.redirect('/signup');
            } else {
                bcrypt
                    .hash(password, 12)
                    .then(hashedPassword => {
                        const newUser = new User({
                            username: username,
                            email: email,
                            password: hashedPassword,
                            cart: { items: [] }
                        });
                    
                        return newUser.save();
                    })
                    .then(result => {
                        let message = {
                            'to': email,
                            'from': envKeys.EMAIL_SENDER,
                            'subject': 'Welcome',
                            'text': 'Thank you for signing up with us.'
                        };
                        
                        etherealMail(message, messageUrl => console.log(messageUrl));
                        res.redirect('/login');
                    })
                    .catch(err => console.log(err));
            }

        })
        .catch(err => console.log(err));
};

module.exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        if(err) console.log(err);
        res.redirect('/');
    });
};

module.exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if(err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User
            .findOne({ email: req.body.email })
            .then(user => {
                if(!user) {
                    req.flash('error', 'No account with that email found.');
                    res.redirect('/reset');
                    return null;
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + (60 * 60 * 1000);
                return user.save();
            })
            .then(result => {
                if(result) {
                    etherealMail({
                        to: req.body.email,
                        from: envKeys.EMAIL_SENDER,
                        subject: 'Reset Password',
                        html: `
                            <p>You requested password reset.</p>
                            <p> Click this link to set a new password:</p>
                            <a href="http://localhost:${envKeys.PORT}/reset/${token}">http://localhost:${envKeys.PORT}/reset/${token}</a>
                        `
                    }, messageUrl => console.log(messageUrl));
                    res.redirect('/');
                }
            })
            .catch(err => console.log(err));
    });
};

module.exports.postNewPassword = (req, res, next) => {
    const userId = req.body.userId;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const resetToken = req.body.resetToken;
    User
        .findOne({
            _id: userId,
            resetToken: resetToken,
            resetTokenExpiration: { $gt: Date.now() }
        })
        .then(user => {
            if(user) {
                bcrypt
                    .hash(password, 12)
                    .then(hashedPassword => {
                        user.password = hashedPassword;
                        user.resetToken = null;
                        user.resetTokenExpiration = undefined;
                        return user.save();
                    })
                    .then(result => {
                        etherealMail({
                            to: user.email,
                            from: envKeys.EMAIL_SENDER,
                            subject: 'Password Reset Success',
                            html: `
                                <p>Your password has been reset successfully at ${new Date(Date.now()).toString()}</p>
                            `
                        }, messageUrl => console.log(messageUrl));
                        res.redirect('/login');
                    })
                    .catch(err => console.log(err));
            }
        })
        .catch(err => console.log(err));
};
