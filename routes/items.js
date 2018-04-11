var express = require('express');
var router = express.Router();
var conn = require('../config/db')();

function getTodayMs(){
    var d = new Date();
    return d.getTime();
}

function settingAnonymousUser(user, isHidden) {
    if(isHidden && user !== null){
        var userName = user.name;
        var newName = "";
        for(var i=0; i<userName.length; i++){
            if(i == 0 || i == userName.length-1){
                newName += userName.charAt(i);
            }else{
                newName += "*";
            }
        }
        user.name = newName;

        var userStudentID = user.studentID;
        var newStudentID = "";
        for(var i=0; i<userStudentID.length; i++){
            if(i > userStudentID.length - 5){
                newStudentID += userStudentID.charAt(i);
            }else{
                newStudentID += "*";
            }
        }
        user.studentID = newStudentID;
    }
    return user;
}

var msgSQL = "INSERT INTO msg(user_id, title, content, date) VALUES({0}, '{1}', '{2}', '{3}');";

/* GET home page. */
router.get('/', function (req, res) {



    res.render('items', {userData: JSON.stringify(req.session.userData)});
});

router.get('/:id', function (req, res) {
    var id = req.params.id;
    var sql =
        'SELECT A.*, B.studentID as rgtStudentID, B.name as rgtStudentName, C.studentID as rcvStudentID, C.name as rcvStudentName\n' +
        'FROM lost as A \n' +
        'LEFT OUTER JOIN ( \n' +
        'SELECT * FROM user \n' +
        'GROUP BY id) as B \n' +
        'ON (A.rgt_user = B.id) \n' +
        'LEFT OUTER JOIN ( \n' +
        'SELECT * FROM user \n' +
        'GROUP BY id) as C \n' +
        'ON (A.rcv_user = C.id) \n' +
        'WHERE A.id = ?;';

    sql += "SELECT * FROM category;";
    conn.query(sql, [id], function (err, results, fields) {
        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        }
        var lostResults = results[0];
        var categoryResults = results[1];
        if(lostResults.length > 0){
            var result = lostResults[0];
            var photos = result.photos;
            var rgtUser = {
                id: result.rgt_user,
                studentID: result.rgtStudentID,
                name: result.rgtStudentName
            };
            var rcvUser = {
                id: result.rcv_user,
                studentID: result.rcvStudentID,
                name: result.rcvStudentName
            };
            if(rcvUser.id === null)
                rcvUser = null;

            var isHidden = true;
            if(req.session.hasOwnProperty('userData')){
                if(req.session.userData.hasOwnProperty('isAdmin') && req.session.userData.isAdmin == 1)
                    isHidden = false;
            }
            rgtUser = settingAnonymousUser(rgtUser, isHidden);
            rcvUser = settingAnonymousUser(rcvUser, isHidden);

            delete result['rgt_user'];
            delete result['rgtStudentID'];
            delete result['rgtStudentName'];
            result['rgt_user'] = rgtUser;
            delete result['rcv_user'];
            delete result['rcvStudentID'];
            delete result['rcvStudentName'];
            result['rcv_user'] = rcvUser;


            var json = JSON.stringify(result);
            json = json.split('"[').join('[');
            json = json.split(']"').join(']');
            json = json.split('"{').join('{');
            json = json.split('}"').join('}');
            console.log(json);
            console.log(photos);

            var category = {}
            for (var i = 0; i < categoryResults.length; i++) {
                var result = categoryResults[i];
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
            console.log(photos);
            res.render('items', {userData: JSON.stringify(req.session.userData), data: json, category: JSON.stringify(category), tempImg: photos});

        }else{
            res.render('items', {userData: JSON.stringify(req.session.userData)});
        }



    });
});

