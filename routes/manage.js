var express = require('express');
var async = require('async');
var router = express.Router();
var conn = require('../config/db')();
var support = require('./support-func');
var get_date = function(){
    var d = new Date(Date.now());
    var day = d.getDate();
    d.setDate(day - 8);
    var date_sentence = Date.parse(d);
    return date_sentence;
}

/* GET home page. */
function manage (req, res) {
    var date_sentence = get_date();
    var sql = 'select * from lost where status="WFA";select * from lost where id IN (select distinct lost_id from request);select * from lost where id IN (select lost_id from request where rgt_date < '+ date_sentence + ');SELECT * FROM category';
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



router.get('/', manage);
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