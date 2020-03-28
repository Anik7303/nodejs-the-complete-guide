const nodemailer = require('nodemailer');

const envKeys = require('../keys');

const transporter = nodemailer.createTransport({
    host: envKeys.EMAIL_HOST,
    port: envKeys.EMAIL_PORT,
    secure: envKeys.EMAIL_SECURE,
    auth: {
        user: envKeys.ETHEREAL_USER,
        pass: envKeys.ETHEREAL_PASS
    }
});

module.exports.send = (message, callback) => {
    transporter
        .sendMail(message)
        .then(info => {
            callback(nodemailer.getTestMessageUrl(info));
        })
        .catch(err => console.log(err));
}
