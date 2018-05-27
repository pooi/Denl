class OneClick {
    constructor(vue) {
        this.vue = vue;
        this.data = {
            dialog: false,
            imgSrc: null,
            ifFile: false,
            isTagProgress: false,
            isRecognitionProgress: false,
            locationProgress: false,
            locationFail: false,

            categoryDialog: false,
            categoryData: {},
            category: null,
            subcategory: null,
            subcategories: [],

            buildingData: null,
            selectedBuilding: null,
            buildings: [
                '고인돌 잔디밭', '광개토관', '군자관', '다산관', '대양홀', '모짜르트홀', '무방관', '박물관', '세종관',
                '세종이노베이션센터', '아사달 연못', '애지헌', '영실관', '용덕관', '우정당', '율곡관', '이당관', '진관홀',
                '집현관', '충무관', '학생회관', '학술정보원', '행복기숙사'
            ],

            dateModal: false,
            date: getToday(),

            tags: [],
            selectedTags: [],
            brands: [],
            selectedBrands: [],
            colors: [],
            recognitionData: null,
            recognitionDataHeaders: [
                {
                    text: '카테고리',
                    value: 'title'
                },
                {
                    text: '정확도 (%)',
                    align: 'right',
                    value: 'accuracy'
                }
            ],

            isDirect: false,

            recognitionDialog: false,

            responseDialog: false,
            resSuccessMsg: null,
            resSuccessCode: 0,
            resSuccessRedirectHref: null,
            responseErrorDialog: false,

            detailDialog: false,
            description: null,
            hashtags: [],
            submitDetailSuccessDialog: false,
            requestErrorDialog: false
        };
    }

    reset() {
        this.data = {
            dialog: false,
            imgSrc: null,
            ifFile: false,
            isTagProgress: false,
            isRecognitionProgress: false,
            locationProgress: false,
            locationFail: false,

            categoryDialog: false,
            categoryData: {},
            category: null,
            subcategory: null,
            subcategories: [],

            buildingData: null,
            selectedBuilding: null,
            buildings: [
                '고인돌 잔디밭', '광개토관', '군자관', '다산관', '대양홀', '모짜르트홀', '무방관', '박물관', '세종관',
                '세종이노베이션센터', '아사달 연못', '애지헌', '영실관', '용덕관', '우정당', '율곡관', '이당관', '진관홀',
                '집현관', '충무관', '학생회관', '학술정보원', '행복기숙사'
            ],

            dateModal: false,
            date: getToday(),

            tags: [],
            selectedTags: [],
            brands: [],
            selectedBrands: [],
            colors: [],
            recognitionData: null,
            recognitionDataHeaders: [
                {
                    text: '카테고리',
                    value: 'title'
                },
                {
                    text: '정확도 (%)',
                    align: 'right',
                    value: 'accuracy'
                }
            ],

            isDirect:false,

            recognitionDialog: false,

            responseDialog: false,
            resSuccessMsg: null,
            resSuccessCode: 0,
            resSuccessRedirectHref: null,
            responseErrorDialog: false,

            detailDialog: false,
            description: null,
            hashtags: [],
            submitDetailSuccessDialog: false,
            requestErrorDialog: false
        }
    }

    action(){
        this.browseClick();
    }

    checkSubmit() {
        if (this.data.category === null || this.data.subcategory === null)
            return true;

        return (this.data.isTagProgress || this.data.isRecognitionProgress || this.data.locationProgress);
    }

    browseClick() {
        var inputFile = document.getElementById('oneClick_file')
        inputFile.click()
    }

    removeFile() {
        var oneClick = this;
        this.domEleArray[1] = this.domEleArray[0].clone(true); // 쌔거(0번) -> 복사(1번)
        $('#oneClick_file').replaceWith(this.domEleArray[1]);
        $("#oneClick_file").change(function () {
            oneClick.imageChange()
        });
        this.data.isFile = false
    }

    imageChange() {
        var inputFile = document.getElementById('oneClick_file');

        var reader = new FileReader();
        var oneClick = this;
        reader.onload = function () {
            // $('#uploaded-img').attr('src', reader.result);
            oneClick.data.imgSrc = reader.result;
            oneClick.data.dialog = true;
            oneClick.uploadImage();
        };
        reader.readAsDataURL(inputFile.files[0]);
        this.data.isFile = true
    }

    uploadImage() {
        var oneClick = this;
        this.data.isTagProgress = true;
        this.data.isRecognitionProgress = true;
        this.data.locationProgress = true;
        // var form = document.getElementById('image-form');
        // form.submit()

        setTimeout(function () {
            oneClick.getCurrentLocation();
        }, 1000);

        let data = new FormData();

        var inputFile = document.getElementById('oneClick_file');
        data.append('file', inputFile.files.item(0));

        // for (var i = 0; i < inputFile.files.length; i++) {
        //     let file = inputFile.files.item(i);
        //     data.append('images[' + i + ']', file, file.name);
        // }
        data.append('data_only', '1');

        const config = {
            headers: {'content-type': 'multipart/form-data'}
        };

        console.log(data);

        axios.post(
            '/lost',
            data,
            config
        ).then(function (response) {
            var data = response.data;

            oneClick.data.imgSrc = data.image;
            oneClick.data.categoryData = data.category;
            oneClick.data.buildingData = data.buildings;
            oneClick.data.colors = data.colors;

            oneClick.data.tags = [];
            oneClick.data.selectedTags = [];
            oneClick.data.brands = [];
            oneClick.data.selectedBrands = [];
            for (var i = 0; i < data.logos.length; i++) {
                oneClick.data.tags.push(data.logos[i]);
                oneClick.data.selectedTags.push(data.logos[i]);

                oneClick.data.brands.push(data.logos[i]);
                oneClick.data.selectedBrands.push(data.logos[i]);
            }
            for (var i = 0; i < data.labels.length; i++) {
                oneClick.data.tags.push(data.labels[i]);
                oneClick.data.selectedTags.push(data.labels[i]);
            }
            var uTexts = removeDuplicateUsingFilter(data.texts);
            for (var i = 0; i < uTexts.length; i++) {
                oneClick.data.tags.push(uTexts[i]);
                oneClick.data.selectedTags.push(uTexts[i]);
            }
            oneClick.data.isTagProgress = false;
            setTimeout(function () {
                oneClick.recognitionImage();
            }, 10);

        })
            .catch(function (error) {
                alert(error);
            });

        // return axios.post('/api/images', data, config)

    }

    recognitionImage() {
        var oneClick = this;
        this.data.isRecognitionProgress = true;
        console.log("recognitionImage");

        var data = {
            image: oneClick.data.imgSrc
        };

        axios.post(
            '/lost/recognition',
            data
        ).then(function (response) {
            var data = response.data;
            oneClick.data.isRecognitionProgress = false;
            oneClick.data.recognitionData = data;
            oneClick.changedCategoryFromResult(data[0]);
            console.log("recognitionData: ", oneClick.data.recognitionData);
        })
            .catch(function (error) {
                oneClick.data.isRecognitionProgress = false;
                alert("이미지 인식에 실패하였습니다. 카테고리를 선택해주세요.");
            });
    }

    getCurrentLocation() {
        var oneClick = this;
        if (navigator.geolocation) {
            this.data.locationProgress = true;
            oneClick.data.locationFail = false;
            //위치 정보를 얻기
            navigator.geolocation.getCurrentPosition(function (pos) {
                var latitude = pos.coords.latitude;   // 적도의 북쪽 기준 각도인 위도
                var longitude = pos.coords.longitude; // 그리니치 천문대의 동쪽 기준 각도인 경도
                var accuracy = pos.coords.accuracy;   // 미터 단위의 정확도

                var test = new Get_building_list(oneClick.data.buildingData, [longitude, latitude]);
                test.Verify_in_out();

                var temp_arr = test.Getnearlist();
                var new_arr = [];
                for (var temp_ar in temp_arr) {
                    new_arr.push(temp_arr[temp_ar].building);
                }
                if (new_arr.length > 0)
                    oneClick.data.buildings = new_arr;

                if (oneClick.data.buildings.length > 0)
                    oneClick.data.selectedBuilding = oneClick.data.buildings[0];

                test.Resetnearlist();
                // vue.isShowMap = true;

                // var uluru = {lat: latitude, lng: longitude};
                // var map = new google.maps.Map(document.getElementById('div_map'), {
                //     zoom: 17,
                //     center: uluru
                // });
                // // console.log(map);
                // var marker = new google.maps.Marker({
                //     position: uluru,
                //     map: map
                // });

                oneClick.data.locationProgress = false;

                // var divMap = document.getElementById('div_map');
                // divMap.appendChild("")
            }, function (error) {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        alert("User denied the request for Geolocation.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert("Location information is unavailable.");
                        break;
                    case error.TIMEOUT:
                        alert("The request to get user location timed out.");
                        break;
                    case error.UNKNOWN_ERROR:
                        alert("An unknown error occurred.");
                        break;
                    default:
                        alert("An unknown error occurred.");
                        break;
                }
                oneClick.data.locationProgress = false;
                oneClick.data.locationFail = true;
            });
        } else {
            alert("이 브라우저에서는 Geolocation이 지원되지 않습니다.")
        }
    }

    submit() {

        if (this.vue.loginData.user === null) {
            console.log("in");
            this.vue.loginData.dialog = true;
            return;
        }
        var oneClick = this;

        var image = this.data.imgSrc;
        image = image.startsWith('/') ? image : '/' + image;

        var data = {
            photos: image,
            category: this.data.category === null ? "" : this.data.category.name,
            subcategory: this.data.subcategory === null ? "" : this.data.subcategory.name,
            brand: this.data.brands.length > 0 ? JSON.stringify(this.data.brands) : "",
            building: this.data.selectedBuilding === null ? "" : this.data.selectedBuilding,
            room: "",
            tags: "",
            recognition_tags: this.data.selectedTags.length > 0 ? JSON.stringify(this.data.selectedTags) : "",
            description: "",
            color: this.data.colors.length > 0 ? JSON.stringify(this.data.colors) : "",
            recognition_result: this.data.recognitionData === null ? "" : JSON.stringify(this.data.recognitionData),
            status: this.data.isDirect ? "P2P" : "WFA",
            dcv_date: dateToMs(this.data.date),
            rgt_date: getTodayMs(),
            rgt_user: this.vue.loginData.user.id,
            location_code: "sju"
        };

        axios.post(
            '/lost/submit',
            data
        ).then(function (response) {
            var data = response.data;
            var insertId = data.insertId;
            if (insertId != null) {
                // alert(insertId);
                oneClick.data.resSuccessMsg = "성공적으로 등록하였습니다. 등록 번호 : ";
                oneClick.data.resSuccessCode = insertId;
                oneClick.data.resSuccessRedirectHref = "/items/" + insertId;
                oneClick.data.responseDialog = true;
            } else {
                oneClick.data.responseErrorDialog = true;
                alert("error");
            }
            // console.log(response);
        })
            .catch(function (error) {
                alert(error);
            });

    }

    submitDetail() {

        if (this.vue.loginData.user === null) {
            console.log("in");
            this.vue.loginData.dialog = true;
            return;
        }
        var oneClick = this;

        var data = {
            lost_id: this.data.resSuccessCode,
            brand: this.data.brands.length > 0 ? JSON.stringify(this.data.brands) : "",
            tags: this.data.hashtags.length > 0 ? JSON.stringify(this.data.hashtags) : "",
            description: this.data.description === null ? "" : this.data.description
        };

        axios.post(
            '/lost/submitDetail',
            data
        ).then(function (response) {
            var data = response.data;
            var affectedRows = data.affectedRows;
            if (affectedRows > 0) {
                oneClick.data.responseDialog = false;
                oneClick.data.detailDialog = false;
                oneClick.data.submitDetailSuccessDialog = true;
                // vue.requestSuccessDialog = true;
            } else {
                oneClick.data.requestErrorDialog = true;
                // vue.requestCancelErrorDialog = true;
            }

        }).catch(function (error) {
            alert(error);
        });
    }


    /*Sub function*/

    changeSelectedTags(tag) {
        if (this.data.selectedTags.includes(tag) > 0) {
            this.data.selectedTags.splice(this.data.selectedTags.indexOf(tag), 1);
        } else {
            this.data.selectedTags.push(tag);
        }
        // console.log(this.selectedSuggestTag);
    }

    chageSelectedBrand(tag) {
        if (this.data.selectedBrands.includes(tag) > 0) {
            this.data.selectedBrands.splice(this.data.selectedBrands.indexOf(tag), 1);
        } else {
            this.data.selectedBrands.push(tag);
        }
    }

    changedCategoryFromResult(item) {
        var title = item.title;
        title = title.replace(" ", "_");
        var keys = Object.keys(this.data.categoryData);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var subcategories = this.data.categoryData[key]['subcategory'];
            for (var j = 0; j < subcategories.length; j++) {
                var subcategory = subcategories[j];
                if (subcategory.name === title) {
                    this.data.subcategory = subcategory;
                    this.data.subcategories = subcategories;
                    this.data.category = this.data.categoryData[key];
                    return;
                }
            }
        }
    }

    getCategoryBreadcrumbs() {
        var list = [];
        if (this.data.category !== null) {
            list.push(this.data.category.ko);
        }
        if (this.data.subcategory !== null) {
            list.push(this.data.subcategory.ko);
        }
        return list;
    }

    getCategoryStringFromResult(title) {
        title = title.replace(" ", "_");
        var keys = Object.keys(this.data.categoryData);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var subcategories = this.data.categoryData[key]['subcategory'];
            for (var j = 0; j < subcategories.length; j++) {
                var subcategory = subcategories[j];
                if (subcategory.name === title) {
                    return this.data.categoryData[key].ko + " > " + subcategory.ko;
                    // this.subcategory = subcategory;
                    // this.subcategories = subcategories;
                    // this.category = this.categoryData[key];
                    // return;
                }
            }
        }
        return title;
    }

    changeSubCategories(key) {

        if (this.data.categoryData.hasOwnProperty(key)) {
            this.data.category = this.data.categoryData[key];
            this.data.subcategory = null;
            this.data.subcategories = this.data.category.subcategory;
        }

    }

    isSameCategoryData(c1, c2) {
        if (c1 === null || c2 === null)
            return false;
        return c1.name == c2.name
    }
}

