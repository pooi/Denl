var express = require('express');
var router = express.Router();
var conn = require('../config/db')();

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

function msToDate(ms) {
    var date = new Date(ms);
    var dd = date.getDate();
    var mm = date.getMonth() + 1; //January is 0!

    var yyyy = date.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    var dateString = yyyy + "-" + mm + "-" + dd;
    return dateString;
}

/* GET home page. */
router.get('/', function(req, res, next) {

    var sql = 'SELECT * FROM category';
    conn.query(sql, [], function (err, results) {
        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        }
        var category = {};
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
        if(req.session)
            res.render('index', {userData: JSON.stringify(req.session.userData), category: JSON.stringify(category)});
        else
            res.render('index', {userData: "", category: JSON.stringify(category)});
    });

    // if(req.session)
    //     res.render('index', {userData: JSON.stringify(req.session.userData)});
    // else
    //     res.render('index', {userData: ""});

});

router.post('/recent', function (req, res) {
    var sql = "SELECT * FROM lost ORDER BY id DESC limit 0, 10;";
    console.log(sql);
    conn.query(sql, [], function(err, results) {
        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        } else {

            var newResults = [];
            for(var i=0; i<results.length; i++){
                var result = results[i];
                var json = JSON.stringify(result);
                // console.log("json1: ", json);
                json = json.split('"[').join('[');
                json = json.split(']"').join(']');
                json = json.split('"{').join('{');
                json = json.split('}"').join('}');

                json = json.split('\\"').join('\"');
                // console.log("json2: ", json);
                newResults.push(JSON.parse(json));
            }

            // console.log("newResults: ", newResults);
            // var json = JSON.stringify(newResults);
            // console.log(json);
            res.send(newResults);
        }
    });
});

router.post('/search', function (req, res) {

    var data = req.body;

    var sql = "SELECT * FROM lost";
    var conditions = [];
    var params = [];
    if(data.hasOwnProperty('dcv_filter_item')){
        item = data.dcv_filter_item;
        if(item.isAllday){
            if(item.alldayDate !== null){
                conditions.push(" dcv_date=?");
                params.push(dateToMs(item.alldayDate));
            }
        }else{
            if(item.startDate !== null){
                conditions.push(" ?<=dcv_date");
                params.push(dateToMs(item.startDate));
            }
            if(item.finishDate !== null){
                conditions.push(" dcv_date<=?");
                params.push(dateToMs(item.finishDate));
            }
        }
    }

    if(data.hasOwnProperty('rgt_filter_item')){
        item = data.rgt_filter_item;
        if(item.isAllday){
            if(item.alldayDate !== null){
                conditions.push(" rgt_date=?");
                params.push(dateToMs(item.alldayDate));
            }
        }else{
            if(item.startDate !== null){
                conditions.push(" ?<=rgt_date");
                params.push(dateToMs(item.startDate));
            }
            if(item.finishDate !== null){
                conditions.push(" rgt_date<=?");
                params.push(dateToMs(item.finishDate));
            }
        }
    }


    if(data.hasOwnProperty('tags')){
        var tagCond = "";
        var tags = req.body.tags;
        for(var i=0; i<tags.length; i++){
            var tag = tags[i];
            tag = tag.trim();
            tagCond += " tags LIKE ? OR description LIKE ?";
            params.push("%" + tag + "%");
            params.push("%" + tag + "%");
            if(i+1 < tags.length){
                tagCond += " OR ";
            }
        }
        if(tagCond.length > 0){
            tagCond = " (" + tagCond + ")";
            conditions.push(tagCond);
        }
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
    sql +=  " ORDER BY id DESC;";

    // var sql = "SELECT * FROM lost ORDER BY id DESC;";
    conn.query(sql, params, function(err, results) {
        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        } else {

            var newResults = [];
            for(var i=0; i<results.length; i++){
                var result = results[i];
                var json = JSON.stringify(result);
                // console.log("json1: ", json);
                json = json.split('"[').join('[');
                json = json.split(']"').join(']');
                json = json.split('"{').join('{');
                json = json.split('}"').join('}');

                json = json.split('\\"').join('\"');
                // console.log("json2: ", json);
                newResults.push(JSON.parse(json));
            }

            // console.log("newResults: ", newResults);
            // var json = JSON.stringify(newResults);
            // console.log(json);
            res.send(newResults);
        }
    });

});

module.exports = router;
