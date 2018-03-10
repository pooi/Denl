
function getTodayMs(){
    var d = new Date();
    return d.getTime();
}

function dateToMs(date){
    var temp = date.split('-');
    var year = parseInt(temp[0]);
    var month = parseInt(temp[1]);
    var day = parseInt(temp[2]);
    var k = Date.parse(date);
    return k;
}

function msToDate(ms) {
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
    return dateString
}

function listToString(arr) {
    var result = "";
    for (var i = 0; i < arr.length; i++) {
        result += arr[i];
        if (i + 1 < arr.length) {
            result += ";";
        }
    }
    return result;
}

function removeDuplicateUsingFilter(arr){
    let unique_array = arr.filter(function(elem, index, self) {
        return index == self.indexOf(elem);
    });
    return unique_array
}