
function init(WFA, WFRQ, init_category, WFL) {
    var vue = new Vue({
        el: '#app',
        data: {
            title: 'D&L manage',
            scrollData: {
                fab: false,
                offsetTop: 0,
                scrollT: 0,
                delta: 100,
                isShowFabTop: true,
                transition: 'slide-y-reverse-transition'
            },
            loginData:{
            },
            todayDate: null,
            itemData: null,
            requestList: [],
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
            categoryData: null,
            shareSheet: false,
            shares: [
                { img: 'kakao.png', title: 'Kakao' },
                { img: 'facebook.png', title: 'Facebook' },
            ],
            loginErrorDialog: false,
            requestCheckDialog: false,
            requestSuccessDialog: false,
            requestErrorDialog: false,
            requestCancelDialog: false,
            requestCancelErrorDialog: false,
            //리스트데이터
            WFAs : null,
            WFRQs : null,
            WFLs : null,
            //필터데이터
            filter_keyword: false,
            filter_text: '전체 유실물 리스트',
            dialog_filter: false,
            id: null,
            //필터목록데이터
            lost_filter_num: [],
            /*######## Lost 탭_ 필터 _ 상위 카테고리 ########*/
            category: null,
            lost_filter_category_parent: [],
            /*######## Lost 탭_ 필터 _ 상세 카테고리 ########*/
            subcategory: null,
            lost_filter_category_child: [],
            filter_child_item: [], // 세부 카테고리 초기화 데이터
            /*######## Lost 탭_ 필터 _ 유실물 상태 ########*/
            status: null,
            lost_filter_state: [
                { name: '수거전', code:"WFA" },
                { name: '수거 완료', code:"WFF" },
                { name: '요청 전', code:"WFF" }
            ],
            msgData:{
            },
            bottomTab: "manage",
            todayDate: null,
            customFilter (item, queryText, itemText) {
                const hasValue = val => val != null ? val : ''
                const text = hasValue(item.name)
                const query = hasValue(queryText)
                return text.toString()
                    .toLowerCase()
                    .indexOf(query.toString().toLowerCase()) > -1
            }
        },
        methods: {
            hashTagsToString: function (itemData) {
                var list = [];
                for(var i=0; i<itemData.tags.length; i++){
                    list.push(itemData.tags[i]);
                }
                for(var i=0; i<itemData.recognition_tags.length; i++){
                    list.push(itemData.recognition_tags[i]);
                }

                var tags = "";
                for(var i=0; i<Math.min(list.length, 5); i++){
                    var tag = list[i];
                    if(tag !== ""){
                        tags += "#" + tag + " ";
                    }
                }
                if(list.length > 5)
                    tags += "...";

                return tags;
            },
            reduceString: function (str, len) {
                var newStr = str.substring(0, len);
                if(str.length > 100){
                    newStr += "...";
                }
                return newStr;
            },
            vueMsToDate: function (date) {
                return msToDate(date);
            },
            vueMsToDateKo: function (date) {
                return msToDateKo(date);
            },
            convertStatus: function (status) {
                if(status === "WFA"){
                    return "수거전"
                }
                return ""
            },
            getCategoryStringFromResult: function (title) {
                title = title.replace(" ", "_");
                var keys = Object.keys(this.categoryData);
                for(var i=0; i<keys.length; i++){
                    var key = keys[i];
                    var subcategories = this.categoryData[key]['subcategory'];
                    for(var j=0; j<subcategories.length; j++){
                        var subcategory = subcategories[j];
                        if(subcategory.name === title){
                            return this.categoryData[key].ko + " > " + subcategory.ko;
                            // this.subcategory = subcategory;
                            // this.subcategories = subcategories;
                            // this.category = this.categoryData[key];
                            // return;
                        }
                    }
                }
                return title;
            },
            getBreadCrumbsList: function () {
                var list = [];
                if(this.id !== null){
                    this.filter_keyword = true;
                    list.push(this.id);
                }
                if(this.category !== null){
                    this.filter_keyword = true;
                    list.push(this.category);
                }
                if(this.subcategory !== null){
                    this.filter_keyword = true;
                    list.push(this.subcategory);
                }
                if(this.status !== null){
                    this.filter_keyword = true;
                    list.push(this.status);
                }
                return list;
            },
            /*초기화 버튼 눌렀을 때*/
            resetFilterItem: function () {
                this.id = null;
                this.category = null;
                this.subcategory = null;
                this.status = null;
                this.filter_keyword = false;
            },
            onScroll (e) {
                var scroll = window.pageYOffset || document.documentElement.scrollTop;
                this.scrollData.offsetTop = scroll;

                this.scrollData.scrollT += (scroll-this.scrollData.offsetTop);

                if(this.scrollData.scrollT > this.scrollData.delta){
                    this.scrollData.isShowFabTop = true;
                    this.scrollData.scrollT = 0;
                }else if (this.scrollData.scrollT < -this.scrollData.delta) {
                    this.scrollData.isShowFabTop = false;
                    this.scrollData.scrollT = 0;
                }

                if(scroll === 0){
                    this.scrollData.isShowFabTop = false;
                    this.scrollData.scrollT = 0;
                    this.scrollData.offsetTop = 0;
                }
            },
            getMsg: function () {
                getMsg();
            },
            setMsgRead: function (msg) {
                setMsgRead(msg);
            },
            postFilterData : function () {
                var filterdata = {
                    id: this.id === null ? null : parseInt(this.id.name),
                    category: this.category === null ? null : this.category,
                    subcategory: this.subcategory === null ? null : this.subcategory,
                    // building: this.selectedBuilding === null ? "" : this.selectedBuilding,
                    // room: this.selectedRoom === null ? "" : this.selectedRoom,
                    // tags: this.searchTags,
                    status: this.status === null ? null : this.status.code
                }
                console.log(filterdata);
                axios({
                    method: 'post',
                    url: '/manage/filter',
                    data : filterdata
                }).then(function(response){
                    var result_data = response.data;
                    if(result_data.length > 0){
                        vue.WFAs = null;
                        vue.WFAs = result_data;
                    }
                }).catch(function (err){
                    if(err.response){
                        console.log(err.response);
                    }
                    else if(err.request){
                        console.log(err.request);
                    }
                    else{
                        console.log(err.message);
                    }
                })
            }
        },
        created : function(){
            this.WFAs = JSON.parse(WFA);
            this.WFRQs = JSON.parse(WFRQ);
            // this.WFLs = JSON.parse(WFL);
            // wfas.forEach(function (lost){
            //     this.WFAs.push(lost)
            // })
            // var wfrqs = JSON.parse(WFRQ);
            // wfrqs.forEach(function (lost){
            //     this.WFRQs.push(lost)
            // })
        },
        mounted: [
            function () {
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
                this.todayDate = today;
            },
            // function () {
            //     var json = init_data;
            //     this.itemData = JSON.parse(json);
            //     console.log(this.itemData);
            // },
            function () {
                this.categoryData = JSON.parse(init_category);
                //console.log("category: ", this.categoryData);
                //필터 값 초기화 부분
                for(item in this.categoryData){
                    var obj = {"name":item};
                    this.lost_filter_category_parent.push(obj);
                    for(sub_item in this.categoryData[item].subcategory){
                        var sub_obj = {"name" : this.categoryData[item].subcategory[sub_item].name}
                        this.filter_child_item.push(sub_obj);
                    }
                }
                this.lost_filter_category_child = this.filter_child_item;
                for(item in this.WFAs){
                    var obj = {"name": this.WFAs[item].id}
                    this.lost_filter_num.push(obj)
                }
            },
            function () {
                var title = document.createElement('meta');
                title.name = "og:title";
                title.content = this.itemData.id;
                document.getElementsByTagName('head')[0].appendChild(title);

                var origin = window.location.origin;
                var image = document.createElement('meta');
                image.name = "og:image";
                image.content = origin + "/" + this.itemData.photos;
                document.getElementsByTagName('head')[0].appendChild(image);

                console.log(document.getElementsByTagName('head')[0]);
            }
        ],
        // 대분류 카테고리 선정 완료시 소분류 카테고리 자동 변형
        watch:{
            category: function(val){
                //세부카테고리 초기화
                this.subcategory = null;
                //세부카테고리 선택창 초기화
                if(this.category === null){
                    this.lost_filter_category_child = this.filter_child_item
                }
                //큰 카테고리 선택시 목록 렌더링
                else {
                    this.lost_filter_category_child = [];
                    for (item in this.categoryData[val.name].subcategory) {
                        var obj = {"name": this.categoryData[val.name].subcategory[item].name}
                        this.lost_filter_category_child.push(obj);
                    }
                }
            }
        }
    });
    return vue;
}