const fs = require('fs');
const path = require('path');

const Cart = require('./cart');

const productDataDir = path.join(path.dirname(process.mainModule.filename), 'data', 'products.json');

const getProductsFromFile = (callback) => {
    fs.readFile(productDataDir, (err, fileContent) => {
        if(err) {
            callback([]);
        } else {
            callback(JSON.parse(fileContent));
        }
    });
};

module.exports = class Product {
    constructor(id, title, imageUrl, description, price) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.price = price;
    }

    save() {
        getProductsFromFile((products) => {
            if(this.id) {
                const existingProductIndex = products.findIndex(product => product.id === this.id);
                products[existingProductIndex] = this;
            } else {
                this.id = Math.round(Math.random()*68000).toString();
                products.push(this);
            }
            fs.writeFile(productDataDir, JSON.stringify(products), (err) => {
                if(err) {
                    console.log(err);
                }
            });
        });
    }

    static fetch(productId, callback) {
        getProductsFromFile(products => {
            const product = products.find(p => p.id === productId);
            callback(product);
        });
    }

    static fetchAll(callback) {
        return getProductsFromFile(callback);
    }

    static delete(productId) {
        getProductsFromFile(products => {
            if(products) {
                const updatedProducts = [];;
                let productPrice = '';
                for(let product of products) {
                    console.log(product);
                    if(product.id === productId) {
                        productPrice = product.price;
                        continue;
                    }
                    updatedProducts.push(product);
                }
                fs.writeFile(productDataDir, JSON.stringify(updatedProducts), err => {
                    if(!err) {
                        Cart.removeProduct(productId, productPrice);
                    }
                    console.log(err);
                });
            }
        });
    }
}