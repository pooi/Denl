var express = require('express');
var router = express.Router();
var conn = require('../config/db')();

/* GET home page. */
router.get('/', function(req, res, next) {

    if(req.session)
        res.render('index', {userData: JSON.stringify(req.session.userData)});
    else
        res.render('index', {userData: ""});

});

router.post('/search', function (req, res) {

    var sql = "SELECT * FROM lost ORDER BY id DESC;";
    conn.query(sql, req.body, function(err, results) {
        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        } else {

            var newResults = [];
            for(var i=0; i<results.length; i++){
                var result = results[i];
                var json = JSON.stringify(result);
                console.log("json1: ", json);
                json = json.split('"[').join('[');
                json = json.split(']"').join(']');
                json = json.split('"{').join('{');
                json = json.split('}"').join('}');

                json = json.split('\\"').join('\"');
                console.log("json2: ", json);
                newResults.push(JSON.parse(json));
            }

            console.log("newResults: ", newResults);
            // var json = JSON.stringify(newResults);
            // console.log(json);
            res.send(newResults);
        }
    });

});

module.exports = router;
