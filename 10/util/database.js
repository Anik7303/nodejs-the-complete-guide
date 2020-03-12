const mysql =require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    database: 'node-complete',
    user: 'root',
    password: 'AnikMohammad'
});

module.exports = pool.promise();