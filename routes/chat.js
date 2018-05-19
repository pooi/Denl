var express = require('express');
var router = express.Router();
var conn = require('../config/db')();

/* GET home page. */
router.get('/', function (req, res) {
    console.log("check", req);
    var login_user = req.session.userData.id;
    var sql = "SELECT c.name as sendername, c.sender, d.name as receivername, c.receiver, c.roomport, c.message, c.sendtime, c.chread"
        +" FROM (SELECT a.name, b.sender, b.receiver, b.roomport, b.message, b.sendtime, b.chread"
        +" FROM dal.user a, dal.chat b"
        +" WHERE a.id = b.sender AND (b.sender = " + login_user + " OR b.receiver = " + login_user+ ")) c, dal.user d"
        +" WHERE d.id = c.receiver;"
    let result_obj = {};
    conn.query(sql, function(err, results) {
        if(err) {
            console.log(err);
        }
        else {
            for(var j=0; j<results.length; j++) {
                console.log(results[j]);
                //결과 객체에 프로퍼티가 있는 경우
                if(result_obj.hasOwnProperty(results[j].roomport)){
                    result_obj[results[j].roomport].msg.push({
                        sentence: results[j].message,
                        stamp: results[j].sender,
                        time: results[j].sendtime,
                        read: results[j].chread
                    });
                }
                // 없는 경우 처음생성!!
                else{
                    let id1 = null;
                    let id2 = null;
                    let name1 = null;
                    let name2 = null;
                    if(results[j].sender == login_user){
                        id1 = results[j].sender;
                        id2 = results[j].receiver;
                        name1 = results[j].sendername;
                        name2 = results[j].receivername;
                    }
                    else{
                        id1 = results[j].receiver;
                        id2 = results[j].sender;
                        name1 = results[j].receivername;
                        name2 = results[j].sendername;
                    }
                    result_obj[results[j].roomport] = {
                        id1: id1,
                        id2: id2,
                        msg: [
                            {
                                sentence: results[j].message,
                                stamp: results[j].sender,
                                time: results[j].sendtime,
                                read: results[j].chread
                            }
                        ],
                        name1: name1,
                        name2: name2,
                        roomport: results[j].roomport
                    }
                }
            }
        }
        let result_arr = [];
        for(item in result_obj){
            result_arr.push(result_obj[item]);
        }
        let json = JSON.stringify(result_arr);
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
   console.log("get", req.body);
   var sql = "insert into chat (sender, receiver, roomport, message, sendtime, chread) VALUES "
       + "(" + req.body.sender + ", " + req.body.receiver + ", '" + req.body.roomport + "', "
       + "'" + req.body.message + "', " + req.body.sendtime + ", " + req.body.chread + ");";
   conn.query(sql,function (err, result) {
       if(err){
           console.log(err);
           res.send("fail");
       }
       else{
           console.log(result);

           res.send("success");
       }
   })
});

router.post('/update', function (req, res) {
    console.log(req.body);
    var sql = "select message from chat where roomport = " + "'" + req.body.roomport + "'" + ";";
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

router.post('/make', function (req, res) {
    console.log(req.body);
    var sql = "select message from chat where roomport = " + req.body.makeroomport + ";";
    var sentence = "(" + req.body.user1 + ", " + req.body.user2 + ", " + req.body.makeroomport + ");"
    conn.query(sql, function(err, results){
        if(err){
            console.log(err);
        }else{
            if(results.length > 0){
                var fail = "exist";
                res.send(fail);
            }else{
                var sql2 = "insert into chat (user1, user2, roomport) values " + sentence;
                conn.query(sql2, function(err, results){
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log(results);
                        var success = "makenewroom"
                        res.send(success);
                    }
                })
            }
        }
    })
});

router.post('/out', function (req, res) {
    console.log(req.body);
    var login_user = req.session.userData.id;
    var sql = "SELECT c.name as name1, c.user1, d.name as name2, c.user2, c.roomport, c.message"
        +" FROM (SELECT a.name, b.user1, b.user2, b.roomport, b.message"
        +" FROM user a, chat b"
        +" WHERE a.id = b.user1 AND (b.user1 = "+ login_user + " OR b.user2 = "+ login_user + ")) c, user d"
        +" WHERE d.id = c.user2;"
    conn.query(sql, function(err, results){
        if(err){
            console.log(err);
        }else{
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
                result_arr.push(temp_obj);
            }
        }
        var json = JSON.stringify(result_arr);
        json = json.split('"[').join('[');
        json = json.split(']"').join(']');
        json = json.split('"{').join('{');
        json = json.split('}"').join('}');
        if(req.session){
            res.send(result_arr);
        }else{
            res.send("none");
        }
    })
});

module.exports = router;
