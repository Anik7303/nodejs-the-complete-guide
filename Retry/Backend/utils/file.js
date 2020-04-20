const path = require('path');
const fs = require('fs');

const clearImage = (filePath) => {
    const imagePath = path.join(__dirname, filePath);
    fs.unlink(imagePath);
};

module.exports.clearImage = clearImage;
