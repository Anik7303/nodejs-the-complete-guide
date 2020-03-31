const path = require('path');
const crypto = require('crypto');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

const keys = require('./keys');
const feedRoutes = require('./routes/feed');

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        crypto.randomBytes(10, (err, buffer) => {
            if(err) throw err;
            const filename = buffer.toString('hex') + '-' + file.originalname;
            cb(null, filename);
        });
    }
});

const fileFilter = (req, file, cb) => {
    const supportedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if(supportedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// app.use(bodyParser.urlencoded({ extended: false })); // for 'x-www-form-urlencoded' encoded data submitted through <form>
app.use(bodyParser.json()); // for 'application/json' encoded data
app.use(express.static(path.join(__dirname, 'images')));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

app.use('/feed', feedRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const statusCode = error.statusCode || 500;
    const message = error.message;
    res.status(statusCode).json({ message: message });
});

mongoose
    .connect(keys.MONGODB_ATLAS_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {
        if(!result) throw new Error(result);
        app.listen(8080);
    })
    .catch(err => console.log(err));
