const mongoose = require('mongoose');

const Product = require('./product');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cart: {
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            }, quantity: {
                type: Number,
                required: true
            }}]
    }
});

userSchema.methods.addToCart = function(productId) {
    const cartProductIndex = this.cart.items.findIndex(cp => cp.productId.toString() === productId.toString());
    let newQuantity = 1;
    const updatedCartItems = [ ...this.cart.items ];
    if(cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            productId: productId,
            quantity: 1
        });
    }
    const updatedCart = { items: updatedCartItems }
    this.cart = updatedCart;
    return this.save();
}

userSchema.methods.deleteItemFromCart = function(productId) {
    const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString());
    this.cart.items = updatedCartItems;
    return this.save();
}

userSchema.methods.clearCart = function() {
    this.cart = {
        items: []
    };
    return this.save();
}

// module.exports = mongoose.model('User', userSchema, 'users');
module.exports = mongoose.model('User', userSchema);
