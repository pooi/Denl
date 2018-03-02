module.exports = function () {
    var data = {
        secret: 'INPUT_SECRET_CODE',
        resave: false,
        saveUninitialized: true,
        store: new MySQLStore({
            host: 'INPUT_HOST_URL',
            port: INPUT_PORT_NUMBER,
            user: 'INPUT_USER_NAME',
            password: 'INPUT_PASSWORD',
            database: 'INPUT_DATABASE_NAME'
        })
    };
    return data;
};