var oneDayMs = 86400000;

exports.getTodayMs = function () {
    var d = new Date();
    return d.getTime();
};

exports.dateToMs = function (date) {
    var temp = date.split('-');
    var year = parseInt(temp[0]);
    var month = parseInt(temp[1]);
    var day = parseInt(temp[2]);
    var k = Date.parse(date);
    return k;
};

exports.msToDate = function (ms) {
    var date = new Date(ms);
    var dd = date.getDate();
    var mm = date.getMonth() + 1; //January is 0!

    var yyyy = date.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    var dateString = yyyy + "-" + mm + "-" + dd;
    return dateString;
};

exports.settingAnonymousUser = function (user, isHidden) {
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
};

exports.makeRandomString = function (len) {
    if (len <= 0)
        len = 4;
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < len; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

exports.oneDayMs = oneDayMs;

exports.getTodayMsWithoutTime = function () {
    var date = new Date();
    var dd = date.getDate();
    var mm = date.getMonth() + 1; //January is 0!

    var yyyy = date.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    var dateString = yyyy + "- " + mm + "- " + dd;
    return this.dateToMs(dateString);
};

exports.parseCategoryResult = function (results) {
    var category = {};

    try{
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            if(! category.hasOwnProperty(result.category_name)){
                category[result.category_name] = {
                    id: result.master_category_id,
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
    }catch(except) {
        console.log("Category parsing error!");
    }

    return category;
};