router.post('/request', function (req, res) {
    if(req.body){
        var lostID = req.body.lost_id;
        var rgtUserMsg = msgSQL.format("(SELECT rgt_user FROM lost WHERE id='{0}')".format(lostID), '요청 발생 - ' + lostID, '등록하신 유실물에 수령 요청이 들어왔습니다.', getTodayMs());
        var requestUserMsg = msgSQL.format(req.body.user_id, '요청 등록 - ' + lostID, lostID + '번 유실물 수령을 성공적으로 요청하였습니다.', getTodayMs());
        var sql = 'INSERT INTO request SET ?';
        sql = rgtUserMsg + requestUserMsg + sql;
        conn.query(sql, req.body, function(err, results) {
            if (err) {
                console.log(err);
                res.status(500).send("Internal Server Error");
            } else {
                res.send(results[2]);
            }
        });

    }else{
        res.status(500).send("Internal Server Error");
    }
});

router.post('/removeRequest', function (req, res) {
    if(req.body){
        var lostId = req.body.lost_id;
        var requestID = req.body.request_id;
        var requestUserMsg = msgSQL.format("(SELECT user_id FROM request WHERE id={0})".format(requestID), '요청 취소 - ' + lostId, lostId + '번 유실물 수령 요청이 취소되었습니다.', getTodayMs());

        var sql = 'DELETE FROM request WHERE id=?;';
        sql = requestUserMsg + sql;
        conn.query(sql, requestID, function(err, results) {
            if (err) {
                console.log(err);
                res.status(500).send("Internal Server Error");
            } else {
                // console.log(results);
                res.send(results[1]);
            }
        });

    }else{
        res.status(500).send("Internal Server Error");
    }
});

router.post('/rgtEmail', function (req, res) {
    if(req.body){
        var requestID = req.body.request_id;
        var email = req.body.email;
        var sql = 'UPDATE request set email=? WHERE id=?'
        conn.query(sql, [email, requestID], function(err, results) {
            if (err) {
                console.log(err);
                res.status(500).send("Internal Server Error");
            } else {
                console.log(results);
                res.send(results);
            }
        });

    } else{
        res.status(500).send("Internal Server Error");
    }
});

router.post('/requestList', function (req, res) {
    if(req.body){
        var lostID = req.body.lost_id;
        var sql =
            'SELECT A.*, B.studentId, B.name \n' +
            'FROM request as A \n' +
            'LEFT OUTER JOIN ( \n' +
            'SELECT * FROM user \n' +
            'GROUP BY id) as B on(B.id = A.user_id) \n' +
            'WHERE A.lost_id=? \n' +
            'GROUP BY A.id;';
        conn.query(sql, lostID, function(err, results) {
            if (err) {
                console.log(err);
                res.status(500).send("Internal Server Error");
            } else {

                var userList = [];
                for(var i=0; i<results.length; i++){
                    var result = results[i];
                    var user = {
                        id: result.user_id,
                        studentID: result.studentId,
                        name: result.name
                    };
                    var isHidden = true;
                    if(req.session.hasOwnProperty('userData')){
                        if(req.session.userData.hasOwnProperty('isAdmin') && req.session.userData.isAdmin == 1)
                            isHidden = false;
                    }
                    settingAnonymousUser(user, isHidden);
                    delete result['user_id'];
                    delete result['studentID'];
                    delete result['name'];
                    result['user'] = user;
                    userList.push(result);
                }
                res.send(userList);
                // res.send(results);
            }
        });

    }else{
        res.status(500).send("Internal Server Error");
    }
});

router.post('/requestReceive', function (req, res) {
    if(req.body){
        var lostID = req.body.lost_id;
        var userID = req.body.user_id;
        var sql = 'UPDATE lost SET status="WFR", rcv_user=? WHERE id=?;';
        conn.query(sql, [userID, lostID], function(err, results) {
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

router.post('/cancelRequestReceive', function (req, res) {
    if(req.body){
        var lostID = req.body.lost_id;
        var sql = 'UPDATE lost SET status="WFA", rcv_user=null WHERE id=?;';
        conn.query(sql, [lostID], function(err, results) {
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

router.post('/confirmReceive', function (req, res) {
    if(req.body){
        var lostID = req.body.lost_id;
        var date = req.body.rcv_date;
        var sql = 'UPDATE lost SET status="COM", rcv_date=? WHERE id=?;';
        conn.query(sql, [date, lostID], function(err, results) {
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


module.exports = router;
