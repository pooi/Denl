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

    var In_Out = function(ch_buildings, ch_catch_point) {
        buildings = ch_buildings ? ch_buildings : "";
        catch_point = ch_catch_point ? ch_catch_point : "";
    }

    In_Out.prototype = {
        Verify_in_out : function () {
            var near_list = [];
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
                console.log(building);
                var equation = [];
                var distance_to_point = 19999999;
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
                console.log(equation);
                console.log(check);
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
                if(count%2 == 0){
                    console.log("is near ",building);
                    continue;
                }
                else {
                    // result = check["building"]+status["2"];
                    // return result;
                    var near = {
                        'building' : check["building"],
                        'distance' : -100
                    }
                    near_list.push(near);
                }

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
            console.log(near_list);
        },
        Setnewarea : function(newarea){
            buildings = newarea;
        },
        Getbuildinginfo : function(){
            return buildings;
        },
        Setcatchpoint : function(newpoint){
            catch_point = newpoint;
        }
    }

    return In_Out;
}();

var buildings = {
    yulgook : [
        {"point" : [127.074285,37.551939]}, //rightup
        {"point" : [127.074098,37.552041]}, //leftup
        {"point" : [127.073793,37.551768]}, //leftdown
        {"point" : [127.073956,37.551643]}//rightdown
    ],
    youngsil : [
        {"point" : [127.073698,37.552573]},
        {"point" : [127.073572,37.552673]},
        {"point" : [127.072969,37.552148]},
        {"point" : [127.073090,37.552065]}
    ],
    chungmu : [
        {"point" : [127.074464,37.552085]},
        {"point" : [127.073782,37.552595]},
        {"point" : [127.073591,37.552418]},
        {"point" : [127.074291,37.551942]}
    ]
}

var buildings2 = {
    yulgook : [
        {"point" : [127.074285,37.551939]}, //rightup
        {"point" : [127.074098,37.552041]}, //leftup
        {"point" : [127.073793,37.551768]}, //leftdown
        {"point" : [127.073956,37.551643]}//rightdown
    ],
    youngsil : [
        {"point" : [127.073698,37.552573]},
        {"point" : [127.073572,37.552673]},
        {"point" : [127.072969,37.552148]},
        {"point" : [127.073090,37.552065]}
    ]
}
var test_4 = [127.073867,37.552320];//충무관 안
var test = new Get_building_list(buildings,test_4);

var test_1 = [127.073362, 37.552274]; // 영실관 밖
var test_2 = [127.073880,37.551951]; //율근처 밖

console.log(test.Verify_in_out());