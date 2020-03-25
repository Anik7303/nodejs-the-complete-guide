const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const envKeys = require('./keys');

const errorsController = require('./controllers/errors.js');

// Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// Models
const User = require('./models/user');

const app = express();
const store = new MongoDBStore({
    uri: MONGODBURI,
    collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: envKeys.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: store
}));

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

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorsController.get404);

mongoose
    .connect(envKeys.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    // .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {
        return User.findOne();
    })
    .then(user => {
        if(!user) {
            user = new User({
                username: 'Anik',
                email: 'anik@example.com',
                cart: {
                    items: []
                }
            });
        }
        return user.save();
    })
    .then(result => {
        app.listen(envKeys.PORT);
    })
    .catch(err => console.log(err));