class DalMessage {
    constructor(vue) {
        this.vue = vue;
        this.data = {
            menu: false,
            currentPath: window.location.pathname,
            msgTab: 'tab-New',
            msgTagItems: [
                'New', 'Read'
            ],
            newMsgCount: 0,
            isFirstLoading: true,
            msgDialog: false,
            selectedMsg: null,
            newMsgs: null,
            readMsgs: null
        };
        var dalMessage = this;
        $(document).ready(function () {
            dalMessage.getNewMsgCount();
        });
    }

    getNewMsgCount() {
        var dalMessage = this;

        if (this.vue.loginData.user === null) {
            this.data.newMsgCount = 0;
            return;
        }

        var data = {
            user_id: this.vue.loginData.user.id
        };

        axios.post(
            '/getMsgCount',
            data
        ).then(function (response) {
            var data = response.data;
            // console.log("newMsg: ", data);
            dalMessage.data.newMsgCount = parseInt(data);
            // console.log(response);
        })
            .catch(function (error) {
                alert(error);
            });
    }

    getMsg() {
        var dalMessage = this;

        if (this.vue.loginData.user === null) {
            return;
        }

        if (this.data.isFirstLoading) {
            this.data.isFirstLoading = false;
        } else {
            return;
        }

        var data = {
            user_id: this.vue.loginData.user.id,
            isNew: true
        };

        axios.post(
            '/getMsg',
            data
        ).then(function (response) {
            var data = response.data;
            dalMessage.data.newMsgs = [];
            dalMessage.data.newMsgs = dalMessage.data.newMsgs.concat(data);
        })
            .catch(function (error) {
                dalMessage.data.isFirstLoading = true;
                alert(error);
            });

        data = {
            user_id: this.vue.loginData.user.id,
            isNew: false
        };

        axios.post(
            '/getMsg',
            data
        ).then(function (response) {
            var data = response.data;
            dalMessage.data.readMsgs = [];
            dalMessage.data.readMsgs = dalMessage.data.readMsgs.concat(data);
        })
            .catch(function (error) {
                dalMessage.data.isFirstLoading = true;
                alert(error);
            });


    }

