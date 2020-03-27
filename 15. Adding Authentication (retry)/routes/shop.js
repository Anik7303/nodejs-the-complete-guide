const express = require('express');

const isAuth = require('../middlewares/is-auth');
const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/product/:productId', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postDeleteCartProduct);

router.get('/orders', isAuth, shopController.getOrders);

router.post('/create-order', isAuth, shopController.postOrder);

module.exports = router;
