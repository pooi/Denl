var express = require('express');
var async = require('async');
var router = express.Router();
var conn = require('../config/db')();

/* GET home page. */
router.get('/', function (req, res) {
    var sql = 'select * from lost';
    var sql2 = 'select * from lost';
    // var wfa = [];
    // function setValue(value) {
    //     wfa = value;
    //     console.log(wfa);
    // }
    async.parallel([
        function(callback){
            conn.query(sql, function (err, results) {
                if(err){
                    console.log(err);
                }
                else{
                    callback(null, {'a':results});
                }
            })
        },
        function(callback){
            conn.query(sql, function (err, results) {
                if(err){
                    console.log(err);
                }
                else{
                    callback(null, {'b':results});
                }
            })
        }
    ], function(err,results){
        if(err) {
            console.log(err);
        }
        else{
            console.log(results[0]['a']);
            // res.render('index', {userData: JSON.stringify(req.session.userData)});
        }
    })
});

module.exports = router;
