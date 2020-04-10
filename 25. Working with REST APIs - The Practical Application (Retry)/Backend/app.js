const path = require('path');
const crypto = require('crypto');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

const feedRoutes = require('./routes/feed');
const keys = require('./keys');

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    filename: (req, file, callback) => {
        crypto.randomBytes(10, (error, buffer) => {
            if(error) throw error;
            const parts = file.originalname.split('.');
            const extension = parts[parts.length - 1];
            const filename = buffer.toString('hex') + '.' + extension;
            callback(null, filename);
        });
    }
});

const fileFilter = (req, file, callback) => {
    const allowedExtensions = ['image/jpg', 'image/jpeg', 'image/png'];
    if(allowedExtensions.includes(file.mimetype)) {
        callback(null, true);
    } else {
        return callback(null, false);
    }
};

// app.use(bodyParser.urlencoded({ extended: false })); // for 'x-www-form-urlencoded' encoded data submitted through <form>
app.use(bodyParser.json()); // for 'application/json' encoded data
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')); // for form enctype = 'multipart/form'

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message });
});

mongoose
    .connect(keys.MONGODB_ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {
        if(result) app.listen(8080);
    })
    .catch(err => {
        if(err) console.log(err);
    });
