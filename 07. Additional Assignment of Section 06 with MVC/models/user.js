const path = require('path');
const fs = require('fs');

const dataDir = path.join(path.dirname(process.mainModule.filename), 'data', 'users.json');

const getUsersFromFile = (callback) => {
    fs.readFile(dataDir, (err, data) => {
        if(err) {
            callback([]);
        } else {
            callback(JSON.parse(data));
        }
    });
}

module.exports = class User {
    constructor(name, imageLink) {
        this.name = name;
        this.imageLink = imageLink;
    }

    save() {
        getUsersFromFile((users) => {
            users.push(this);
            fs.writeFile(dataDir, JSON.stringify(users), (err) => {
                if(err) {
                    console.log(err);
                }
            });
        });
    }

    static fetchAll(callback) {
        getUsersFromFile(callback);
    }
}