const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    user: {
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        username: {
            type: String,
            required: true
        }
    },
    products: [{
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        title: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        imageUrl: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            require: true
        }
    }]
});

// module.exports = mongoose.model('Order', orderSchema, 'orders');
module.exports = mongoose.model('Order', orderSchema);
