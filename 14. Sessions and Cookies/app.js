const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorsController = require('./controllers/errors.js');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

// Models
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User
        .findById('5e751621b63f9c0a64ad3c14')
        .then(user => {
            if(user && !req.user) {
                req.user = user;
            }
            next();
        })
        .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorsController.get404);

const uri = 'mongodb+srv://anik7703:o9bQGRkq9bpFeHWq@cluster0-5fdut.mongodb.net/shop?retryWrites=true&w=majority';

mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
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
        app.listen(3000);
    })
    .catch(err => console.log(err));
