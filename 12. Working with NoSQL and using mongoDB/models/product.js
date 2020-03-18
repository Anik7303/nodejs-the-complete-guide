const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;
const ObjectId = require('mongodb').ObjectId;

class Product {
    constructor(title, price, imageUrl, description, id) {
        this.title = title;
        this.price = price;
        this.imageUrl = imageUrl;
        this.description = description;
        this._id = id ? new ObjectId(id) : null;
    }

    save() {
        const db = getDb();
        let dbOp;
        if(this._id) {
            // update the existing product
            dbOp = db.collection('products')
                .updateOne({ _id: this._id }, { $set: this });
        } else {
            // insert new product
            dbOp = db.collection('products')
                .insertOne(this);
        }
        return dbOp
            .then(result => {
                return result;
            })
            .catch(err => console.log(err));
    }

    static findById(productId) {
        const db = getDb();
        return db.collection('products')
            .find({
                _id: new ObjectId(productId)
            })
            .next()
            .then(product => {
                return product;
            })
            .catch(err => console.log(err));
    }

    static fetchAll() {
        const db = getDb();
        return db.collection('products')
            .find()
            .toArray()
            .then(products => {
                return products;
            })
            .catch(err => console.log(err));
    }

    static deleteById(productId) {
        const db = getDb();
        return db.collection('products')
            .deleteOne({
                _id: new ObjectId(productId)
            })
            .then(result => {
                return result;
            })
            .catch(err => console.log(err));
    }
}

module.exports = Product;