var express = require('express');
var fs = require('fs');
var exec = require('child_process').exec;
//var KakaoAK = require('../config/kakao.js').KakaoAK();
var multer = require('multer');
var _storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads_temp/')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + makeRandomString(10) + getExt(file));
        // console.log(file);
    }
});
var upload = multer({
    storage: _storage
});
var conn = require('../config/db')();
var router = express.Router();

var vision = require('google-vision-api-client');
var requtil = vision.requtil;

//Prepare your service account from trust preview certificated project
var jsonfile = __dirname + '/../config/NodePractice-2f88e00ddb65.json';

//Initialize the api
vision.init(jsonfile);

function getExt(file) {
    var ext = ".jpg";
    var mimetype = file.mimetype.toString();
    if (mimetype.search("png") > 0) {
        ext = ".png";
    } else if (mimetype.search("jpg") > 0 || mimetype.search("jpeg") > 0) {
        ext = ".jpg";
    } else if (mimetype.search("gif") > 0) {
        ext = ".jpg";
    }
    return ext;
}

function makeRandomString(len) {
    if (len <= 0)
        len = 4;
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < len; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

/* GET lost listing. */
router.get('/', function(req, res) {
    res.render('lost', { userData: JSON.stringify(req.session.userData) });
});
router.post('/', upload.single('file'), function(req, res) {
    // console.log(req.file); // 콘솔(터미널)을 통해서 req.file Object 내용 확인 가능.
    //Build the request payloads

    var data = req.body;

    var justData = false;
    if("data_only" in data){
        justData = true;
    }
    // if(data){
    //     justData = true;
    // }


    var d = requtil.createRequests().addRequest(
        requtil.createRequest(__dirname + '/../uploads_temp/' + req.file.filename)
        .withFeature('LABEL_DETECTION', 4)
        .withFeature('TEXT_DETECTION', 4)
        .withFeature('LOGO_DETECTION', 20)
        .withFeature('IMAGE_PROPERTIES', 4)
        .build());


    //Do query to the api server
    vision.query(d, function(e, r, d) {

        if (e) console.log('ERROR:', e);
        // console.log(JSON.stringify(d));

        var json = JSON.stringify(d);
        var obj = JSON.parse(json);
        var obj_response = obj.responses[0];
        var labelAnnotations = obj_response.labelAnnotations;
        var textAnnotations = obj_response.textAnnotations;
        var logoAnnotations = obj_response.logoAnnotations;
        var dominantColors = obj_response.imagePropertiesAnnotation.dominantColors.colors;

        var labels = [];
        var texts = [];
        var logos = [];
        var colors = [];

        if (labelAnnotations != null) {
            for (var i = 0; i < labelAnnotations.length; i++) {
                labels[i] = labelAnnotations[i].description;
            }
        }

        if (textAnnotations != null) {
            var index = 0;
            for (var i = 1; i < textAnnotations.length; i++) {
                var t = textAnnotations[i].description;
                if (t === "." || t === "!" || t === "," || t === "?" || t === " " || t === "/" || t === ":" || t === "-" || t === "·" || t === '"' || t === "'")
                    continue
                texts[index] = textAnnotations[i].description;
                index++;
            }
        }

        if (logoAnnotations != null) {
            for (var i = 0; i < logoAnnotations.length; i++) {
                logos[i] = logoAnnotations[i].description;
            }
        }

        if (dominantColors != null) {
            for (var i = 0; i < dominantColors.length; i++) {
                colors[i] = dominantColors[i].color;
            }
        }

        var KAKAO_COMMAND = 'curl -v -X POST "{0}" -F "file=@{1}" -H "Authorization: {2}"';
        var kakaoCommand = KAKAO_COMMAND.format("https://kapi.kakao.com/v1/vision/multitag/generate", __dirname + '/../uploads_temp/' + req.file.filename, KakaoAK);

        exec(kakaoCommand, function(err, stdout, stderr) {

            var data = JSON.parse(stdout);
            var result = data.result;
            if(result != null){
                if(result.label != null){
                    for(var i=0; i<result.label.length; i++){
                        labels.push(result.label[i]);
                    }
                }
                if(result.label_kr != null){
                    for(var i=0; i<result.label_kr.length; i++){
                        labels.push(result.label_kr[i]);
                    }
                }
            }

            var sql = 'SELECT * FROM category; SELECT * FROM building;';
            conn.query(sql, [], function (err, results) {
                if (err) {
                    console.log(err);
                    res.status(500).send("Internal Server Error");
                }
                var db_buildings = results[1];
                var front_buildings = {};
                for(db_building in db_buildings){
                    var real_lat = db_buildings[db_building].lat;
                    var temp_lat = real_lat.substring(1,real_lat.length-1);
                    var real_lng = db_buildings[db_building].lng;
                    var temp_lng = real_lng.substring(1,real_lng.length-1);
                    var arr_lat = temp_lat.split(",");
                    var arr_lng = temp_lng.split(",");
                    // console.log("lat",arr_lat);
                    // console.log("lng",arr_lng);
                    var up_arr = [];
                    for(var m = 0; m < arr_lat.length; m++){
                        var temp_arr = [];
                        temp_arr.push(arr_lng[m]);
                        temp_arr.push(arr_lat[m]);
                        var temp_obj = { "point" : temp_arr };
                        up_arr.push(temp_obj);
                    }
                    front_buildings[db_buildings[db_building].ko] = up_arr;
                }
                // console.log(front_buildings);
                var category = {}
                for (var i = 0; i < results[0].length; i++) {
                    var result = results[0][i];
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

                if(justData){
                    res.send({
                        image: req.file.filename,
                        labels: labels,
                        texts: texts,
                        logos: logos,
                        colors: colors,
                        category: category,
                        buildings : front_buildings
                    });
                }else{
                    res.render('lost', {
                        userData: JSON.stringify(req.session.userData),
                        image: req.file.filename,
                        labels: labels,
                        texts: texts,
                        logos: logos,
                        colors: JSON.stringify(colors),
                        category: JSON.stringify(category),
                        sju_buildings : JSON.stringify(front_buildings)
                    });
                }
            });

        });



    });

});
router.post('/submit', function(req, res) {

    if (req.body) {
        var imgPath = req.body.photos;
        var oldPath = __dirname + "/../uploads_temp" + imgPath;
        var newPath = __dirname + "/../uploads" + imgPath;
        fs.rename(oldPath, newPath, function(err) {
            if (err) {
                if (!fs.existsSync(newPath)) {
                    req.body.photos = "/images/logo/logo_color.svg";
                }
            }
            // console.log(req.body);
            var sql = 'INSERT INTO lost SET ?';
            conn.query(sql, req.body, function(err, results) {
                if (err) {
                    console.log(err);
                    res.status(500).send("Internal Server Error");
                } else {
                    res.send(results);
                }
            });

        });
    } else {
        // console.log(err);
        res.status(500).send("Internal Server Error");
    }


});

router.post('/submitDetail', function(req, res) {

    if (req.body) {
        var lostID = req.body.lost_id;
        var brand = req.body.brand;
        var tags = req.body.tags;
        var description = req.body.description;

        var sql = 'UPDATE lost set brand=?, tags=?, description=? WHERE id=?';
        conn.query(sql, [brand, tags, description, lostID], function(err, results) {
            if (err) {
                console.log(err);
                res.status(500).send("Internal Server Error");
            } else {
                res.send(results);
            }
        });
    } else {
        res.status(500).send("Internal Server Error");
    }


});

router.post('/recognition', function(req, res) {

    var imagePath = req.body.image;
    if (!imagePath.startsWith('/')) {
        imagePath = '/' + imagePath;
    }

    var path_labelImage = 'python3 "' + __dirname + '/../recognition/label_image_hierarchical3.py"';
    var path_labels = '"' + __dirname + '/../recognition/retrained_labels.txt"';
    var path_graph = '"' + __dirname + '/../recognition/retrained_graph.pb"';
    var path_image = '"' + __dirname + '/../uploads_temp' + imagePath + '"';
    var path_detail_dir = '"' + __dirname + '/../recognition/hierarchical_detail"';

    var COMMAND = "{0} --input_layer=Mul --output_layer=final_result --labels={1} --graph={2} --image={3} --detailDir={4} ";
    var command = COMMAND.format(path_labelImage, path_labels, path_graph, path_image, path_detail_dir);

    exec(command, function(err, stdout, stderr) {

        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        } else {

            var result = [];

            try {
                var list = stdout.split('\n');
                for (var i = 0; i < list.length; i++) {
                    var re = list[i];
                    if (re.length <= 0) {
                        continue;
                    }
                    // console.log(re);
                    var tempList = re.split(' ');
                    if (tempList.length < 2) {
                        continue;
                    }
                    var data = {};
                    data.title = "";
                    for (var j = 0; j < tempList.length - 1; j++) {
                        data.title += tempList[j];
                        if (j < tempList.length - 2) {
                            data.title += " ";
                        }
                    }
                    data.accuracy = parseFloat(tempList[tempList.length - 1] * 100.0).toFixed(5);
                    result.push(data);
                }
            } catch (err) {
                console.log(err);
                res.status(500).send("Internal Server Error");
            }

            res.send(result);

        }

    });
});

router.get('/test', function(req, res) {
    var filename = testImage;
    var json = testJson;

    var obj = JSON.parse(json);
    var obj_response = obj.responses[0];
    var labelAnnotations = obj_response.labelAnnotations;
    var textAnnotations = obj_response.textAnnotations;
    var logoAnnotations = obj_response.logoAnnotations;
    var dominantColors = obj_response.imagePropertiesAnnotation.dominantColors.colors;

    var labels = [];
    var texts = [];
    var logos = [];
    var colors = [];

    if (labelAnnotations != null) {
        for (var i = 0; i < labelAnnotations.length; i++) {
            labels[i] = labelAnnotations[i].description;
        }
    }

    if (textAnnotations != null) {
        var index = 0;
        for (var i = 1; i < textAnnotations.length; i++) {
            var t = textAnnotations[i].description;
            if (t === "." || t === "!" || t === "," || t === "?" || t === " " || t === "/" || t === ":" || t === "-" || t === "·" || t === '"' || t === "'")
                continue
            texts[index] = textAnnotations[i].description;
            index++;
        }
    }

    if (logoAnnotations != null) {
        for (var i = 0; i < logoAnnotations.length; i++) {
            logos[i] = logoAnnotations[i].description;
        }
    }

    if (dominantColors != null) {
        for (var i = 0; i < dominantColors.length; i++) {
            colors[i] = dominantColors[i].color;
        }
    }

    var sql = 'SELECT * FROM category';
    conn.query(sql, [], function(err, results) {
        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        }
        var category = {}
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            if (!category.hasOwnProperty(result.category_name)) {
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
        res.render('lost_test', {
            userData: JSON.stringify(req.session.userData),
            image: filename,
            labels: labels,
            texts: texts,
            logos: logos,
            colors: JSON.stringify(colors),
            category: JSON.stringify(category)
        });
    });



});

router.get('/test2', function (req, res){
    var filename = testImage;
    var json = testJson;

    var obj = JSON.parse(json);
    var obj_response = obj.responses[0];
    var labelAnnotations = obj_response.labelAnnotations;
    var textAnnotations = obj_response.textAnnotations;
    var logoAnnotations = obj_response.logoAnnotations;
    var dominantColors = obj_response.imagePropertiesAnnotation.dominantColors.colors;

    var labels = [];
    var texts = [];
    var logos = [];
    var colors = [];

    if(labelAnnotations != null){
        for(var i=0; i<labelAnnotations.length; i++){
            labels[i] = labelAnnotations[i].description;
        }
    }

    if(textAnnotations != null){
        var index = 0;
        for(var i=1; i<textAnnotations.length; i++){
            var t = textAnnotations[i].description;
            if(t === "." || t === "!" || t === "," || t === "?" || t === " " || t === "/" || t === ":" || t === "-" || t === "·" || t === '"' || t === "'")
                continue
            texts[index] = textAnnotations[i].description;
            index ++;
        }
    }

    if(logoAnnotations != null){
        for(var i=0; i<logoAnnotations.length; i++){
            logos[i] = logoAnnotations[i].description;
        }
    }

    if(dominantColors != null){
        for(var i=0; i<dominantColors.length; i++){
            colors[i] = dominantColors[i].color;
        }
    }

    var sql = 'SELECT * FROM category; SELECT * FROM building;';
    conn.query(sql, [], function (err, results) {
        if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        }
        var db_buildings = results[1];
        var front_buildings = {};
        for(db_building in db_buildings){
            var real_lat = db_buildings[db_building].lat;
            var temp_lat = real_lat.substring(1,real_lat.length-1);
            var real_lng = db_buildings[db_building].lng;
            var temp_lng = real_lng.substring(1,real_lng.length-1);
            var arr_lat = temp_lat.split(",");
            var arr_lng = temp_lng.split(",");
            // console.log("lat",arr_lat);
            // console.log("lng",arr_lng);
            var up_arr = [];
            for(var m = 0; m < arr_lat.length; m++){
                var temp_arr = [];
                temp_arr.push(arr_lng[m]);
                temp_arr.push(arr_lat[m]);
                var temp_obj = { "point" : temp_arr };
                up_arr.push(temp_obj);
            }
            front_buildings[db_buildings[db_building].ko] = up_arr;
        }
        // console.log(front_buildings);
        var category = {}
        for (var i = 0; i < results[0].length; i++) {
            var result = results[0][i];
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
        res.render('lost_test2', {
            userData: JSON.stringify(req.session.userData),
            image: filename,
            labels: labels,
            texts: texts,
            logos: logos,
            colors: JSON.stringify(colors),
            category: JSON.stringify(category),
            sju_buildings : JSON.stringify(front_buildings)
        });
    });



});

module.exports = router;


var testImage = "/1521854755512nltBPwQlhu.jpg"; //"/1520310924595TSBdo17Y8S.jpg"; //"/1517110780949famous_logos.jpg"
var testJson = "{\"responses\":[{\"logoAnnotations\":[{\"description\":\"Coca Cola\",\"score\":0.43660352,\"boundingPoly\":{\"vertices\":[{\"x\":631,\"y\":68},{\"x\":781,\"y\":68},{\"x\":781,\"y\":109},{\"x\":631,\"y\":109}]}},{\"mid\":\"/m/02_kt\",\"description\":\"Ferrari S.p.A.\",\"score\":0.427072,\"boundingPoly\":{\"vertices\":[{\"x\":264,\"y\":223},{\"x\":364,\"y\":223},{\"x\":364,\"y\":244},{\"x\":264,\"y\":244}]}},{\"mid\":\"/g/11b6g68w89\",\"description\":\"Lacoste\",\"score\":0.4119006,\"boundingPoly\":{\"vertices\":[{\"x\":607,\"y\":222},{\"x\":724,\"y\":222},{\"x\":724,\"y\":259},{\"x\":607,\"y\":259}]}},{\"description\":\"Adidas\",\"score\":0.40819806,\"boundingPoly\":{\"vertices\":[{\"x\":59,\"y\":51},{\"x\":144,\"y\":51},{\"x\":144,\"y\":140},{\"x\":59,\"y\":140}]}},{\"mid\":\"/m/017yh\",\"description\":\"BMW\",\"score\":0.40214726,\"boundingPoly\":{\"vertices\":[{\"x\":480,\"y\":44},{\"x\":574,\"y\":44},{\"x\":574,\"y\":123},{\"x\":480,\"y\":123}]}},{\"description\":\"Al Jazeera\",\"score\":0.3871117,\"boundingPoly\":{\"vertices\":[{\"x\":55,\"y\":215},{\"x\":170,\"y\":215},{\"x\":170,\"y\":264},{\"x\":55,\"y\":264}]}}],\"labelAnnotations\":[{\"mid\":\"/m/01g6gs\",\"description\":\"black and white\",\"score\":0.9011285,\"topicality\":0.9011285},{\"mid\":\"/m/07s6nbt\",\"description\":\"text\",\"score\":0.88597035,\"topicality\":0.88597035},{\"mid\":\"/m/0dwx7\",\"description\":\"logo\",\"score\":0.8384279,\"topicality\":0.8384279},{\"mid\":\"/m/03gq5hm\",\"description\":\"font\",\"score\":0.8347028,\"topicality\":0.8347028}],\"textAnnotations\":[{\"locale\":\"es\",\"description\":\"adidas\\nFerrari\\nLACOSTE\\nMobil INE\\n\",\"boundingPoly\":{\"vertices\":[{\"x\":40,\"y\":125},{\"x\":719,\"y\":125},{\"x\":719,\"y\":423},{\"x\":40,\"y\":423}]}},{\"description\":\"adidas\",\"boundingPoly\":{\"vertices\":[{\"x\":60,\"y\":125},{\"x\":110,\"y\":125},{\"x\":110,\"y\":142},{\"x\":60,\"y\":142}]}},{\"description\":\"Ferrari\",\"boundingPoly\":{\"vertices\":[{\"x\":247,\"y\":224},{\"x\":361,\"y\":223},{\"x\":361,\"y\":248},{\"x\":247,\"y\":249}]}},{\"description\":\"LACOSTE\",\"boundingPoly\":{\"vertices\":[{\"x\":602,\"y\":240},{\"x\":719,\"y\":239},{\"x\":719,\"y\":259},{\"x\":602,\"y\":260}]}},{\"description\":\"Mobil\",\"boundingPoly\":{\"vertices\":[{\"x\":40,\"y\":363},{\"x\":182,\"y\":357},{\"x\":184,\"y\":417},{\"x\":43,\"y\":423}]}},{\"description\":\"INE\",\"boundingPoly\":{\"vertices\":[{\"x\":225,\"y\":355},{\"x\":325,\"y\":351},{\"x\":328,\"y\":411},{\"x\":228,\"y\":415}]}}],\"imagePropertiesAnnotation\":{\"dominantColors\":{\"colors\":[{\"color\":{\"red\":5,\"green\":5,\"blue\":5},\"score\":0.46762636,\"pixelFraction\":0.0654578},{\"color\":{\"red\":252,\"green\":252,\"blue\":252},\"score\":0.124734744,\"pixelFraction\":0.79045373},{\"color\":{\"red\":19,\"green\":89,\"blue\":57},\"score\":0.010817848,\"pixelFraction\":0.0006505123},{\"color\":{\"red\":48,\"green\":45,\"blue\":46},\"score\":0.12739071,\"pixelFraction\":0.03748577},{\"color\":{\"red\":82,\"green\":82,\"blue\":82},\"score\":0.11424323,\"pixelFraction\":0.025126036},{\"color\":{\"red\":121,\"green\":121,\"blue\":121},\"score\":0.06315316,\"pixelFraction\":0.02740283},{\"color\":{\"red\":150,\"green\":150,\"blue\":150},\"score\":0.050245434,\"pixelFraction\":0.026996259},{\"color\":{\"red\":131,\"green\":94,\"blue\":89},\"score\":0.00036139603,\"pixelFraction\":0.000081314036},{\"color\":{\"red\":197,\"green\":197,\"blue\":197},\"score\":0.021205474,\"pixelFraction\":0.023662385},{\"color\":{\"red\":77,\"green\":124,\"blue\":101},\"score\":0.009585014,\"pixelFraction\":0.00089445437}]}},\"cropHintsAnnotation\":{\"cropHints\":[{\"boundingPoly\":{\"vertices\":[{},{\"x\":799},{\"x\":799,\"y\":479},{\"y\":479}]},\"confidence\":0.79999995,\"importanceFraction\":1}]},\"fullTextAnnotation\":{\"pages\":[{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}]},\"width\":800,\"height\":480,\"blocks\":[{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"en\"}]},\"boundingBox\":{\"vertices\":[{\"x\":60,\"y\":125},{\"x\":110,\"y\":125},{\"x\":110,\"y\":142},{\"x\":60,\"y\":142}]},\"paragraphs\":[{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"en\"}]},\"boundingBox\":{\"vertices\":[{\"x\":60,\"y\":125},{\"x\":110,\"y\":125},{\"x\":110,\"y\":142},{\"x\":60,\"y\":142}]},\"words\":[{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"en\"}]},\"boundingBox\":{\"vertices\":[{\"x\":60,\"y\":125},{\"x\":110,\"y\":125},{\"x\":110,\"y\":142},{\"x\":60,\"y\":142}]},\"symbols\":[{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}]},\"boundingBox\":{\"vertices\":[{\"x\":60,\"y\":125},{\"x\":67,\"y\":125},{\"x\":67,\"y\":142},{\"x\":60,\"y\":142}]},\"text\":\"a\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}]},\"boundingBox\":{\"vertices\":[{\"x\":68,\"y\":125},{\"x\":77,\"y\":125},{\"x\":77,\"y\":142},{\"x\":68,\"y\":142}]},\"text\":\"d\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}]},\"boundingBox\":{\"vertices\":[{\"x\":78,\"y\":125},{\"x\":82,\"y\":125},{\"x\":82,\"y\":142},{\"x\":78,\"y\":142}]},\"text\":\"i\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}]},\"boundingBox\":{\"vertices\":[{\"x\":83,\"y\":125},{\"x\":92,\"y\":125},{\"x\":92,\"y\":142},{\"x\":83,\"y\":142}]},\"text\":\"d\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}]},\"boundingBox\":{\"vertices\":[{\"x\":93,\"y\":125},{\"x\":101,\"y\":125},{\"x\":101,\"y\":142},{\"x\":93,\"y\":142}]},\"text\":\"a\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}],\"detectedBreak\":{\"type\":\"EOL_SURE_SPACE\"}},\"boundingBox\":{\"vertices\":[{\"x\":102,\"y\":125},{\"x\":110,\"y\":125},{\"x\":110,\"y\":142},{\"x\":102,\"y\":142}]},\"text\":\"s\"}]}]}],\"blockType\":\"TEXT\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"en\"}]},\"boundingBox\":{\"vertices\":[{\"x\":247,\"y\":223},{\"x\":361,\"y\":223},{\"x\":361,\"y\":249},{\"x\":247,\"y\":249}]},\"paragraphs\":[{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"en\"}]},\"boundingBox\":{\"vertices\":[{\"x\":247,\"y\":223},{\"x\":361,\"y\":223},{\"x\":361,\"y\":249},{\"x\":247,\"y\":249}]},\"words\":[{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"en\"}]},\"boundingBox\":{\"vertices\":[{\"x\":247,\"y\":224},{\"x\":361,\"y\":223},{\"x\":361,\"y\":248},{\"x\":247,\"y\":249}]},\"symbols\":[{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}]},\"boundingBox\":{\"vertices\":[{\"x\":247,\"y\":224},{\"x\":260,\"y\":224},{\"x\":260,\"y\":248},{\"x\":247,\"y\":248}]},\"text\":\"F\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}]},\"boundingBox\":{\"vertices\":[{\"x\":264,\"y\":230},{\"x\":279,\"y\":230},{\"x\":279,\"y\":248},{\"x\":264,\"y\":248}]},\"text\":\"e\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}]},\"boundingBox\":{\"vertices\":[{\"x\":282,\"y\":230},{\"x\":297,\"y\":230},{\"x\":297,\"y\":248},{\"x\":282,\"y\":248}]},\"text\":\"r\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}]},\"boundingBox\":{\"vertices\":[{\"x\":300,\"y\":231},{\"x\":315,\"y\":231},{\"x\":315,\"y\":248},{\"x\":300,\"y\":248}]},\"text\":\"r\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}]},\"boundingBox\":{\"vertices\":[{\"x\":317,\"y\":230},{\"x\":333,\"y\":230},{\"x\":333,\"y\":248},{\"x\":317,\"y\":248}]},\"text\":\"a\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}]},\"boundingBox\":{\"vertices\":[{\"x\":335,\"y\":231},{\"x\":350,\"y\":231},{\"x\":350,\"y\":248},{\"x\":335,\"y\":248}]},\"text\":\"r\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}],\"detectedBreak\":{\"type\":\"EOL_SURE_SPACE\"}},\"boundingBox\":{\"vertices\":[{\"x\":353,\"y\":224},{\"x\":361,\"y\":224},{\"x\":361,\"y\":249},{\"x\":353,\"y\":249}]},\"text\":\"i\"}]}]}],\"blockType\":\"TEXT\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"fr\"}]},\"boundingBox\":{\"vertices\":[{\"x\":602,\"y\":239},{\"x\":719,\"y\":239},{\"x\":719,\"y\":260},{\"x\":602,\"y\":260}]},\"paragraphs\":[{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"fr\"}]},\"boundingBox\":{\"vertices\":[{\"x\":602,\"y\":239},{\"x\":719,\"y\":239},{\"x\":719,\"y\":260},{\"x\":602,\"y\":260}]},\"words\":[{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"fr\"}]},\"boundingBox\":{\"vertices\":[{\"x\":602,\"y\":240},{\"x\":719,\"y\":239},{\"x\":719,\"y\":259},{\"x\":602,\"y\":260}]},\"symbols\":[{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}]},\"boundingBox\":{\"vertices\":[{\"x\":602,\"y\":240},{\"x\":613,\"y\":240},{\"x\":613,\"y\":259},{\"x\":602,\"y\":259}]},\"text\":\"L\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}]},\"boundingBox\":{\"vertices\":[{\"x\":615,\"y\":240},{\"x\":633,\"y\":240},{\"x\":633,\"y\":259},{\"x\":615,\"y\":259}]},\"text\":\"A\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}]},\"boundingBox\":{\"vertices\":[{\"x\":634,\"y\":240},{\"x\":650,\"y\":240},{\"x\":650,\"y\":259},{\"x\":634,\"y\":259}]},\"text\":\"C\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}]},\"boundingBox\":{\"vertices\":[{\"x\":651,\"y\":240},{\"x\":669,\"y\":240},{\"x\":669,\"y\":258},{\"x\":651,\"y\":258}]},\"text\":\"O\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}]},\"boundingBox\":{\"vertices\":[{\"x\":671,\"y\":240},{\"x\":686,\"y\":240},{\"x\":686,\"y\":259},{\"x\":671,\"y\":259}]},\"text\":\"S\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}]},\"boundingBox\":{\"vertices\":[{\"x\":687,\"y\":240},{\"x\":703,\"y\":240},{\"x\":703,\"y\":259},{\"x\":687,\"y\":259}]},\"text\":\"T\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}],\"detectedBreak\":{\"type\":\"EOL_SURE_SPACE\"}},\"boundingBox\":{\"vertices\":[{\"x\":705,\"y\":240},{\"x\":719,\"y\":240},{\"x\":719,\"y\":259},{\"x\":705,\"y\":259}]},\"text\":\"E\"}]}]}],\"blockType\":\"TEXT\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"gl\"}]},\"boundingBox\":{\"vertices\":[{\"x\":40,\"y\":351},{\"x\":328,\"y\":351},{\"x\":328,\"y\":423},{\"x\":40,\"y\":423}]},\"paragraphs\":[{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"gl\"}]},\"boundingBox\":{\"vertices\":[{\"x\":40,\"y\":351},{\"x\":328,\"y\":351},{\"x\":328,\"y\":423},{\"x\":40,\"y\":423}]},\"words\":[{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"en\"}]},\"boundingBox\":{\"vertices\":[{\"x\":40,\"y\":363},{\"x\":182,\"y\":357},{\"x\":184,\"y\":417},{\"x\":43,\"y\":423}]},\"symbols\":[{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}]},\"boundingBox\":{\"vertices\":[{\"x\":40,\"y\":363},{\"x\":69,\"y\":362},{\"x\":72,\"y\":422},{\"x\":43,\"y\":423}]},\"text\":\"M\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}]},\"boundingBox\":{\"vertices\":[{\"x\":70,\"y\":361},{\"x\":111,\"y\":359},{\"x\":114,\"y\":419},{\"x\":73,\"y\":421}]},\"text\":\"o\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}]},\"boundingBox\":{\"vertices\":[{\"x\":112,\"y\":359},{\"x\":152,\"y\":357},{\"x\":155,\"y\":417},{\"x\":115,\"y\":419}]},\"text\":\"b\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}]},\"boundingBox\":{\"vertices\":[{\"x\":153,\"y\":358},{\"x\":172,\"y\":357},{\"x\":175,\"y\":417},{\"x\":156,\"y\":418}]},\"text\":\"i\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}],\"detectedBreak\":{\"type\":\"SPACE\"}},\"boundingBox\":{\"vertices\":[{\"x\":173,\"y\":357},{\"x\":182,\"y\":357},{\"x\":185,\"y\":417},{\"x\":176,\"y\":417}]},\"text\":\"l\"}]},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"gl\"}]},\"boundingBox\":{\"vertices\":[{\"x\":225,\"y\":355},{\"x\":325,\"y\":351},{\"x\":328,\"y\":411},{\"x\":228,\"y\":415}]},\"symbols\":[{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}]},\"boundingBox\":{\"vertices\":[{\"x\":225,\"y\":355},{\"x\":295,\"y\":352},{\"x\":298,\"y\":412},{\"x\":228,\"y\":415}]},\"text\":\"I\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}]},\"boundingBox\":{\"vertices\":[{\"x\":296,\"y\":351},{\"x\":305,\"y\":351},{\"x\":308,\"y\":411},{\"x\":299,\"y\":411}]},\"text\":\"N\"},{\"property\":{\"detectedLanguages\":[{\"languageCode\":\"es\"}],\"detectedBreak\":{\"type\":\"EOL_SURE_SPACE\"}},\"boundingBox\":{\"vertices\":[{\"x\":306,\"y\":351},{\"x\":325,\"y\":350},{\"x\":328,\"y\":410},{\"x\":309,\"y\":411}]},\"text\":\"E\"}]}]}],\"blockType\":\"TEXT\"}]}],\"text\":\"adidas\\nFerrari\\nLACOSTE\\nMobil INE\\n\"}}]}";