    setMsgRead(msg) {
        var dalMessage = this;

        var data = {
            msg: msg
        };

        axios.post(
            '/setMsgRead',
            data
        ).then(function (response) {
            var data = response.data;
            var insertId = data.insertId;
            if (insertId != null) {
                for (var i = 0; i < vue.msgData.newMsgs.length; i++) {
                    if (dalMessage.data.newMsgs[i].id === msg.id) {
                        dalMessage.data.newMsgs[i].is_read = 1;
                        dalMessage.data.newMsgCount = Math.max(0, dalMessage.data.newMsgCount - 1);
                        break;
                    }
                }
            } else {
                alert("error");
            }
            // console.log(response);
        })
            .catch(function (error) {
                alert(error);
            });
    }
}

class DalSupporter {
    constructor(vue) {
        this.vue = vue;
        this.data = {

        }
    }

    isAdmin () {
        if (vue === null)
            return false;

        return (vue.loginData.user !== null && vue.loginData.user.admin == 1);
    }

    getToday() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!

        var yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }
        var today = yyyy + "-" + mm + "-" + dd; //dd + '/' + mm + '/' + yyyy;
        return today;
    }

    static getToday() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!

        var yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }
        var today = yyyy + "-" + mm + "-" + dd; //dd + '/' + mm + '/' + yyyy;
        return today;
    }

    getTodayMs () {
        var d = new Date();
        return d.getTime();
    }

    static getTodayMs () {
        var d = new Date();
        return d.getTime();
    }

    dateToMs (date) {
        var temp = date.split('-');
        var year = parseInt(temp[0]);
        var month = parseInt(temp[1]);
        var day = parseInt(temp[2]);
        var k = Date.parse(date);
        return k;
    }

    static dateToMs (date) {
        var temp = date.split('-');
        var year = parseInt(temp[0]);
        var month = parseInt(temp[1]);
        var day = parseInt(temp[2]);
        var k = Date.parse(date);
        return k;
    }

    msToDate (ms) {
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

    static msToDate (ms) {
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

    msToDateKo (ms) {
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

    static msToDateKo (ms) {
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

    convertStatus(status) {
        if (status === "WFA") {
            return "수거전"
        } else if(status === "WFRQ"){
            return "보관중"
        } else if (status === "WFR") {
            return "수령전"
        } else if (status === "COM") {
            return "완료"
        } else if (status === "P2P"){
            return "개인거래"
        }
        return ""
    }

    static convertStatus(status) {
        if (status === "WFA") {
            return "수거전"
        } else if(status === "WFRQ"){
            return "보관중"
        } else if (status === "WFR") {
            return "수령전"
        } else if (status === "COM") {
            return "완료"
        } else if (status === "P2P"){
            return "개인거래"
        }
        return ""
    }

    hashTagsToString (itemData) {
        var list = [];
        for (var i = 0; i < itemData.tags.length; i++) {
            list.push(itemData.tags[i]);
        }
        for (var i = 0; i < itemData.recognition_tags.length; i++) {
            list.push(itemData.recognition_tags[i]);
        }

        var tags = "";
        for (var i = 0; i < Math.min(list.length, 5); i++) {
            var tag = list[i];
            if (tag !== "") {
                tags += "#" + tag + " ";
            }
        }
        if (list.length > 5)
            tags += "...";

        return tags;
    }

    static hashTagsToString (itemData) {
        var list = [];
        for (var i = 0; i < itemData.tags.length; i++) {
            list.push(itemData.tags[i]);
        }
        for (var i = 0; i < itemData.recognition_tags.length; i++) {
            list.push(itemData.recognition_tags[i]);
        }

        var tags = "";
        for (var i = 0; i < Math.min(list.length, 5); i++) {
            var tag = list[i];
            if (tag !== "") {
                tags += "#" + tag + " ";
            }
        }
        if (list.length > 5)
            tags += "...";

        return tags;
    }

    reduceString (str, len) {
        var newStr = str.substring(0, len);
        if(str.length > 100){
            newStr += "...";
        }
        return newStr;
    }

    static reduceString (str, len) {
        var newStr = str.substring(0, len);
        if(str.length > 100){
            newStr += "...";
        }
        return newStr;
    }

    reloadPage () {
        location.reload();
    }

    acceptItem (item) {
        var chk = confirm("수거 완료하겠습니까? 이 작업은 되돌릴 수 없습니다.");
        if(!chk)
            return;

        var supporter = this;

        var data = {
            lost_id: item.id
        };

        axios.post(
            '/items/acceptItem',
            data
        ).then(function (response) {
            var data = response.data;
            var insertId = data.insertId;
            if (insertId != null) {
                item.status = "WFRQ";
                // supporter.reloadPage();
            } else {
                alert("Error! Please retry.");
                // vue.requestErrorDialog = true;
            }
            // console.log(response);
        })
            .catch(function (error) {
                alert(error);
            });
    }

    splitArray (array) {
        var chunk = 1;
        var breakpoint = this.vue.__proto__.$vuetify.breakpoint;
        if(breakpoint.xs || breakpoint.xl)
            chunk = 1;
        else if(breakpoint.sm)
            chunk = 2;
        else if(breakpoint.md)
            chunk = 3;
        else
            chunk = 4;
        // console.log(this.__proto__.$vuetify.breakpoint);
        // console.log("chunk", chunk);

        var i,j,temparray;
        var newArray = [];
        for (i=0,j=array.length; i<j; i+=chunk) {
            temparray = array.slice(i,i+chunk);

            while(temparray.length < chunk){
                temparray.push(null);
            }

            newArray.push(temparray);
        }
        // console.log(newArray);
        return newArray;
    }
}

class CategoryManager {

    constructor(vue, init_category) {
        this.vue = vue;

        try{
            this.categoryData = JSON.parse(init_category);
        }catch (e) {

        }
        // this.categoryData = JSON.parse(init_category);
        this.subcategories = [];

        this.category = null;
        this.subcategory = null;

        this.categoryDialog = false;

    }

    isSameCategoryData (c1, c2) {
        if(c1 === null ||c2 === null)
            return false;
        return c1.name == c2.name
    }

    changeMasterCategoryString(key){
        try{
            var str = this.categoryData[key].ko;
            return str;
        }catch (e){
            return ""
        }
    }

    changeCategoryString(key){
        try{
            var str = "";
            for(var i=0; i<this.category.subcategory.length; i++){
                var sub = this.category.subcategory[i];
                if(sub.name === key){
                    str = sub.ko;
                    break;
                }
            }
            return str;
        }catch (e){
            return ""
        }
    }

    changeSubCategories (key) {
        if (this.categoryData.hasOwnProperty(key)) {
            this.category = this.categoryData[key];
            this.subcategory = null;
            this.subcategories = this.category.subcategory;
        }
    }

    getCategoryBreadcrumbs () {
        var list = [];
        if(this.category !== null){
            list.push(this.category.ko);
        }
        if(this.subcategory !== null){
            list.push(this.subcategory.ko);
        }
        return list;
    }

    getCategoryBreadcrumbs2 (itemData) {
        var list = [];
        if(itemData.subcategory !== null){
            var title = itemData.subcategory;
            title = title.replace(" ", "_");
            var keys = Object.keys(this.categoryData);
            for(var i=0; i<keys.length; i++){
                var key = keys[i];
                var subcategories = this.categoryData[key]['subcategory'];
                for(var j=0; j<subcategories.length; j++){
                    var subcategory = subcategories[j];
                    if(subcategory.name === title){
                        // this.category = this.categoryData[key];
                        // this.subcategory = subcategory;
                        list.push(this.categoryData[key].ko);
                        list.push(subcategory.ko);
                        return list;
                    }
                }
            }
        }
        return list;
    }

    getCategoryStringFromResult (title) {
        title = title.replace(" ", "_");
        var keys = Object.keys(this.categoryData);
        for(var i=0; i<keys.length; i++){
            var key = keys[i];
            var subcategories = this.categoryData[key]['subcategory'];
            for(var j=0; j<subcategories.length; j++){
                var subcategory = subcategories[j];
                if(subcategory.name === title){
                    return this.categoryData[key].ko + " > " + subcategory.ko;
                }
            }
        }
        return title;
    }

    changedCategoryFromResult (item){
        var title = item.title;
        title = title.replace(" ", "_");
        var keys = Object.keys(this.categoryData);
        for(var i=0; i<keys.length; i++){
            var key = keys[i];
            var subcategories = this.categoryData[key]['subcategory'];
            for(var j=0; j<subcategories.length; j++){
                var subcategory = subcategories[j];
                if(subcategory.name === title){
                    this.subcategory = subcategory;
                    this.subcategories = subcategories;
                    this.category = this.categoryData[key];
                    return;
                }
            }
        }
    }

}

class GroupItem{
    constructor(key, itemData) {
        this.key = key;
        this.itemData = itemData; // list
        this.isViewExpanded = false;
    }
}


function getToday() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    var today = yyyy + "-" + mm + "-" + dd; //dd + '/' + mm + '/' + yyyy;
    return today;
}

function getTodayMs() {
    var d = new Date();
    return d.getTime();
}

function dateToMs(date) {
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

function removeDuplicateUsingFilter(arr) {
    let unique_array = arr.filter(function (elem, index, self) {
        return index == self.indexOf(elem);
    });
    return unique_array
}

// function isAdmin() {
//     if (vue === null)
//         return false;
//
//     return (vue.loginData.user !== null && vue.loginData.user.admin == 1);
// }

var Get_building_list = function () {
    var buildings;
    var catch_point;
    var result = "";
    var status = {
        1: "near",
        2: "in",
        3: "out"
    };
    var near_building = [];
    var near_list = [];

    var In_Out = function (ch_buildings, ch_catch_point) {
        buildings = ch_buildings ? ch_buildings : "";
        catch_point = ch_catch_point ? ch_catch_point : "";
    }

    In_Out.prototype = {
        Verify_in_out: function () {
            for (var building in buildings) {
                var check = {
                    building: "",
                    distance: 100000,
                    point: ""
                    // low_x : 100000,
                    // high_x : -100000,
                    // low_y : 100000,
                    // high_y : -100000,
                };
                check.building = building;
                // console.log(building);
                var equation = [];
                var distance_to_point = 19999999999999999;
                for (var line = 0; line < buildings[check["building"]].length; line++) {
                    var three_point = {};
                    var next = line + 1;
                    if (line == buildings[check["building"]].length - 1) {
                        next = 0;
                    }
                    var temp = buildings[check["building"]];
                    // if(temp[line]['point'][1] < check["low_y"]) check["low_y"] = temp[line]['point'][1]
                    // if(temp[line]['point'][1] > check["high_y"]) check["high_y"] = temp[line]['point'][1]
                    // if(temp[line]['point'][0] < check["low_x"]) check["low_x"] = temp[line]['point'][0]
                    // if(temp[line]['point'][0] > check["high_x"]) check["high_x"] = temp[line]['point'][0]
                    var incli = (temp[line]['point'][1] - temp[next]['point'][1]) / (temp[line]['point'][0] - temp[next]['point'][0]);
                    var y_ = temp[line]['point'][1] - incli * temp[line]['point'][0];
                    var temp_arr = [incli, y_];
                    var obj = {"line": temp_arr};
                    var distance_right = Math.pow((catch_point[0] - temp[line]['point'][0]), 2) + Math.pow((catch_point[1] - temp[line]['point'][1]), 2);
                    if (distance_to_point > distance_right) distance_to_point = distance_right;
                    var distance_center = Math.pow((catch_point[0] - temp[next]['point'][0]), 2) + Math.pow((catch_point[1] - temp[next]['point'][1]), 2);
                    if (distance_to_point > distance_left) distance_to_point = distance_left;
                    var distance_left = Math.pow((catch_point[0] - ((temp[line]['point'][0] + temp[next]['point'][0]) / 2), 2)) + Math.pow((catch_point[1] - ((temp[line]['point'][1] + temp[next]['point'][1]) / 2), 2));
                    if (distance_to_point > distance_center) distance_to_point = distance_center;
                    equation.push(obj);
                }
                var temp = {
                    'building': check['building'],
                    'distance': distance_to_point
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
                for (var lc = 0; lc < equation.length; lc++) {
                    var temp_equ = equation[lc]['line'];
                    var next = lc + 1;
                    if (lc == equation.length - 1) next = 0;
                    var temp_x = (catch_point[1] - temp_equ[1]) / temp_equ[0];
                    if (buildings[check["building"]][lc]["point"][0] >= buildings[check["building"]][next]["point"][0]) {
                        if (buildings[check["building"]][lc]["point"][0] < temp_x || catch_point[0] > temp_x) {
                            continue;
                        }
                        else {
                            count++;
                        }
                    } else {
                        if (buildings[check["building"]][next]["point"][0] < temp_x || catch_point[0] > temp_x) {
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
            near_list.sort(function (a, b) {
                if (a.distance > b.distance) {
                    return 1;
                }
                if (a.distance < b.distance) {
                    return -1;
                }
                return 0;
            })
            // console.log(near_list);
        },
        Setnewarea: function (newarea) {
            buildings = newarea;
        },
        Getbuildinginfo: function () {
            return buildings;
        },
        Setcatchpoint: function (newpoint) {
            catch_point = newpoint;
        },
        Getnearlist: function () {
            return near_list;
        },
        Resetnearlist: function () {
            near_list = [];
        }
    }

    return In_Out;
}();



function shuffle(a) {
    var input = a.slice();

    for (var i = input.length - 1; i >= 0; i--) {

        var randomIndex = Math.floor(Math.random() * (i + 1));
        var itemAtIndex = input[randomIndex];

        input[randomIndex] = input[i];
        input[i] = itemAtIndex;
    }
    return input;
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

const pastelColorsT = [
    'rgba(255, 99, 132, 0.5)',
    'rgba(54, 162, 235, 0.5)',
    'rgba(255, 206, 86, 0.5)',
    'rgba(75, 192, 192, 0.5)',
    'rgba(153, 102, 255, 0.5)',
    'rgba(255, 159, 64, 0.5)',
    'rgba(165,42,42,0.5)',
    'rgba(255,105,180,0.5)',
    'rgba(160,32,240,0.5)',
    'rgba(240,128,128,0.5)',
    'rgba(250,128,114,0.5)',
    'rgba(135,206,250,0.5)',
    'rgba(244,164,96,0.5)',
    'rgba(218,112,214,0.5)',
    'rgba(245,245,220,0.5)',
    'rgba(178,34,34,0.5)',
    'rgba(106,90,205,0.5)',
    'rgba(65,105,225,0.5)',
    'rgba(188,143,143,0.5)',
    'rgba(30,144,255,0.5)',
    'rgba(72,61,136,0.5)',
    'rgba(255,192,203,0.5)',
    'rgba(199,21,133,0.5)',
    'rgba(233,150,122,0.5)',
    'rgba(186,85,211,0.5)',
    'rgba(238,130,238,0.5)',
    'rgba(176,224,230,0.5)',
    'rgba(153,50,204,0.5)',
    'rgba(255,99,71,0.5)',
    'rgba(173,216,230,0.5)',
    'rgba(255,140,0,0.5)',
    'rgba(0,206,209,0.5)',
    'rgba(221,160,221,0.5)',
    'rgba(176,48,96,0.5)',
    'rgba(255,69,0,0.5)',
    'rgba(0,255,255,0.5)',
    'rgba(147,112,219,0.5)',
    'rgba(100,149,237,0.5)',
    'rgba(176,196,222,0.5)',
    'rgba(138,43,226,0.5)',
    'rgba(222,184,135,0.5)',
    'rgba(255,165,0,0.5)',
    'rgba(224,255,255,0.5)',
    'rgba(205,92,92,0.5)',
    'rgba(245,222,179,0.5)',
    'rgba(205,133,63,0.5)',
    'rgba(0,0,128,0.5)',
    'rgba(216,191,216,0.5)',
    'rgba(210,180,140,0.5)',
    'rgba(0,0,205,0.5)',
    'rgba(95,158,160,0.5)',
    'rgba(219,112,147,0.5)',
    'rgba(255,20,147,0.5)',
    'rgba(70,130,180,0.5)',
    'rgba(64,224,208,0.5)',
    'rgba(139,69,19,0.5)',
    'rgba(210,105,30,0.5)',
    'rgba(0,191,255,0.5)'
];