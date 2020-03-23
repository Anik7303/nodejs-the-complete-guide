const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorsController = require('./controllers/errors.js');

// Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// Models
const User = require('./models/user');

const MONGODBURI = 'mongodb+srv://anik7703:o9bQGRkq9bpFeHWq@cluster0-5fdut.mongodb.net/shop';
const SESSION_SECRET_KEY = 'asjdlkgnqoiwenkvnqariosjgqwijrkasflk';

const app = express();
const store = new MongoDBStore({
    uri: MONGODBURI,
    collection: 'sessions'
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: store
}));
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    if(!req.session.user) return next();
    User
        .findById(req.session.user._id)
        .then(user => {
            if(user) {
                req.user = user;
                next();
            } else {
                res.redirect('/login');
            }
        })
        .catch(err => console.log(err));
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorsController.get404);

mongoose
    .connect(MONGODBURI, { useNewUrlParser: true, useUnifiedTopology: true })
    // .then(result => {
    //     return User.findOne();
    // })
    // .then(user => {
    //     if(!user) {
    //         user = new User({
    //             username: 'Anik',
    //             email: 'anik@example.com',
    //             cart: {
    //                 items: []
    //             }
    //         });
    //     }
    //     return user.save();
    // })
    .then(result => {
        app.listen(3000);
    })
    .catch(err => console.log(err));
