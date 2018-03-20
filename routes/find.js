var express = require('express');
var router = express.Router();
var conn = require('../config/db')();

/* GET home page. */
router.get('/', function (req, res) {
    var sql = 'SELECT * FROM category';
    conn.query(sql, [], function (err, results) {
        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        }
        var category = {};
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
        if(req.session)
            res.render('find', {userData: JSON.stringify(req.session.userData), category: JSON.stringify(category)});
        else
            res.render('find', {userData: "", category: JSON.stringify(category)});
    });

});

module.exports = router;
