const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
// for Handlebars template engine
// const expressHbs = require('express-handlebars')

const app = express();

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

// for PUG template engine
// app.set('view engine', 'pug');

// for Handlebars template engine
// app.engine('hbs', expressHbs({layoutsDir: "views/layouts/", defaultLayout: "main-layout", extname: "hbs"}));
// app.set('view engine', 'hbs');

// for EJS template engine
app.set('view engine', 'ejs');

app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminData.router);
app.use(shopRoutes);

app.use((req, res, next) => {
    // res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
    res.status(404).render('404', { pageTitle: 'Page Not Found', path: ''});
});

app.listen(3000);
