var express = require('express');
var async = require('async');
var router = express.Router();
var conn = require('../config/db')();
var get_date = function(num){
    var d = new Date(Date.now());
    var day = d.getDate();
    d.setDate(day - num);
    var date_sentence = Date.parse(d);
    return date_sentence;
}

/* GET home page. */
function manage (req, res) {
    var date_sentence = get_date(8);
    var recent_period = get_date(30);
    var sql = 'select * from lost where status="WFA";' +
        'select * from lost where id IN (select distinct lost_id from request where rgt_date > '+ recent_period + ');' +
        'select * from lost where id IN (select lost_id from request where rgt_date < '+ date_sentence + ');SELECT * FROM category';
    conn.query(sql, function (err, results) {
        if (err) {
            console.log(err);
        }
        else {
            var result_arr = [];
            for(var j=0; j<results.length; j++){
                var temp_result = results[j];
                if(j == results.length-1){
                    var category = {}
                    for (var i = 0; i < temp_result.length; i++) {
                        var result = temp_result[i];
                        if (!category.hasOwnProperty(result.category_name)) {
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
                    console.log(JSON.stringify(category));
                    result_arr.push(JSON.stringify(category));
                }
                else{
                    var json = JSON.stringify(temp_result);
                    json = json.split('"[').join('[');
                    json = json.split(']"').join(']');
                    json = json.split('"{').join('{');
                    json = json.split('}"').join('}');
                    result_arr.push(json);
                }
            }
            res.render('manage', {
                userData: JSON.stringify(req.session.userData),
                WFA: result_arr[0],
                WFRQ: result_arr[1],
                category: result_arr[3],
                WFL: results[2]
            });
        }
    })
}

function filter(req, res){
    // if(data.hasOwnProperty('category')){
    //     var category = null;
    //     var subcategory = null;
    //     if(data.category !== ''){
    //         category = data.category;
    //     }
    //     if(data.subcategory !== ''){
    //         subcategory = data.subcategory;
    //     }
    //     // console.log(category, subcategory);
    //     if(category !== null && subcategory !== null){
    //         conditions.push(" category=? AND subcategory=?");
    //         params.push(category.name);
    //         params.push(subcategory.name);
    //     }else if(category !== null){
    //         conditions.push(" category=?");
    //         params.push(category.name);
    //     }
    // }

    // if(data.hasOwnProperty('dcv_filter_item')){
    //     item = data.dcv_filter_item;
    //     if(item.isAllday){
    //         if(item.alldayDate !== null){
    //             conditions.push(" dcv_date=?");
    //             params.push(dateToMs(item.alldayDate));
    //         }
    //     }else{
    //         if(item.startDate !== null){
    //             conditions.push(" ?<=dcv_date");
    //             params.push(dateToMs(item.startDate));
    //         }
    //         if(item.finishDate !== null){
    //             conditions.push(" dcv_date<=?");
    //             params.push(dateToMs(item.finishDate));
    //         }
    //     }
    // }
    //
    // if(data.hasOwnProperty('rgt_filter_item')){
    //     item = data.rgt_filter_item;
    //     if(item.isAllday){
    //         if(item.alldayDate !== null){
    //             conditions.push(" rgt_date=?");
    //             params.push(dateToMs(item.alldayDate));
    //         }
    //     }else{
    //         if(item.startDate !== null){
    //             conditions.push(" ?<=rgt_date");
    //             params.push(dateToMs(item.startDate));
    //         }
    //         if(item.finishDate !== null){
    //             conditions.push(" rgt_date<=?");
    //             params.push(dateToMs(item.finishDate));
    //         }
    //     }
    // }

    // if(data.hasOwnProperty('building')){
    //     var building = data.building;
    //     if(building.length > 0){
    //         conditions.push(" building=?");
    //         params.push(building);
    //     }
    // }
    //
    // if(data.hasOwnProperty('room')){
    //     var room = data.room;
    //     if(room.length > 0){
    //         conditions.push(" room=?");
    //         params.push(room);
    //     }
    // }

    // if(data.hasOwnProperty('tags')){
    //     var tagCond = "";
    //     var tags = req.body.tags;
    //     for(var i=0; i<tags.length; i++){
    //         var tag = tags[i];
    //         tag = tag.trim();
    //         tagCond += " brand LIKE ? OR tags LIKE ? OR recognition_tags LIKE ?";
    //         params.push("%" + tag + "%");
    //         params.push("%" + tag + "%");
    //         params.push("%" + tag + "%");
    //         if(i+1 < tags.length){
    //             tagCond += " OR ";
    //         }
    //     }
    //     if(tagCond.length > 0){
    //         tagCond = " (" + tagCond + ")";
    //         conditions.push(tagCond);
    //     }
    // }
    var data = req.body;
    console.log("data", data);

    var sql = "SELECT * FROM lost";
    var conditions = [];
    var params = [];

    if(data.hasOwnProperty('id')){
        var id = data.id;
        console.log(id);
        if(id !== null){
            conditions.push(" id=?");
            params.push(id);
        }
    }

    if(data.hasOwnProperty('status')){
        var status = data.status;
        if(status !== null){
            conditions.push(" status=?");
            params.push(status);
        }
    }

    if(data.hasOwnProperty('category')){
        var category = data.category;
        if(category !== null){
            conditions.push(" category=?");
            params.push(category.name);
        }
    }

    if(data.hasOwnProperty('subcategory')){
        var subcategory = data.subcategory;
        if(subcategory !== null){
            conditions.push(" subcategory=?");
            params.push(subcategory.name);
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

    console.log(sql);
    console.log(params);
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

}


router.get('/', manage);
router.post('/filter', filter)
// router.get('/home', manage_home);
// router.get('/lost', manage_lost);

module.exports = router;

// function manage_lost (req, res) {
//     var sql = 'select * from lost where status="WFA";SELECT * FROM category';
//     conn.query(sql, function (err, results) {
//         if (err) {
//             console.log(err);
//         }
//         else {
//             var result_arr = [];
//             for(var j=0; j<results.length; j++){
//                 var temp_result = results[j];
//                 if(j == results.length-1){
//                     var category = {}
//                     for (var i = 0; i < temp_result.length; i++) {
//                         var result = temp_result[i];
//                         if (!category.hasOwnProperty(result.category_name)) {
//                             category[result.category_name] = {
//                                 subcategory: [],
//                                 name: result.category_name,
//                                 ko: result.category_name_ko,
//                                 en: result.category_name_en
//                             }
//                         }
//                         category[result.category_name].subcategory.push({
//                             name: result.name,
//                             ko: result.ko,
//                             en: result.en
//                         })
//                     }
//                     result_arr.push(JSON.stringify(category));
//                 }
//                 else{
//                     var json = JSON.stringify(temp_result);
//                     json = json.split('"[').join('[');
//                     json = json.split(']"').join(']');
//                     json = json.split('"{').join('{');
//                     json = json.split('}"').join('}');
//                     result_arr.push(json);
//                 }
//             }
//             res.send(result_arr);
//         }
//     })
// }


// async.parallel([
//     function (callback) {
//         conn.query(sql, function (err, results) {
//             if (err) {
//                 console.log(err);
//             }
//             else {
//                 var json = JSON.stringify(results);
//                 json = json.split('"[').join('[');
//                 json = json.split(']"').join(']');
//                 json = json.split('"{').join('{');
//                 json = json.split('}"').join('}');
//                 callback(null, json);
//             }
//         })
//     },
//     function (callback) {
//         conn.query(sql2, function (err, results) {
//             if (err) {
//                 console.log(err);
//             }
//             else {
//                 var json = JSON.stringify(results);
//                 json = json.split('"[').join('[');
//                 json = json.split(']"').join(']');
//                 json = json.split('"{').join('{');
//                 json = json.split('}"').join('}');
//                 callback(null, json);
//             }
//         })
//     },
//     function (callback) {
//         conn.query(sql3, [], function (err, results) {
//             if (err) {
//                 console.log(err);
//                 res.status(500).send("Internal Server Error");
//             }
//             var category = {}
//             for (var i = 0; i < results.length; i++) {
//                 var result = results[i];
//                 if (!category.hasOwnProperty(result.category_name)) {
//                     category[result.category_name] = {
//                         subcategory: [],
//                         name: result.category_name,
//                         ko: result.category_name_ko,
//                         en: result.category_name_en
//                     }
//                 }
//                 category[result.category_name].subcategory.push({
//                     name: result.name,
//                     ko: result.ko,
//                     en: result.en
//                 })
//             }
//             // console.log(photos);
//             // res.render('items', {userData: JSON.stringify(req.session.userData), data: json, category: JSON.stringify(category), tempImg: photos});
//             // console.log(JSON.stringify(category));
//             callback(null, JSON.stringify(category));
//         });
//     },
//     function (callback) {
//         conn.query(sql4, function (err, results) {
//             if (err) {
//                 console.log(err);
//             }
//             else {
//                 var json = JSON.stringify(results);
//                 json = json.split('"[').join('[');
//                 json = json.split(']"').join(']');
//                 json = json.split('"{').join('{');
//                 json = json.split('}"').join('}');
//                 callback(null, json);
//             }
//         })
//     }
// ], function (err, results) {
//     if (err) {
//         console.log(err);
//     }
//     else {
//         // console.log(results[2])
//         res.render('manage', {
//             userData: JSON.stringify(req.session.userData),
//             WFA: results[0],
//             WFRQ: results[1],
//             category: results[2],
//             WFL: results[3]
//         });
//     }
// });