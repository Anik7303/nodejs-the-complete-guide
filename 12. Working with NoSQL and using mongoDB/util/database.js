const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const envKeys = require('../keys');

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect(envKeys.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(client => {
            _db = client.db();
            callback();
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
};

const getDb = () => {
    if(_db) {
        return _db;
    }
    throw 'No database found!';
}

module.exports.mongoConnect = mongoConnect;
module.exports.getDb = getDb;