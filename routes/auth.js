
module.exports = function (app) {

    var express = require('express');
    var exec = require('child_process').exec;
    var session = require('express-session');
    var MySQLStore = require('express-mysql-session')(session);
    var router = express.Router();
    var conn = require('../config/db')();
    var sessionData = require('../config/session')();

    app.use(session(sessionData));


    router.post('/sejong', function (req, res, next) {

        const id = req.body.id;
        const pw = req.body.password;

        var sql = 'SELECT * FROM user WHERE id=?';
        conn.query(sql, [id], function (err, results, fields) {
            if (err) {
                console.log(err);
                res.status(500).send("Internal Server Error");
            }
            if(results.length > 0){
                var COMMAND = 'python3 "{0}/loginSejong.py" --id={1} --pw={2} --only=1';
                var command = COMMAND.format(__dirname, id, pw);
                exec(command, function(err, stdout, stderr) {

                    if(err){
                        console.log(err);
                        res.status(500).send("Internal Server Error");
                    }else{

                        var result = stdout;

                        var data = JSON.parse(result);
                        console.log(data);
                        if(data.status === 'fail'){
                            res.send(data);
                        }else {
                            data = results[0];
                            data.status = 'success';
                            console.log("2", data);
                            req.session.userData = data;
                            console.log('session: ', req.session);
                            req.session.save(function () {
                                res.send(req.session.userData);
                            });
                        }

                        // res.send(data);

                    }

                });

            }else{
                var COMMAND = 'python3 "{0}/loginSejong.py" --id={1} --pw={2}';
                var command = COMMAND.format(__dirname, id, pw);

                exec(command, function(err, stdout, stderr) {

                    if(err){
                        console.log(err);
                        res.status(500).send("Internal Server Error");
                    }else{

                        var result = stdout;

                        var data = JSON.parse(result);
                        console.log(data);
                        if(data.status === 'fail'){
                            res.send(data);
                        }else {
                            delete data.status;

                            var insertSql = 'INSERT INTO user SET ?';
                            conn.query(insertSql, data, function(err, results) {
                                if (err) {
                                    console.log(err);
                                    res.status(500).send("Internal Server Error");
                                } else {
                                    data.status = 'success';
                                    req.session.userData = data;
                                    console.log('session: ', req.session);
                                    req.session.save(function () {
                                        res.send(req.session.userData);
                                    });
                                }

                            });


                        }

                    }

                });
            }
        });

        // var COMMAND = 'python3 "{0}/loginSejong.py" --id={1} --pw={2}';
        // var command = COMMAND.format(__dirname, id, pw);
        // // console.log(command);
        //
        // exec(command, function(err, stdout, stderr) {
        //
        //     // console.log(err, stdout, stderr);
        //
        //     if(err){
        //         console.log(err);
        //         res.status(500).send("Internal Server Error");
        //     }else{
        //
        //         var result = stdout;
        //
        //         var data = JSON.parse(result);
        //         console.log(data);
        //         if(data.status === 'fail'){
        //             res.send(data);
        //         }else {
        //             req.session.userData = data;
        //             console.log('session: ', req.session);
        //             req.session.save(function () {
        //                 res.send(req.session.userData);
        //             });
        //         }
        //
        //         // res.send(data);
        //
        //     }
        //
        // });

    });

    router.get('/logout', function (req, res, next) {

        delete req.session.userData;
        req.session.save(function() {
            var data = {
                status: "success"
            };
            res.send(JSON.stringify(data));
        });

    });

    // module.exports = router;
    return router;

};


