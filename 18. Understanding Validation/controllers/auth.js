const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const envKeys = require('../keys');
const User = require('../models/user');
const etherealMail = require('../util/mail'); // uses fake smtp server : ethereal.email

module.exports.getLogin = (req, res, next) => {
    let messages = req.flash('error');
    if(messages.length === 0) messages = [];
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: messages,
        oldInput: { email: '' },
        validationErrors: []
    });
};

module.exports.getSignup = (req, res, next) => {
    let messages = req.flash('error');
    if(messages.length === 0) messages = [];
    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        errorMessage: messages,
        oldInput: { username: '', email: '' },
        validationErrors: []
    });
};

module.exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    if(message.length === 0) message = [];
    res.render('auth/reset-password', {
        pageTitle: 'Reset Password',
        path: '/reset',
        errorMessage: message,
        oldInput: { email: '' },
        validationErrors: []
    });
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
                let validationErrors = req.flash('validationErrors');
                res.render('auth/new-password', {
                    pageTitle: 'New Password',
                    path: '/new-password',
                    errorMessage: message.length > 0 ? message : [],
                    resetToken: token,
                    userId: user._id.toString(),
                    validationErrors: validationErrors.length > 0 ? validationErrors : []
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

    errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res
            .status(422)
            .render('auth/login', {
                pageTitle: 'Login',
                path: '/login',
                errorMessage: errors.array().map(error => error.msg),
                oldInput: { email: email },
                validationErrors: errors.array()
            });
    }

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
                            res
                                .status(422)
                                .render('auth/login', {
                                    pageTitle: 'Login',
                                    path: '/login',
                                    errorMessage: ['password did not match'],
                                    oldInput: { email: email },
                                    validationErrors: [{ param: 'password'}]
                                });
                        }
                    }).catch(err => {
                        if(err) console.log(err);
                        req.flash('error', 'something went wrong, please try again later.');
                        res.redirect('/login');
                    });
            } else {
                res
                    .status(422)
                    .render('auth/login', {
                        pageTitle: 'Login',
                        path: '/login',
                        errorMessage: ['wrong email address'],
                        oldInput: { email: email },
                        validationErrors: [{ param: 'email' }]
                    });
            }
        })
        .catch(err => console.log(err));
};

module.exports.postSignup = (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res
            .status(422)
            .render('auth/signup', {
                pageTitle: 'Signup',
                path: '/signup',
                errorMessage: errors.array().map(error => error.msg),
                oldInput: { username: req.body.username, email: req.body.email },
                validationErrors: errors.array()
            });
    }

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
};

module.exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        if(err) console.log(err);
        res.redirect('/');
    });
};

module.exports.postReset = (req, res, next) => {
    const email = req.body.email;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res
            .status(422)
            .render('auth/reset-password', {
                pageTitle: 'Reset',
                path: '/reset',
                errorMessage: errors.array().map(error => error.msg),
                oldInput: { email: email },
                validationErrors: errors.array()
            });
    }

    crypto.randomBytes(32, (err, buffer) => {
        if(err) {
            console.log(err);
            return res
                .status(422)
                .render('/reset', {
                    pageTitle: 'Reset',
                    path: '/reset',
                    errorMessage: [ err.message ],
                    oldInput: { email: email },
                    validationErrors: []
                });
        }
        const token = buffer.toString('hex');
        User
            .findOne({ email: email })
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
                        to: email,
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
    const resetToken = req.body.resetToken;
    const errors = validationResult(req);
    const message = errors.array().map(error => error.msg);

    if(!errors.isEmpty()) {
        req.flash('error', errors.array().map(error => error.msg));
        req.flash('validationErrors', errors.array());
        res.redirect('/reset/'+resetToken);
        return null;
    }

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
