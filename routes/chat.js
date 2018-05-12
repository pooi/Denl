var express = require('express');
var router = express.Router();
var conn = require('../config/db')();

/* GET home page. */
router.get('/', function (req, res) {
    var login_user = req.body.id;
    console.log(req.session.userData);
    login_user = req.session.userData.id;
    var sql = "SELECT c.name as name1, c.user1, d.name as name2, c.user2, c.roomport, c.message"
    +" FROM (SELECT a.name, b.user1, b.user2, b.roomport, b.message"
    +" FROM user a, chat b"
    +" WHERE a.id = b.user1 AND (b.user1 = "+ login_user + " OR b.user2 = "+ login_user + ")) c, user d"
    +" WHERE d.id = c.user2;"
    conn.query(sql, function(err, results) {
        if(err) {
            console.log(err);
        }
        else {
            console.log(results);
            var result_arr = [];
            for(var j=0; j<results.length; j++) {
                var temp_obj = {};
                if(login_user == results[j].user1){ //check 로그인한 유저 무조건 1번으로 만들기
                    temp_obj.name1 = results[j].name1;
                    temp_obj.id1 = results[j].user1;
                    temp_obj.name2 = results[j].name2;
                    temp_obj.id2 = results[j].user2;
                }else{
                    temp_obj.name1 = results[j].name2;
                    temp_obj.id1 = results[j].user2;
                    temp_obj.name2 = results[j].name1;
                    temp_obj.id2 = results[j].user1;
                }
                temp_obj.roomport = results[j].roomport;
                temp_obj.msg = results[j].message;
                console.log("temp", j, temp_obj);
                result_arr.push(temp_obj);
            }
                console.log(result_arr);
        }
        console.log("result", result_arr);
        var json = JSON.stringify(result_arr);
        json = json.split('"[').join('[');
        json = json.split(']"').join(']');
        json = json.split('"{').join('{');
        json = json.split('}"').join('}');
        if(req.session){
            res.render('chat', {ChatData: json, userData: JSON.stringify(req.session.userData)});
        }else{
            res.render('chat', {ChatData: json, userData: ""});
        }
    });
});

router.post('/send', function (req, res) {
   console.log(req.body);
   var sql = "update chat set message = '" + req.body.json + "' where roomport = " + req.body.roomport + ";";
   conn.query(sql, function(err, results){
       if(err){
           console.log(err);
       }else{
           console.log(results);
           res.send(results);
       }
   })
});

router.post('/update', function (req, res) {
    console.log(req.body);
    var sql = "select message from chat where roomport = " + req.body.roomport + ";";
    conn.query(sql, function(err, results){
        if(err){
            console.log(err);
        }else{
            console.log(results[0].message);
            var send_obj = {};
            send_obj.roomport = req.body.roomport;
            send_obj.message = results[0].message;
            console.log(typeof(results[0].message));
            res.send(send_obj);
        }
    })
});

module.exports = router;
