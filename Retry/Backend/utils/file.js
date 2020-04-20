const path = require('path');
const fs = require('fs');

const clearImage = (filePath) => {
    const imagePath = path.join(__dirname, '..', filePath);
    fs.unlink(imagePath, err => console.log(err));
};

module.exports.clearImage = clearImage;
