const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const mongoConnect = require('./util/database').mongoConnect;
const errorsController = require('./controllers/errors.js');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

// Models
const User = require('./models/user');

app.set('view engine', 'ejs');

app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.fetchAll()
        .then(users => {
            req.user = users[0];
            next();
        })
        .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorsController.get404);

mongoConnect(() => {
    User.fetchAll()
        .then(users => {
            if(users) {
                return users[0];
            }
            newUser = new User('anik', 'anik@example.com');
            return newUser.save();
        })
        .then(result => {
            app.listen(3000);
        })
        .catch(err => console.log(err));
});