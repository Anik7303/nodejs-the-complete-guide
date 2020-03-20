const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;
const ObjectId = mongodb.ObjectId;

class User {
    constructor(username, email, cart, id) {
        this.username = username;
        this.email = email;
        this.cart = cart;
        this._id = id ? new ObjectId(id) : null;
    }

    save() {
        const db = getDb();
        return db.collection('users')
            .insertOne(this)
            .then(result => {
                return result;
            })
            .catch(err => console.log(err));
    }

    addToCart(productId) {
        const cartProductIndex = this.cart.items.findIndex(cp => cp.productId.toString() === productId.toString());
        let newQuantity = 1;
        const updatedCartItems = [ ...this.cart.items ];
        if(cartProductIndex >= 0) {
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        } else {
            updatedCartItems.push({ productId: new ObjectId(productId), quantity: newQuantity });
        }
        const updatedCart = { items: updatedCartItems };
        const db = getDb();
        return db.collection('users')
            .updateOne(
                { _id: this._id },
                { $set: { cart: updatedCart }}
            );
    }

    getCart() {
        const db = getDb();
        const productIds = this.cart.items.map(item => item.productId);
        return db.collection('products')
            .find({ _id: { $in: productIds } })
            .toArray()
            .then(products => {
                return products.map(product => {
                    return {
                        ...product,
                        quantity: this.cart.items.find(item => item.productId.toString() === product._id.toString()).quantity
                    };
                });
            })
            .catch(err => console.log(err));
    }

    deleteFromCart(productId) {
        const db = getDb();
        let updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString());
        const updatedCart = { items: updatedCartItems };
        return db.collection('users')
            .updateOne(
                { _id: this._id },
                { $set: { cart: updatedCart }}
            );
    }

    addOrder() {
        const db = getDb();
        return this.getCart()
            .then(products => {
                const order = {
                    items: products,
                    user: {
                        _id: new ObjectId(this._id),
                        username: this.username,
                        email: this.email
                    }
                };
                return db.collection('orders')
                    .insertOne(order);
            })
            .then(result => {
                this.cart = { items: [] };
                return db.collection('users')
                    .updateOne(
                        { _id: new ObjectId(this._id) },
                        { $set: { cart: this.cart }}
                    );
            })
            .catch(err => console.log(err));
    }

    getOrders() {
        const db = getDb();
        return db.collection('orders')
            .find({ 'user._id': new Object(this._id) })
            .toArray();
    }

    static findById(userId) {
        const db = getDb();
        return db.collection('users')
            .findOne({ _id: new ObjectId(userId) })
            .then(user => {
                return user;
            })
            .catch(err => console.log(err));
    }

    static fetchAll() {
        const db = getDb();
        return db.collection('users')
            .find()
            .toArray()
            .then(users => {
                return users;
            })
            .catch(err => console.log(err));
    }
}

module.exports = User;
