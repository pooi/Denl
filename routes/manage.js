var express = require('express');
var async = require('async');
var router = express.Router();
var conn = require('../config/db')();

/* GET home page. */
router.get('/', function (req, res) {
    var sql = 'select * from lost where status="WFA"';
    var sql2 = 'select * from lost where id IN (select lost_id from request)';
    var sql3 = 'select * from lost where id IN (select lost_id from request)';

    async.parallel([
        function(callback){
            conn.query(sql, function (err, results) {
                if(err){
                    console.log(err);
                }
                else{
                    var json = JSON.stringify(results);
                    json = json.split('"[').join('[');
                    json = json.split(']"').join(']');
                    json = json.split('"{').join('{');
                    json = json.split('}"').join('}');
                    callback(null, json);
                }
            })
        },
        function(callback){
            conn.query(sql2, function (err, results) {
                if(err){
                    console.log(err);
                }
                else{
                    var json = JSON.stringify(results);
                    json = json.split('"[').join('[');
                    json = json.split(']"').join(']');
                    json = json.split('"{').join('{');
                    json = json.split('}"').join('}');
                    callback(null, json);
                }
            })
        },
        function(callback){
            conn.query(sql3, function (err, results) {
                if(err){
                    console.log(err);
                }
                else{
                    var json = JSON.stringify(results);
                    json = json.split('"[').join('[');
                    json = json.split(']"').join(']');
                    json = json.split('"{').join('{');
                    json = json.split('}"').join('}');
                    callback(null, json);
                }
            })
        }
    ], function(err,results){
        if(err) {
            console.log(err);
        }
        else{
            res.render('manage', {userData: JSON.stringify(req.session.userData), WFA : results[0], WFRQ: results[1], WFR: results[2]});
        }
    })
});

module.exports = router;
