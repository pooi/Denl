var express = require('express');
var router = express.Router();
var conn = require('../config/db')();

/* GET home page. */
router.get('/', function (req, res) {
    var sql = "select * from chat where user1 = '13011176';" + "select * from chat where user2 = '13011176';"
    conn.query(sql, function(err, results) {
        if(err) {
            console.log(err);
        }
        else {
            var result_arr = [];
            for(var i=0; i<results.length; i++){
                var temp_result = results[i];
                console.log(temp_result.length);
                for(var j=0; j<temp_result.length; j++) {
                    var temp_obj = {};
                    temp_obj.std_id1 = temp_result[j].user1;
                    temp_obj.std_id2 = temp_result[j].user2;
                    temp_obj.roomport = temp_result[j].roomport;
                    temp_obj.msg = temp_result[j].message;
                    console.log("temp", j, temp_obj);
                    result_arr.push(temp_obj);
                }
            }
            console.log("result", result_arr);
            var json = JSON.stringify(result_arr);
            json = json.split('"[').join('[');
            json = json.split(']"').join(']');
            json = json.split('"{').join('{');
            json = json.split('}"').join('}');
            res.render('chat', {ChatData: json});
        }
    });
});

module.exports = router;
