var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    if(req.session)
        res.render('index', {userData: JSON.stringify(req.session.userData)});
    else
        res.render('index', {userData: ""});
});

module.exports = router;
