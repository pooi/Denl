var express = require('express');
var router = express.Router();
var conn = require('../config/db')();

/* GET home page. */
router.get('/', function (req, res) {



    res.render('items', {userData: JSON.stringify(req.session.userData)});
});

router.get('/:id', function (req, res) {
    var id = req.params.id;
    var sql = 'SELECT * FROM lost WHERE id=?';
    conn.query(sql, [id], function (err, results, fields) {
        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        }
        if(results.length > 0){
            var json = JSON.stringify(results[0]);
            json = json.split('"[').join('[');
            json = json.split(']"').join(']');
            json = json.split('"{').join('{');
            json = json.split('}"').join('}');
            console.log(json);

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
                // console.log(category);
                res.render('items', {userData: JSON.stringify(req.session.userData), data: json, category: JSON.stringify(category)});
            });
        }else{
            res.render('items', {userData: JSON.stringify(req.session.userData)});
        }



    });
});

module.exports = router;
