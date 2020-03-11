const fs = require('fs');
const path = require('path');

const cartDataDir = path.join(
    path.dirname(process.mainModule.filename),
    'data',
    'cart.json'
);

const getCartFromFile = callback => {
    fs.readFile(cartDataDir, (err, fileContent) => {
        if(err) {
            callback({products: [], totalPrice: 0});
        } else {
            callback(JSON.parse(fileContent));
        }
    });
};

module.exports = class Cart {
    static addProduct(id, productPrice) {
        // Fetch the previous cart
        getCartFromFile(cart => {
            let existingProductIndex = cart.products.findIndex(prod => prod.id === id);
            let existingProduct = cart.products[existingProductIndex];
            let updatedProduct;
            if(existingProduct) {
                updatedProduct = {...existingProduct};
                updatedProduct.quantity = updatedProduct.quantity + 1;
                cart.products[existingProductIndex] = updatedProduct;
            } else {
                updatedProduct = {
                    id: id,
                    quantity: 1
                };
                cart.products = [...cart.products, updatedProduct];
            }
            cart.totalPrice = cart.totalPrice + +productPrice;
            fs.writeFile(cartDataDir, JSON.stringify(cart), err => {
                if(err) {
                    console.log(err);
                }
            });
        });
    }

    static removeProduct(productId, productPrice) {
        getCartFromFile(cart => {
            if(cart.products.length > 0) {
                let updatedProducts = [];
                let count = 0;
                for(let product of cart.products) {
                    if(product.id === productId) {
                        count = product.quantity;
                        console.log('count: ', count);
                        continue;
                    }
                    updatedProducts.push(product);
                }
                cart.products = updatedProducts;
                for(let index = 0; index < count; index++) {
                    cart.totalPrice = cart.totalPrice - +productPrice;
                    console.log('totalPrice: ', cart.totalPrice);
                }
                fs.writeFile(cartDataDir, JSON.stringify(cart), err => {
                    if(err) {
                        console.log(err);
                    }
                });
            }
        });
    }
}