var express = require('express');
var async = require('async');
var router = express.Router();
var conn = require('../config/db')();

/* GET home page. */
router.get('/', function (req, res) {
    var sql = 'select * from lost where status="WFA"';
    var sql2 = 'select * from lost where id IN (select lost_id from request)';
    var sql3 = 'SELECT * FROM category';

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
            conn.query(sql3, [], function (err, results) {
                if (err) {
                    console.log(err);
                    res.status(500).send("Internal Server Error");
                }
                var category = {}
                for (var i = 0; i < results.length; i++) {
                    var result = results[i];
                    if(! category.hasOwnProperty(result.category_name)){
                        category[result.category_name] = {
                            subcategory: [],
                            name: result.category_name,
                            ko: result.category_name_ko,
                            en: result.category_name_en
                        }
                    }
                    category[result.category_name].subcategory.push({
                        name: result.name,
                        ko: result.ko,
                        en: result.en
                    })
                }
                // console.log(photos);
                // res.render('items', {userData: JSON.stringify(req.session.userData), data: json, category: JSON.stringify(category), tempImg: photos});
                // console.log(JSON.stringify(category));
                callback(null, JSON.stringify(category));
            });
        }
    ], function(err,results){
        if(err) {
            console.log(err);
        }
        else{
            console.log(results[2])
            res.render('manage', {userData: JSON.stringify(req.session.userData), WFA : results[0], WFRQ: results[1], category : results[2]});
        }
    })
});

module.exports = router;
