var express = require('express');
var router = express.Router();
var conn = require('../config/db')();
var support = require('./support-func');


/* GET home page. */
router.get('/', function (req, res) {

    res.render('404', {userData: JSON.stringify(req.session.userData)});
});

router.post('/totalSubcategory', function (req, res) {

    var sql = "SELECT B.ko as label, count(*) as data " +
        "FROM lost as A " +
        "LEFT OUTER JOIN ( " +
        "SELECT name, ko, en FROM category " +
        ") as B on (A.subcategory = B.name) " +
        "GROUP BY label ORDER BY data DESC, label ASC;";

    console.log(sql);

    conn.query(sql, [], function(err, results) {
        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        } else {

            var labels = [];
            var data = [];
            for(var i=0; i<results.length; i++){
                var result = results[i];
                labels.push(result.label);
                data.push(result.data);
            }
            var newData = {
                labels: labels,
                data: data
            };

            res.send(newData);
        }
    });

});

router.post('/dailySubcategory', function (req, res) {

    if(req.body){

        var column = 'subcategory';
        var sql = "SELECT B.ko as label, count(*) as data " +
                    "FROM lost as A " +
                    "LEFT OUTER JOIN (" +
                    "SELECT name, ko, en FROM category " +
                    ") as B on (A.subcategory = B.name)";
        var conditions = [];
        var params = [];

        var data = req.body;

        var period = 7;
        if(data.hasOwnProperty('period')){
            period = data.period;
        }

        var startDate = support.getTodayMsWithoutTime() - support.oneDayMs * period; // 일주일 전
        if(data.hasOwnProperty('start')){
            startDate = data.start;
        }
        conditions.push(" {0} <= rgt_date".format(startDate));
        params.push(startDate);

        if(data.hasOwnProperty('finish')){
            var finishDate = data.finish;
            conditions.push(" rgt_date <= {0}".format(finishDate));
            params.push(finishDate);
        }

        if(conditions.length > 0){
            sql += " WHERE";
        }
        for(var i=0; i<conditions.length; i++){
            sql += conditions[i];
            if(i+1 < conditions.length){
                sql += " AND";
            }
        }

        var sql2 = " GROUP BY label ORDER BY data DESC, label ASC";
        sql += sql2;

        console.log(sql);

        conn.query(sql, params, function(err, results) {
            if (err) {
                console.log(err);
                res.status(500).send("Internal Server Error");
            } else {

                var labels = [];
                var data = [];
                for(var i=0; i<results.length; i++){
                    var result = results[i];
                    labels.push(result.label);
                    data.push(result.data);
                }
                var newData = {
                    labels: labels,
                    data: data
                };

                res.send(newData);
            }
        });


    }else{
        res.status(500).send("Internal Server Error");
    }

});

router.post('/dailyCategory', function (req, res) {

    if(req.body){

        var column = 'category';
        var sql = "SELECT B.ko as label, count(*) as data " +
            "FROM lost as A " +
            "LEFT OUTER JOIN (" +
            "SELECT * FROM master_category " +
            ") as B on (A.category = B.name)";
        var conditions = [];
        var params = [];

        var data = req.body;

        var period = 7;
        if(data.hasOwnProperty('period')){
            period = data.period;
        }

        var startDate = support.getTodayMsWithoutTime() - support.oneDayMs * period; // 일주일 전
        if(data.hasOwnProperty('start')){
            startDate = data.start;
        }
        conditions.push(" {0} <= rgt_date".format(startDate));
        params.push(startDate);

        if(data.hasOwnProperty('finish')){
            var finishDate = data.finish;
            conditions.push(" rgt_date <= {0}".format(finishDate));
            params.push(finishDate);
        }

        if(conditions.length > 0){
            sql += " WHERE";
        }
        for(var i=0; i<conditions.length; i++){
            sql += conditions[i];
            if(i+1 < conditions.length){
                sql += " AND";
            }
        }

        var sql2 = " GROUP BY label ORDER BY data DESC, label ASC";
        sql += sql2;

        console.log(sql);

        conn.query(sql, params, function(err, results) {
            if (err) {
                console.log(err);
                res.status(500).send("Internal Server Error");
            } else {

                var labels = [];
                var data = [];
                for(var i=0; i<results.length; i++){
                    var result = results[i];
                    labels.push(result.label);
                    data.push(result.data);
                }
                var newData = {
                    labels: labels,
                    data: data
                };

                res.send(newData);
            }
        });


    }else{
        res.status(500).send("Internal Server Error");
    }

});


module.exports = router;
