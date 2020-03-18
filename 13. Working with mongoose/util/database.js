const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const uri = 'mongodb+srv://anik7703:o9bQGRkq9bpFeHWq@cluster0-5fdut.mongodb.net/shop?retryWrites=true&w=majority';

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
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