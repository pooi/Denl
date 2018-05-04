
function init(WFA, WFRQ, init_category, WFL) {

    Vue.use(VueObserveVisibility);
    Vue.directive('observe-visibility', VueObserveVisibility.ObserveVisibility);

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
            oneClick: null,
            dalMessage: null,
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
            },
            statisticsData: {
                weekChartData: {
                    ctx: null,
                    chart: null,
                    item: {
                        labels: [],
                        data: []
                    }
                },
                weekCategoryChartData: {
                    ctx: null,
                    chart: null,
                    item: {
                        labels: [],
                        data: []
                    }
                },
                totalChartData: {
                    ctx: null,
                    chart: null,
                    item: {
                        labels: [],
                        data: []
                    }
                }
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
            getMsg:function () {
                getMsg();
            },
            setMsgRead: function (msg) {
                setMsgRead(msg);
            },
            splitArray: function (array) {
                var chunk = 1;
                var breakpoint = this.__proto__.$vuetify.breakpoint;
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
            },
            getWeekData: function () {
                var data = {};

                axios.post(
                    '/statistics/dailySubcategory',
                    data
                ).then(function (response) {
                    var res = response;
                    var data = res.data;
                    vue.statisticsData.weekChartData.item = data;
                    vue.statisticsData.weekChartData.isDraw = false;
                    vue.drawWeekChart();
                }).catch(function (error) {
                    alert(error);
                });

                axios.post(
                    '/statistics/dailyCategory',
                    data
                ).then(function (response) {
                    var res = response;
                    var data = res.data;
                    vue.statisticsData.weekCategoryChartData.item = data;
                    vue.statisticsData.weekCategoryChartData.isDraw = false;
                    vue.drawWeekCategoryChart();
                }).catch(function (error) {
                    alert(error);
                });
            },
            drawWeekChart: function () {
                if(this.statisticsData.weekChartData.chart == null){
                    this.statisticsData.weekChartData.ctx = document.getElementById("weekChart");
                }else{
                    this.statisticsData.weekChartData.chart.destroy();
                }

                this.statisticsData.weekChartData.chart = new Chart(this.statisticsData.weekChartData.ctx, {
                    type: 'pie',
                    data: {
                        labels: vue.statisticsData.weekChartData.item.labels,
                        datasets: [{
                            label: 'Subcategory',
                            data: vue.statisticsData.weekChartData.item.data,
                            backgroundColor: pastelColors,
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        legend: {
                            position: 'right'
                        }
                    }
                });

            },
            drawWeekCategoryChart: function () {
                if(this.statisticsData.weekCategoryChartData.chart == null){
                    this.statisticsData.weekCategoryChartData.ctx = document.getElementById("weekCategoryChart");
                }else{
                    this.statisticsData.weekCategoryChartData.chart.destroy();
                }
                this.statisticsData.weekCategoryChartData.chart = new Chart(this.statisticsData.weekCategoryChartData.ctx, {
                    type: 'pie',
                    data: {
                        labels: vue.statisticsData.weekCategoryChartData.item.labels,
                        datasets: [{
                            label: 'Category',
                            data: vue.statisticsData.weekCategoryChartData.item.data,
                            backgroundColor: pastelColors,
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        legend: {
                            position: 'right'
                        }
                    }
                });
            },
            getTotalData: function () {
                var data = {};

                axios.post(
                    '/statistics/totalSubcategory',
                    data
                ).then(function (response) {
                    var res = response;
                    var data = res.data;
                    vue.statisticsData.totalChartData.item = data;
                    vue.statisticsData.totalChartData.isDraw = false;
                    vue.drawTotalChart();
                }).catch(function (error) {
                    alert(error);
                });

            },
            drawTotalChart: function () {
                if(this.statisticsData.totalChartData.chart == null){
                    this.statisticsData.totalChartData.ctx = document.getElementById("totalChart");
                }else{
                    this.statisticsData.totalChartData.chart.destroy();
                }
                this.statisticsData.totalChartData.chart = new Chart(this.statisticsData.totalChartData.ctx, {
                    type: 'bar',
                    data: {
                        labels: vue.statisticsData.totalChartData.item.labels,
                        datasets: [{
                            label: 'Subcategory',
                            data: vue.statisticsData.totalChartData.item.data,
                            backgroundColor: pastelColors,
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        legend: {
                            display: false,
                            position: 'right'
                        },
                        scales: {
                            yAxes: [{
                                ticks: {
                                    min: 0,
                                    stepSize: 1
                                }
                            }]
                        }
                    }
                });
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
    vue.oneClick = new OneClick(vue);
    vue.dalMessage = new DalMessage(vue);
    return vue;
}