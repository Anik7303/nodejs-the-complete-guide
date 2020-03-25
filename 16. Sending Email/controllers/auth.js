const bcrypt = require('bcryptjs');
// const nodemailer = require('nodemailer');
// const sendgridTransport = require('nodemailer-sendgrid-transport'); // this doesn't work as i haven't been able to create an sendgrid account

// const transporter = nodemailer.createTransport(sendgridTransport({
//     auth: {
//         api_key: '<api key from sendgrid account>'
//     }
// }));

const envKeys = require('../keys');
const User = require('../models/user');
// const cookies = require('../util/cookie');
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
    if(message.length <= 0) message = null;
    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        errorMessage: message
    });
};

module.exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    // res.setHeader('Set-Cookie', 'loggedIn=true; Max-Age=10; httpOnly');
    // res.setHeader('Set-Cookie', 'loggedIn=true; Max-Age:10; Secure');
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
                        // // for sendgrid
                        // transporter.sendMail(message, (err, info) => {
                        //     if(err) console.log(err);
                        //     console.log('email log: ', info);
                        // });

                        etherealMail(message, messageUrl => console.log(messageUrl));
                        res.redirect('/login');
                    })
                    .catch(err => console.log(err));
            }

        })
        .catch(err => console.log(err));
}

module.exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        if(err) console.log(err);
        res.redirect('/');
    });
}
