var express = require('express');
var router = express.Router();
var conn = require('../config/db')();
var support = require('./support-func');

/* GET home page. */
router.get('/', function(req, res, next) {

    var sql = 'SELECT A.*, B.name as category_name, B.ko as category_name_ko, B.en as category_name_en ' +
        'FROM category as A ' +
        'LEFT OUTER JOIN ( ' +
        'SELECT * FROM master_category ' +
        ') as B on (A.master_category_id = B.id); ';
    conn.query(sql, [], function (err, results) {
        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        }
        var category = support.parseCategoryResult(results);

        if(req.session)
            res.render('index', {userData: JSON.stringify(req.session.userData), category: JSON.stringify(category)});
        else
            res.render('index', {userData: "", category: JSON.stringify(category)});
    });

});

router.post('/category', function (req, res) {
    var sql = 'SELECT A.*, B.name as category_name, B.ko as category_name_ko, B.en as category_name_en ' +
        'FROM category as A ' +
        'LEFT OUTER JOIN ( ' +
        'SELECT * FROM master_category ' +
        ') as B on (A.master_category_id = B.id); ';
    conn.query(sql, [], function (err, results) {
        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        }

        var category = support.parseCategoryResult(results);

        res.send({
            category: category
        });
    });
});

router.post('/getMsgCount', function (req, res) {

    var data = req.body;
    var params = [];

    var sql = "select count(id) as count from msg WHERE user_id=? AND (is_read is null or is_read='0');";
    params.push(data.user_id);

    conn.query(sql, params, function(err, results) {
        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        } else {
            var result = results[0];
            // console.log(result.count);
            res.send(result.count + "");
        }
    });
});

router.post('/getMsg', function (req, res) {

    var data = req.body;
    var params = [];

    var sql = "";
    if(data.hasOwnProperty("isNew") && data.isNew){
        sql = "select * from msg WHERE user_id=? AND (is_read is null or is_read='0') ORDER BY id DESC;";
        params.push(data.user_id);
    }else{
        sql = "select * from msg WHERE user_id=? AND (is_read is not null AND is_read='1') ORDER BY id DESC;";
        params.push(data.user_id);
    }

    conn.query(sql, params, function(err, results) {
        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        } else {
            res.send(results);
        }
    });
});

router.post('/setMsgRead', function (req, res) {
    if(req.body){
        var msg = req.body.msg;
        var sql = 'UPDATE msg SET is_read=1 WHERE id=?;';
        conn.query(sql, [msg.id], function(err, results) {
            if (err) {
                console.log(err);
                res.status(500).send("Internal Server Error");
            } else {
                res.send(results);
            }
        });

    }else{
        res.status(500).send("Internal Server Error");
    }
});

router.post('/recent', function (req, res) {
    var sql = "SELECT * FROM lost WHERE status <> 'COM' ORDER BY id DESC limit 0, 12;";
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

    var isRequireLimit = false;
    var numOfItem = 10;
    var page = 0;
    if(data.hasOwnProperty('page')){
        page = data.page - 1;
        isRequireLimit = true;
    }

    var sql = "SELECT * FROM lost";
    var conditions = [];
    var params = [];

    if(data.hasOwnProperty('category')){
        var category = null;
        var subcategory = null;
        if(data.category !== ''){
            category = data.category;
            support.hitMasterCategory(category.id);
        }
        if(data.subcategory !== ''){
            subcategory = data.subcategory;
            support.hitCategory(subcategory.name);
        }
        // console.log(category, subcategory);
        if(category !== null && subcategory !== null){
            conditions.push(" category=? AND subcategory=?");
            params.push(category.name);
            params.push(subcategory.name);
        }else if(category !== null){
            conditions.push(" category=?");
            params.push(category.name);
        }
    }

    if(data.hasOwnProperty('dcv_filter_item')){
        item = data.dcv_filter_item;
        if(item.isAllday){
            if(item.alldayDate !== null){
                conditions.push(" dcv_date=?");
                params.push(support.dateToMs(item.alldayDate));
            }
        }else{
            if(item.startDate !== null){
                conditions.push(" ?<=dcv_date");
                params.push(support.dateToMs(item.startDate));
            }
            if(item.finishDate !== null){
                conditions.push(" dcv_date<=?");
                params.push(support.dateToMs(item.finishDate));
            }
        }
    }

    if(data.hasOwnProperty('rgt_filter_item')){
        item = data.rgt_filter_item;
        if(item.isAllday){
            if(item.alldayDate !== null){
                conditions.push(" rgt_date=?");
                params.push(support.dateToMs(item.alldayDate));
            }
        }else{
            if(item.startDate !== null){
                conditions.push(" ?<=rgt_date");
                params.push(support.dateToMs(item.startDate));
            }
            if(item.finishDate !== null){
                conditions.push(" rgt_date<=?");
                params.push(support.dateToMs(item.finishDate));
            }
        }
    }

    if(data.hasOwnProperty('building')){
        var building = data.building;
        if(building.length > 0){
            conditions.push(" building=?");
            params.push(building);
        }
    }

    if(data.hasOwnProperty('room')){
        var room = data.room;
        if(room.length > 0){
            conditions.push(" room=?");
            params.push(room);
        }
    }


    if(data.hasOwnProperty('tags')){
        var tagCond = "";
        var tags = req.body.tags;
        for(var i=0; i<tags.length; i++){
            var tag = tags[i];
            tag = tag.trim();
            tagCond += " brand LIKE ? OR tags LIKE ? OR recognition_tags LIKE ?";
            params.push("%" + tag + "%");
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

    if(isRequireLimit){
        var limit = " LIMIT " + (page * numOfItem) + ", " + numOfItem;
        sql +=  " ORDER BY id DESC " + limit + ";";
    }else{
        sql +=  " ORDER BY id DESC;";
    }

    console.log(sql);

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
