const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const routes = require('./routes/routes');

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));

app.use(routes.router);

app.listen(3000);