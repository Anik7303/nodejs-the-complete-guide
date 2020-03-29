const fs = require('fs');

module.exports.deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if(err) throw err;
    });
}
