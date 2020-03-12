const db = require('../util/database');

const Cart = require('./cart');

module.exports = class Product {
    constructor(id, title, imageUrl, description, price) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        return db.execute('INSERT INTO products (title, price, description, imageUrl) VALUES (?, ?, ?, ?)', [this.title, this.price, this.description, this.imageUrl]);
    }

    update() {
        return db.execute('UPDATE products SET title = ?, price = ?, description = ?, imageUrl = ? WHERE id = ?', [this.title, this.price, this.description, this.imageUrl, this.id]);
    }

    static fetch(productId) {
        return db.execute('SELECT * FROM products WHERE id = ?', [productId]);
    }

    static fetchAll() {
        return db.execute('SELECT * FROM products');
    }

    static delete(productId) {
        return db.execute('DELETE FROM products WHERE id = ?', [productId]);
    }
}