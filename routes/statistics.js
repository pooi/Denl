var express = require('express');
var router = express.Router();
var conn = require('../config/db')();

var oneDayMs = 86400000;
function getTodayMs(){
    var d = new Date();
    return d.getTime();
}
function dateToMs(date){
    var temp = date.split('-');
    var year = parseInt(temp[0]);
    var month = parseInt(temp[1]);
    var day = parseInt(temp[2]);
    var k = Date.parse(date);
    return k;
}
function getTodayMsWithoutTime(){
    var date = new Date();
    var dd = date.getDate();
    var mm = date.getMonth() + 1; //January is 0!

    var yyyy = date.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    var dateString = yyyy + "- " + mm + "- " + dd;
    return dateToMs(dateString);
}



/* GET home page. */
router.get('/', function (req, res) {

    res.render('404', {userData: JSON.stringify(req.session.userData)});
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

        var startDate = getTodayMsWithoutTime() - oneDayMs * 7; // 일주일 전
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
        var sql = "SELECT B.category_name_ko as label, count(*) as data " +
            "FROM lost as A " +
            "LEFT OUTER JOIN (" +
            "SELECT DISTINCT category_name, category_name_ko, category_name_en FROM category " +
            ") as B on (A.category = B.category_name)";
        var conditions = [];
        var params = [];

        var data = req.body;

        var startDate = getTodayMsWithoutTime() - oneDayMs * 7; // 일주일 전
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
