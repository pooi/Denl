var express = require('express');
var router = express.Router();
var conn = require('../config/db')();
var support = require('./support-func');

/* GET home page. */
router.get('/', function (req, res) {

    console.log(support.getTodayMs());

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
            res.render('find', {userData: JSON.stringify(req.session.userData), category: JSON.stringify(category)});
        else
            res.render('find', {userData: "", category: JSON.stringify(category)});
    });

});

module.exports = router;
