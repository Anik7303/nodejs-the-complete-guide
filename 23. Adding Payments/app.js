const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const keys = require('./keys');

const errorsController = require('./controllers/errors.js');

// Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// Models
const User = require('./models/user');

const app = express();
const store = new MongoDBStore({
    uri: keys.MONGODB_ATLAS_URI,
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

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(session({
    secret: keys.SESSION_SECRET_KEY,
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
    console.log(error);
    res.status(500).render('500', { pageTitle: 'Error!', path: '/500' });
});

const MONGOOSE_CONNECT_OPTIONS = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
};

mongoose
    .connect(keys.MONGODB_ATLAS_URI, MONGOOSE_CONNECT_OPTIONS)
    .then(result => {
        if(!result) {
            throw new Error('MongoDB Atlas server not working');
        }
        app.listen(process.env.PORT || 3000);
    })
    .catch(err => console.log(err));
