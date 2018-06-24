

function init(init_category) {

    Vue.use(VueObserveVisibility);
    Vue.directive('observe-visibility', VueObserveVisibility.ObserveVisibility);

    var vue = new Vue({
        el: '#app',
        data: {
            title: 'D&L',
            dialog: false,
            drawer: false,
            scrollData: {
                fab: false,
                offsetTop: 0,
                scrollT: 0,
                delta: 200,
                isShowFabTop: true,
                transition: 'slide-y-reverse-transition',
                statusBar: true
            },
            statusColor: "#ffaf1d",
            loginData:{

            },
            supporter: null,
            oneClick: null,
            dalMessage: null,
            categoryManager: null,
            chatManager: null,
            moreBtn: null,
            // categoryData: null,
            bottomTab: "home",

            shareSheet: false,
            shareItem: null,
            shares: [
                { img: 'kakao.png', title: 'Kakao' },
                { img: 'facebook.png', title: 'Facebook' },
            ],

            recentItems: [],
            e1: 'home',
            recentModel: 0,
            recentSteps: [],

            statisticsData: {
                weekChartData: {
                    bg: null,
                    ctx: null,
                    chart: null,
                    item: {
                        labels: [],
                        data: []
                    },
                    colors: null
                },
                weekCategoryChartData: {
                    bg: null,
                    ctx: null,
                    chart: null,
                    item: {
                        labels: [],
                        data: []
                    },
                    colors: null
                }

            },

            infoFind: false,
            infoLost: false,
            infoManage: false

        },
        methods:{
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

                if(!this.scrollData.statusBar && this.scrollData.offsetTop < 50){
                    this.scrollData.statusBar = !this.scrollData.statusBar;
                    this.changeStatusBarColorOnNativeApp("orange");
                    this.statusColor = this.supporter.getStatusLightOrange();
                }else if(this.scrollData.statusBar & this.scrollData.offsetTop >= 50){
                    this.scrollData.statusBar = !this.scrollData.statusBar;
                    this.changeStatusBarColorOnNativeApp("white");
                    this.statusColor = "#FFFFFF";
                }
            },
            changeStatusBarColorOnNativeApp(color){
                try {
                    console.log(color);
                    webkit.messageHandlers.changeStatusBarBGColor.postMessage(color);
                } catch (error) {

                }
                try{
                    window.Denl.changeStatusBarBGColor(color);
                }catch (e){

                }
            },
            goRecent: function () {
                var offset = 40;
                if(this.__proto__.$vuetify.breakpoint.smAndDown)
                    offset = -26;

                $('html, body').animate({
                    scrollTop: $('#recent').offset().top - offset
                }, 500);
            },
            shareTo: function (title) {

                var shareItem = this.shareItem;
                var url = window.location.origin + "/items/" + shareItem.id;
                var origin = window.location.origin;

                if(title === "Kakao"){

                    var tags = DalSupporter.hashTagsToString(shareItem);

                    Kakao.Link.sendDefault({
                        objectType: 'feed',
                        content: {
                            title: 'D&L 유실물' + " - " + shareItem.id + "(" + vue.categoryManager.getCategoryStringFromResult(shareItem.subcategory) + ")",
                            description: tags,
                            imageUrl: origin + "/" + shareItem.photos,
                            link: {
                                mobileWebUrl: url,
                                webUrl: url
                            }
                        },
                        buttons: [
                            {
                                title: '확인하기',
                                link: {
                                    mobileWebUrl: url,
                                    webUrl: url
                                }
                            }
                        ]
                    });
                }
                this.shareSheet = false;

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

            // Statistics
            getWeekData: function () {
                var data = {
                    period: 30
                };

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
                    this.statisticsData.weekChartData.bg = document.getElementById("weekChartDiv");
                }else{
                    this.statisticsData.weekChartData.chart.destroy();
                }

                var labels = [];
                var data = [];
                var max = 0;
                for(var i = 0; i<Math.min(5, vue.statisticsData.weekChartData.item.data.length); i++){
                    var d = vue.statisticsData.weekChartData.item.data[i];
                    max = Math.max(d, max);
                    data.push(d);
                    labels.push(vue.statisticsData.weekChartData.item.labels[i]);
                }
                this.statisticsData.weekChartData.chart = new Chart(this.statisticsData.weekChartData.ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Subcategory',
                            data: data,
                            backgroundColor: vue.statisticsData.weekChartData.colors,
                            borderColor: vue.statisticsData.weekChartData.colors,
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
                                    max: max+0.5,
                                    min: 0,
                                    stepSize: 0.5
                                }
                            }]
                        }
                    }
                });

            },
            drawWeekCategoryChart: function () {
                if(this.statisticsData.weekCategoryChartData.chart == null){
                    this.statisticsData.weekCategoryChartData.ctx = document.getElementById("weekCategoryChart");
                    this.statisticsData.weekCategoryChartData.bg = document.getElementById("weekCategoryChartDiv");
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
                            position: 'left'
                        }
                    }
                });

            },
            drawIndexChart: function () {
                console.log("draw");
                if(this.statisticsData.weekChartData.bg !== null)
                    this.statisticsData.weekChartData.bg.style.visibility = 'hidden';
                this.drawWeekCategoryChart();
                setTimeout(function() {
                    if(vue.statisticsData.weekChartData.bg !== null)
                        vue.statisticsData.weekChartData.bg.style.visibility = 'visible';
                    vue.drawWeekChart()
                },1000);
            }
        },
        mounted:[
            function () {
                var data = {};

                axios.post(
                    '/recent',
                    data
                ).then(function (response) {
                    var res = response;
                    var data = res.data;
                    // console.log("data: ", data);
                    vue.recentItems = [];
                    vue.recentItems = vue.recentItems.concat(data);
                    vue.recentModel = 0;//vue.recentItems[0].id;
                }).catch(function (error) {
                    alert(error);
                    // vue.filterDialog = false;
                    // vue.isFilterProgress = false;
                });
            }
        ],
        beforeDestroy() {
            this.chatManager.beforeDestroy();
        }
        // beforeMount(){
        //     this.getWeekData();
        // }
    });

    vue.supporter = new DalSupporter(vue);
    vue.oneClick = new OneClick(vue);
    vue.dalMessage = new DalMessage(vue);
    vue.categoryManager = new CategoryManager(vue, init_category);
    vue.chatManager = new ChatManager(vue);
    vue.changeStatusBarColorOnNativeApp("orange");
    return vue;
}