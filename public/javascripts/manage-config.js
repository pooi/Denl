
function init(WFA, WFRQ, init_category, WFL, init_subcategory) {
    // console.log(init_category);
    // console.log(init_subcategory);
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
            supporter: null,
            oneClick: null,
            dalMessage: null,
            categoryManager: null,
            chatManager: null,
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
            Lost : null,
            WFA_id_list : [],
            WFA_request_list : [],
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
                    },
                    colors: null
                },
                weekCategoryChartData: {
                    ctx: null,
                    chart: null,
                    item: {
                        labels: [],
                        data: []
                    },
                    colors: null
                },
                totalChartData: {
                    ctx: null,
                    chart: null,
                    item: {
                        labels: [],
                        data: []
                    },
                    colors: null
                },
                interestChartData: {
                    ctx: null,
                    chart: null,
                    item: {
                        labels: [],
                        data: []
                    },
                    colors: null
                },
                interestCategoryChartData: {
                    ctx: null,
                    chart: null,
                    item: {
                        labels: [],
                        data: []
                    },
                    colors: null
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

                this.scrollData.scrollT += (scroll-this.scrollData.offsetTop);
                this.scrollData.offsetTop = scroll;

                if(this.scrollData.scrollT > this.scrollData.delta){
                    this.scrollData.isShowFabTop = true;
                    this.chatManager.hide();
                    this.scrollData.scrollT = 0;
                }else if (this.scrollData.scrollT < -this.scrollData.delta) {
                    this.scrollData.isShowFabTop = false;
                    this.chatManager.show();
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
                    console.log(result_data);
                    if(result_data.length > 0){
                        vue.WFAs = null;
                        vue.WFAs = result_data;
                    }else{
                        vue.WFAs = [];
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
                console.log("getWeekData");
                var data = {};

                axios.post(
                    '/statistics/dailySubcategory',
                    data
                ).then(function (response) {
                    var res = response;
                    var data = res.data;
                    vue.statisticsData.weekChartData.item = data;
                    vue.statisticsData.weekChartData.isDraw = false;
                    vue.statisticsData.weekChartData.colors = shuffle(pastelColorsT);
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
                    console.log("dailyCategory", data);
                    vue.statisticsData.weekCategoryChartData.item = data;
                    vue.statisticsData.weekCategoryChartData.isDraw = false;
                    vue.statisticsData.weekCategoryChartData.colors = shuffle(pastelColorsT);
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
                            backgroundColor: vue.statisticsData.weekChartData.colors,
                            borderColor: vue.statisticsData.weekChartData.colors,
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
                            backgroundColor: vue.statisticsData.weekCategoryChartData.colors,
                            borderColor: vue.statisticsData.weekCategoryChartData.colors,
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
                console.log("getTotalData");

                axios.post(
                    '/statistics/totalSubcategory',
                    data
                ).then(function (response) {
                    var res = response;
                    var data = res.data;
                    vue.statisticsData.totalChartData.item = data;
                    vue.statisticsData.totalChartData.isDraw = false;
                    vue.statisticsData.totalChartData.colors = shuffle(pastelColorsT);
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
                            backgroundColor: vue.statisticsData.totalChartData.colors,
                            borderColor: vue.statisticsData.totalChartData.colors,
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
            },
            getinterestData: function () {
                var data = {};

                axios.post(
                    '/statistics/interestMasterCategory',
                    data
                ).then(function (response) {
                    var res = response;
                    var data = res.data;
                    vue.statisticsData.interestChartData.item = data;
                    vue.statisticsData.interestChartData.isDraw = false;
                    vue.statisticsData.interestChartData.colors = shuffle(pastelColorsT);
                    vue.drawInterestChart();
                }).catch(function (error) {
                    alert(error);
                });

                axios.post(
                    '/statistics/interestSubcategory',
                    data
                ).then(function (response) {
                    var res = response;
                    var data = res.data;
                    vue.statisticsData.interestCategoryChartData.item = data;
                    vue.statisticsData.interestCategoryChartData.isDraw = false;
                    vue.statisticsData.interestCategoryChartData.colors = shuffle(pastelColorsT);
                    vue.drawInterestSubcategoryChart();
                }).catch(function (error) {
                    alert(error);
                });
            },
            drawInterestChart: function () {
                if(this.statisticsData.interestChartData.chart == null){
                    this.statisticsData.interestChartData.ctx = document.getElementById("interestChart");
                }else{
                    this.statisticsData.interestChartData.chart.destroy();
                }

                this.statisticsData.interestChartData.chart = new Chart(this.statisticsData.interestChartData.ctx, {
                    type: 'bar',
                    data: {
                        labels: vue.statisticsData.interestChartData.item.labels,
                        datasets: [{
                            label: 'Weight',
                            data: vue.statisticsData.interestChartData.item.data,
                            backgroundColor: vue.statisticsData.interestChartData.colors,
                            borderColor: vue.statisticsData.interestChartData.colors,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        legend: {
                            position: 'bottom',
                            display: false
                        }
                    }
                });

            },
            drawInterestSubcategoryChart: function () {
                if(this.statisticsData.interestCategoryChartData.chart == null){
                    this.statisticsData.interestCategoryChartData.ctx = document.getElementById("interestSubcategoryChart");
                }else{
                    this.statisticsData.interestCategoryChartData.chart.destroy();
                }

                this.statisticsData.interestCategoryChartData.chart = new Chart(this.statisticsData.interestCategoryChartData.ctx, {
                    type: 'bar',
                    data: {
                        labels: vue.statisticsData.interestCategoryChartData.item.labels,
                        datasets: [{
                            label: 'Weight',
                            data: vue.statisticsData.interestCategoryChartData.item.data,
                            backgroundColor: vue.statisticsData.interestCategoryChartData.colors,
                            borderColor: vue.statisticsData.interestCategoryChartData.colors,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        legend: {
                            position: 'bottom',
                            display: false
                        }
                    }
                });

            },



            change_wfa_wfrq: function(){
                var wfa_wfrq_data = "(";
                for(item in this.WFA_request_list){
                    wfa_wfrq_data += this.WFA_request_list[item]
                    if(item != this.WFA_request_list.length-1) {
                        wfa_wfrq_data += ","
                    }
                }
                wfa_wfrq_data += ")"
                console.log(wfa_wfrq_data);
                axios({
                    method: 'post',
                    url: '/manage/wfa_wfrq',
                    data : wfa_wfrq_data
                }).then(function(response){
                    console.log(response);
                    alert("success");
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
            this.Lost = this.WFAs;
            this.WFRQs = JSON.parse(WFRQ);
        },
        mounted: [
            function() {
                for(item in this.WFAs){
                    this.WFA_id_list.push(this.WFAs[item].id);
                }
            },
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
                var subcategory = JSON.parse(init_subcategory);
                this.subcategory = [];
                for(item in subcategory){
                    this.lost_filter_category_child.push(subcategory[item].name);
                }
                for(item in this.WFAs){
                    var obj = {"name": this.WFAs[item].id}
                    this.lost_filter_num.push(obj)
                }
            },
            // function () {
            //     var title = document.createElement('meta');
            //     title.name = "og:title";
            //     title.content = this.itemData.id;
            //     document.getElementsByTagName('head')[0].appendChild(title);
            //
            //     var origin = window.location.origin;
            //     var image = document.createElement('meta');
            //     image.name = "og:image";
            //     image.content = origin + "/" + this.itemData.photos;
            //     document.getElementsByTagName('head')[0].appendChild(image);
            //
            //     console.log(document.getElementsByTagName('head')[0]);
            // }
        ],
        watch: {
            category : function(val) {
                this.lost_filter_category_child = [];
                var sub = this.categoryManager.categoryData[val].subcategory;
                for(item in sub){
                    this.lost_filter_category_child.push(sub[item].name);
                }
            }
        },
        beforeDestroy() {
            this.chatManager.beforeDestroy();
        }
    });
    vue.supporter = new DalSupporter(vue);
    vue.oneClick = new OneClick(vue);
    vue.dalMessage = new DalMessage(vue);
    vue.categoryManager = new CategoryManager(vue, init_category);
    vue.chatManager = new ChatManager(vue);
    return vue;
}