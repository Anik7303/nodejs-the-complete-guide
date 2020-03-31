const { body } = require('express-validator');

module.exports = [
    body('title')
        .trim()
        .isLength({ min: 5 }),
    body('content')
        .trim()
        .isLength({ min: 5 })
];
