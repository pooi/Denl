module.exports = function () {
    var mysql = require('mysql');
    var conn = mysql.createConnection({
        host: 'INPUT_HOST_URL',
        user: 'INPUT_USER_NAME',
        password: 'INPUT_PASSWORD',
        database: 'INPUT_DATABASE_NAME'
    });
    conn.connect();
    return conn;
}