# NodeJS - The Complete Guide - Udemy Course

### For Section 12 and above -
* create a file name **keys.js** in the same folder as **app.js**
* fill it with the __key-value__ pairs like shown below
```
module.exports.PORT = 3000;
module.exports.SESSION_SECRET_KEY = <session_secret_key>;
module.exports.TOKEN_SECRET_KEY = <json_web_token_secret_key>;

// database
// for local server
module.exports.MONGODB_LOCAL_URI = <mongodb_database_connection_uri>;
// for mongodb atlas
module.exports.MONGODB_ATLAS_URI = <mongodb_database_connection_uri>;

// email
module.exports.EMAIL_HOST = 'smtp.ethereal.email';
module.exports.EMAIL_PORT = 587;
module.exports.EMAIL_SECURE = false;
module.exports.ETHEREAL_USER = <ethereal_user>;
module.exports.ETHEREAL_PASS = <password>;

module.exports.EMAIL_SENDER = <sender_email_address>;
```