# NodeJS - The Complete Guide - Udemy Course

### For Section 12 and above -
* create a file name **keys.js** in the same folder as **app.js**
* fill it with the __key-value__ pairs like shown below
```
module.exports.PORT = 3000;
module.exports.SESSION_SECRET_KEY = <session_secret_key>;

// database
module.exports.MONGODB_URI = <mongodb_database_connection_uri>;

// email
module.exports.EMAIL_HOST = 'smtp.ethereal.email';
module.exports.EMAIL_PORT = 587;
module.exports.EMAIL_SECURE = false;
module.exports.ETHEREAL_USER = <ethereal_user>;
module.exports.ETHEREAL_PASS = <password>;

module.exports.EMAIL_SENDER = <email_address>;
```