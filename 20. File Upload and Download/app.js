const path = require('path');
const crypto = require('crypto');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const envKeys = require('./keys');

const errorsController = require('./controllers/errors.js');

// Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// Models
const User = require('./models/user');

const PORT = 3000;

const app = express();
const store = new MongoDBStore({
    uri: envKeys.MONGODB_URI,
    collection: 'sessions'
});
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        crypto.randomBytes(20, (err, buffer) => {
            const name = Date.now() + buffer.toString('hex') + '.' + file.originalname.split('.').reverse()[0];
            callback(null, name);
        });
    }
});
const fileFilter = (req, file, callback) => {
    const fileTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if(fileTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(null, false);
    }
};

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(session({
    secret: envKeys.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: store
}));
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

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
        .catch(err => {
            next(new Error(err));
        });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorsController.get404);

app.use((error, req, res, next) => {
    res.status(500).render('500', { pageTitle: 'Error!', path: '/500' });
});

mongoose
    .connect(envKeys.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {
        app.listen(envKeys.PORT);
    })
    .catch(err => console.log(err));
