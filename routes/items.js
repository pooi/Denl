var express = require('express');
var router = express.Router();
var conn = require('../config/db')();

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
    conn.query(sql, [id], function (err, results, fields) {
        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        }
        if(results.length > 0){
            var result = results[0];
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
            rgtUser = settingAnonymousUser(rgtUser, true);
            rcvUser = settingAnonymousUser(rcvUser, true);

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

            var sql = 'SELECT * FROM category';
            conn.query(sql, [], function (err, results) {
                if (err) {
                    console.log(err);
                    res.status(500).send("Internal Server Error");
                }
                var category = {}
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
                console.log(photos);
                res.render('items', {userData: JSON.stringify(req.session.userData), data: json, category: JSON.stringify(category), tempImg: photos});
            });
        }else{
            res.render('items', {userData: JSON.stringify(req.session.userData)});
        }



    });
});

router.post('/request', function (req, res) {
    if(req.body){
        var lostID = req.body.lost_id;
        var sql = 'INSERT INTO request SET ?';
        conn.query(sql, req.body, function(err, results) {
            if (err) {
                console.log(err);
                res.status(500).send("Internal Server Error");
            } else {
                res.send(results);
            }
        });

    }else{
        console.log(err);
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
                    settingAnonymousUser(user, true);
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
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});


module.exports = router;
