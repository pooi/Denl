
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
    return dateString;
}

function msToDateKo(ms) {
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
    var dateString = yyyy + "년 " + mm + "월 " + dd + "일";
    return dateString;
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

function isAdmin(){
    if(vue === null)
        return false;

    return (vue.loginData.user !== null && vue.loginData.user.admin == 1);
}

var Get_building_list = function(){
    var buildings;
    var catch_point;
    var result = "";
    var status = {
        1 : "near",
        2 : "in",
        3 : "out"
    };
    var near_building = [];
    var near_list = [];

    var In_Out = function(ch_buildings, ch_catch_point) {
        buildings = ch_buildings ? ch_buildings : "";
        catch_point = ch_catch_point ? ch_catch_point : "";
    }

    In_Out.prototype = {
        Verify_in_out : function () {
            for(var building in buildings) {
                var check = {
                    building : "",
                    distance : 100000,
                    point : ""
                    // low_x : 100000,
                    // high_x : -100000,
                    // low_y : 100000,
                    // high_y : -100000,
                };
                check.building = building;
                // console.log(building);
                var equation = [];
                var distance_to_point = 19999999999999999;
                for(var line = 0; line < buildings[check["building"]].length; line++){
                    var three_point = {};
                    var next = line + 1;
                    if(line == buildings[check["building"]].length - 1){
                        next = 0;
                    }
                    var temp = buildings[check["building"]];
                    // if(temp[line]['point'][1] < check["low_y"]) check["low_y"] = temp[line]['point'][1]
                    // if(temp[line]['point'][1] > check["high_y"]) check["high_y"] = temp[line]['point'][1]
                    // if(temp[line]['point'][0] < check["low_x"]) check["low_x"] = temp[line]['point'][0]
                    // if(temp[line]['point'][0] > check["high_x"]) check["high_x"] = temp[line]['point'][0]
                    var incli = (temp[line]['point'][1] - temp[next]['point'][1])/(temp[line]['point'][0] - temp[next]['point'][0]);
                    var y_ = temp[line]['point'][1] - incli*temp[line]['point'][0];
                    var temp_arr = [incli,y_];
                    var obj = {"line":temp_arr};
                    var distance_right = Math.pow((catch_point[0]-temp[line]['point'][0]),2) + Math.pow((catch_point[1]-temp[line]['point'][1]),2);
                    if(distance_to_point > distance_right) distance_to_point = distance_right;
                    var distance_center = Math.pow((catch_point[0]-temp[next]['point'][0]),2) + Math.pow((catch_point[1]-temp[next]['point'][1]),2);
                    if(distance_to_point > distance_left) distance_to_point = distance_left;
                    var distance_left = Math.pow((catch_point[0]-((temp[line]['point'][0]+temp[next]['point'][0])/2),2)) + Math.pow((catch_point[1]-((temp[line]['point'][1]+temp[next]['point'][1])/2),2));
                    if(distance_to_point > distance_center) distance_to_point = distance_center;
                    equation.push(obj);
                }
                var temp = {
                    'building' : check['building'],
                    'distance' : distance_to_point
                };
                near_list.push(temp);
                // console.log(near_list);
                // console.log(equation);
                // console.log(check);
                // if(catch_point[0] > check["high_x"] || catch_point[0] < check["low_x"] || catch_point[1] > check["high_y"] || catch_point[1] < check["low_y"]){
                //     console.log("is not in ",building);
                //     continue;
                // }
                var count = 0;
                for(var lc = 0; lc<equation.length; lc++){
                    var temp_equ = equation[lc]['line'];
                    var next = lc + 1;
                    if(lc == equation.length-1) next = 0;
                    var temp_x = (catch_point[1]-temp_equ[1])/temp_equ[0];
                    if(buildings[check["building"]][lc]["point"][0] >= buildings[check["building"]][next]["point"][0]){
                        if(buildings[check["building"]][lc]["point"][0] < temp_x || catch_point[0] > temp_x){
                            continue;
                        }
                        else {
                            count++;
                        }
                    } else{
                        if(buildings[check["building"]][next]["point"][0] < temp_x || catch_point[0] > temp_x){
                            continue;
                        }
                        else {
                            count++;
                        }
                    }

                }
                // if(count%2 == 0){
                //     // console.log("is near ",building);
                //     continue;
                // }
                // else {
                //     result = check["building"]+status["2"];
                //     console.log(result);
                //     var near = {
                //         'building' : check["building"],
                //         'distance' : -100
                //     }
                //     near_list.push(near);
                // }

            }
            near_list.sort(function(a,b){
                if(a.distance > b.distance){
                    return 1;
                }
                if(a.distance < b.distance){
                    return -1;
                }
                return 0;
            })
            // console.log(near_list);
        },
        Setnewarea : function(newarea){
            buildings = newarea;
        },
        Getbuildinginfo : function(){
            return buildings;
        },
        Setcatchpoint : function(newpoint){
            catch_point = newpoint;
        },
        Getnearlist : function(){
            return near_list;
        },
        Resetnearlist : function(){
            near_list = [];
        }
    }

    return In_Out;
}();

function convertStatus(status) {
    if(status === "WFA"){
        return "수거전"
    }else if(status == "WFR"){
        return "수령전"
    }else if(status == "COM"){
        return "완료"
    }
    return ""
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const pastelColors = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(165,42,42,1)',
    'rgba(255,105,180,1)',
    'rgba(160,32,240,1)',
    'rgba(240,128,128,1)',
    'rgba(250,128,114,1)',
    'rgba(135,206,250,1)',
    'rgba(244,164,96,1)',
    'rgba(218,112,214,1)',
    'rgba(245,245,220,1)',
    'rgba(178,34,34,1)',
    'rgba(106,90,205,1)',
    'rgba(65,105,225,1)',
    'rgba(188,143,143,1)',
    'rgba(30,144,255,1)',
    'rgba(72,61,136,1)',
    'rgba(255,192,203,1)',
    'rgba(199,21,133,1)',
    'rgba(233,150,122,1)',
    'rgba(186,85,211,1)',
    'rgba(238,130,238,1)',
    'rgba(176,224,230,1)',
    'rgba(153,50,204,1)',
    'rgba(255,99,71,1)',
    'rgba(173,216,230,1)',
    'rgba(255,140,0,1)',
    'rgba(0,206,209,1)',
    'rgba(221,160,221,1)',
    'rgba(176,48,96,1)',
    'rgba(255,69,0,1)',
    'rgba(0,255,255,1)',
    'rgba(147,112,219,1)',
    'rgba(100,149,237,1)',
    'rgba(176,196,222,1)',
    'rgba(138,43,226,1)',
    'rgba(222,184,135,1)',
    'rgba(255,165,0,1)',
    'rgba(224,255,255,1)',
    'rgba(205,92,92,1)',
    'rgba(245,222,179,1)',
    'rgba(205,133,63,1)',
    'rgba(0,0,128,1)',
    'rgba(216,191,216,1)',
    'rgba(210,180,140,1)',
    'rgba(0,0,205,1)',
    'rgba(95,158,160,1)',
    'rgba(219,112,147,1)',
    'rgba(255,20,147,1)',
    'rgba(70,130,180,1)',
    'rgba(64,224,208,1)',
    'rgba(139,69,19,1)',
    'rgba(210,105,30,1)',
    'rgba(0,191,255,1)'
];