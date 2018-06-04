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
                //결과 객체에 프로퍼티가 있는 경우
                if(result_obj.hasOwnProperty(results[j].roomport)){
                    result_obj[results[j].roomport].msg.push({
                        message: results[j].message,
                        sender: results[j].sender,
                        sendtime: results[j].sendtime,
                        chread: results[j].chread
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
                                message: results[j].message,
                                sender: results[j].sender,
                                sendtime: results[j].sendtime,
                                chread: results[j].chread
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
            let count = 0;
            for(msg in result_obj[item].msg){
                if(result_obj[item].msg[msg].sender != login_user && result_obj[item].msg[msg].chread == 1){
                    count++;
                }else{
                    continue;
                }
            }
            result_obj[item].unreadcount = count;
            result_arr.push(result_obj[item]);
        }
        let json = JSON.stringify(result_arr);
        json = json.split('"[').join('[');
        json = json.split(']"').join(']');
        json = json.split('"{').join('{');
        json = json.split('}"').join('}');
        if(req.session){
                res.render('chat2', {ChatData: json, userData: JSON.stringify(req.session.userData)});
        }else{
                res.render('chat2', {ChatData: json, userData: ""});
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
    var login_user = req.session.userData.id;
    console.log(req.body);
    var sql = "update chat set chread = 0 where roomport = " + "'" + req.body.roomport + "'" + "AND receiver = " + "'" + login_user + "'" +"; "
        +"select message, sender, sendtime, chread from chat where roomport = " + "'" + req.body.roomport + "'" + ";"
    conn.query(sql, function(err, results){
        if(err){
            console.log(err);
        }else{
            let count = 0;
            for(item in results[1]){
                if(results[1][item].chread == 1){
                    count++;
                }else{
                    continue;
                }
            }
            let server_obj = {
                update_sign: results[0],
                roomport: req.body.roomport,
                msg: results[1],
                unreadcount: count
            }
            res.send(server_obj);
        }
    })
});

router.post('/make', function (req, res) {
    console.log(req.body);
    var sql = "select message from chat where roomport = " + req.body.makeroomport + ";";
    var sentence = "(" + req.body.user2 + ", " + req.body.user1 + ", " + req.body.makeroomport + ", " + Date.now() + ", "+ 1 + ");"
    conn.query(sql, function(err, results){
        if(err){
            console.log(err);
        }else{
            if(results.length > 0){
                var fail = "exist";
                res.send(fail);
            }else{
                var sql2 = "insert into chat (sender, receiver, roomport, sendtime, chread) values " + sentence;
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

router.post('/period', function (req, res) {
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
                //결과 객체에 프로퍼티가 있는 경우
                if(result_obj.hasOwnProperty(results[j].roomport)){
                    result_obj[results[j].roomport].msg.push({
                        message: results[j].message,
                        sender: results[j].sender,
                        sendtime: results[j].sendtime,
                        chread: results[j].chread
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
                                message: results[j].message,
                                sender: results[j].sender,
                                sendtime: results[j].sendtime,
                                chread: results[j].chread
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
            let count = 0;
            for(msg in result_obj[item].msg){
                if(result_obj[item].msg[msg].sender != login_user && result_obj[item].msg[msg].chread == 1){
                    count++;
                }else{
                    continue;
                }
            }
            result_obj[item].unreadcount = count;
            result_arr.push(result_obj[item]);
        }
        let json = JSON.stringify(result_arr);
        json = json.split('"[').join('[');
        json = json.split(']"').join(']');
        json = json.split('"{').join('{');
        json = json.split('}"').join('}');
        if(req.session){
            res.send(result_arr);
        }else{
            res.send("none");
        }
    });
});

module.exports = router;
