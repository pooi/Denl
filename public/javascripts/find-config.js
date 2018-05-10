

function init(init_category) {
    var vue = new Vue({
        el: '#app',
        data: {
            title: 'D&L',
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
            bottomTab: "find",
            todayDate: null,
            // categoryData: null,
            // subcategories: [],
            searchItems: [],
            searchSnackbar : false,

            loadMoreData: {
                loadStep: 3,
                page: 1,
                isLoadMore: false,
                isBtnLoadMore: false,
                numOfItem: 10,
                isLoadFinish: false
            },


            // category: null,
            // subcategory: null,
            // categoryDialog: false,
            // Filter
            dcv_filter_item:{
                isAllday: true,
                startModal: false,
                startDate: null,
                finishModal: false,
                finishDate: null,
                alldayModal: false,
                alldayDate: null
            },
            rgt_filter_item:{
                isAllday: true,
                startModal: false,
                startDate: null,
                finishModal: false,
                finishDate: null,
                alldayModal: false,
                alldayDate: null
            },
            selectedBuilding: null,
            buildings: [
                '고인돌 잔디밭', '광개토관', '군자관', '다산관', '대양홀', '모짜르트홀', '무방관', '박물관', '세종관',
                '세종이노베이션센터', '아사달 연못', '애지헌', '영실관', '용덕관', '우정당', '율곡관', '이당관', '진관홀',
                '집현관', '충무관', '학생회관', '학술정보원', '행복기숙사'
            ],
            selectedRoom: null,
            rooms: [
                '101', '201', '301', '401'
            ],
            searchTags: [],


            shareSheet: false,
            shareItem: null,
            shares: [
                { img: 'kakao.png', title: 'Kakao' },
                { img: 'facebook.png', title: 'Facebook' },
            ]

        },
        methods: {
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

                if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 400 && !this.loadMoreData.isLoadFinish && !this.loadMoreData.isLoadMore && this.loadMoreData.page % this.loadMoreData.loadStep != 0) {
                    // console.log('load more2');
                    this.loadMoreData.isLoadMore = true;
                    this.loadMore();
                }
            },
            // getMsg:function () {
            //     getMsg();
            // },
            // setMsgRead: function (msg) {
            //     setMsgRead(msg);
            // },
            // vueMsToDate: function (date) {
            //     return msToDate(date);
            // },
            // vueMsToDateKo: function (date) {
            //     return msToDateKo(date);
            // },
            removeHashtag: function(item){
                this.searchTags.splice(this.searchTags(item), 1);
                // this.hashtags = this.hashtags;
            },
            // convertStatus: function (status) {
            //     return convertStatus(status)
            // },
            // hashTagsToString: function (itemData) {
            //     var list = [];
            //     for(var i=0; i<itemData.tags.length; i++){
            //         list.push(itemData.tags[i]);
            //     }
            //     for(var i=0; i<itemData.recognition_tags.length; i++){
            //         list.push(itemData.recognition_tags[i]);
            //     }
            //
            //     var tags = "";
            //     for(var i=0; i<Math.min(list.length, 5); i++){
            //         var tag = list[i];
            //         if(tag !== ""){
            //             tags += "#" + tag + " ";
            //         }
            //     }
            //     if(list.length > 5)
            //         tags += "...";
            //
            //     return tags;
            // },
            // reduceString: function (str, len) {
            //     var newStr = str.substring(0, len);
            //     if(str.length > 100){
            //         newStr += "...";
            //     }
            //     return newStr;
            // },
            // isSameCategoryData : function (c1, c2) {
            //     if(c1 === null ||c2 === null)
            //         return false;
            //     return c1.name == c2.name
            // },
            // changeSubCategories: function (key) {
            //
            //     if (vue.categoryData.hasOwnProperty(key)) {
            //         vue.category = vue.categoryData[key];
            //         vue.subcategory = null;
            //         vue.subcategories = vue.category.subcategory;
            //     }
            //
            // },
            // getCategoryBreadcrumbs : function () {
            //     var list = [];
            //     if(this.category !== null){
            //         list.push(this.category.ko);
            //     }
            //     if(this.subcategory !== null){
            //         list.push(this.subcategory.ko);
            //     }
            //     return list;
            // },
            // getCategoryStringFromResult: function (title) {
            //     title = title.replace(" ", "_");
            //     var keys = Object.keys(this.categoryData);
            //     for(var i=0; i<keys.length; i++){
            //         var key = keys[i];
            //         var subcategories = this.categoryData[key]['subcategory'];
            //         for(var j=0; j<subcategories.length; j++){
            //             var subcategory = subcategories[j];
            //             if(subcategory.name === title){
            //                 return this.categoryData[key].ko + " > " + subcategory.ko;
            //                 // this.subcategory = subcategory;
            //                 // this.subcategories = subcategories;
            //                 // this.category = this.categoryData[key];
            //                 // return;
            //             }
            //         }
            //     }
            //     return title;
            // },
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
            resetFilterItem: function () {
                this.categoryManager.category = null;
                this.categoryManager.subcategory = null;
                this.selectedBuilding = null;
                this.selectedRoom = null;
                this.searchTags = [];
                this.dcv_filter_item = {
                    isAllday: true,
                    startModal: false,
                    startDate: null,
                    finishModal: false,
                    finishDate: null,
                    alldayModal: false,
                    alldayDate: null
                };
                this.rgt_filter_item = {
                    isAllday: true,
                    startModal: false,
                    startDate: null,
                    finishModal: false,
                    finishDate: null,
                    alldayModal: false,
                    alldayDate: null
                }
            },
            search: function(showSnackbar){
                // console.log("search");

                this.loadMoreData = {
                    loadStep: 3,
                    page: 1,
                    isLoadMore: false,
                    isBtnLoadMore: false,
                    numOfItem: 10,
                    isLoadFinish: false
                };

                this.searchSnackbar = false;
                var data = {
                    page: this.loadMoreData.page,
                    category: this.categoryManager.category === null ? "" : this.categoryManager.category,
                    subcategory: this.categoryManager.subcategory === null ? "" : this.categoryManager.subcategory,
                    dcv_filter_item: this.dcv_filter_item,
                    rgt_filter_item: this.rgt_filter_item,
                    building: this.selectedBuilding === null ? "" : this.selectedBuilding,
                    room: this.selectedRoom === null ? "" : this.selectedRoom,
                    tags: this.searchTags
                };
                // console.log(data);

                axios.post(
                    '/search',
                    data
                ).then(function (response) {
                    var res = response;
                    var data = res.data;
                    // console.log("data: ", data);
                    vue.searchItems = [];
                    vue.searchItems = vue.searchItems.concat(data);
                    vue.searchSnackbar = showSnackbar;
                }).catch(function (error) {
                    alert(error);
                    // vue.filterDialog = false;
                    // vue.isFilterProgress = false;
                });

            },
            loadMore: function () {
                // console.log("load more");

                this.loadMoreData.isLoadMore = true;
                this.loadMoreData.isBtnLoadMore = false;
                this.loadMoreData.page += 1;

                this.searchSnackbar = false;
                var data = {
                    page: this.loadMoreData.page,
                    category: this.categoryManager.category === null ? "" : this.categoryManager.category,
                    subcategory: this.categoryManager.subcategory === null ? "" : this.categoryManager.subcategory,
                    dcv_filter_item: this.dcv_filter_item,
                    rgt_filter_item: this.rgt_filter_item,
                    building: this.selectedBuilding === null ? "" : this.selectedBuilding,
                    room: this.selectedRoom === null ? "" : this.selectedRoom,
                    tags: this.searchTags
                };

                axios.post(
                    '/search',
                    data
                ).then(function (response) {
                    var res = response;
                    var data = res.data;
                    vue.searchItems = vue.searchItems.concat(data);

                    if(data.length == 0){
                        // console.log("data.length true");
                        vue.loadMoreData.isLoadFinish = true;
                        vue.loadMoreData.isLoadMore = false;
                        vue.loadMoreData.isBtnLoadMore = false;
                    }else{
                        // console.log("data.length false");
                        vue.loadMoreData.isLoadMore = false;
                        vue.loadMoreData.isBtnLoadMore = (vue.loadMoreData.page % vue.loadMoreData.loadStep == 0);
                    }

                    // if(vue.page % vue.loadStep == 0){
                    //     vue.isBtnLoadMore = true;
                    // }else{
                    //     vue.isBtnLoadMore = false;
                    // }
                }).catch(function (error) {
                    alert(error);
                });
            }
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
            function () {
                // this.categoryData = JSON.parse(init_category);
                // console.log("category: ", this.categoryData);
            },
            function () {
                this.search(false);
                // var data = {
                // };
                //
                // axios.post(
                //     '/search',
                //     data
                // ).then(function (response) {
                //     var res = response;
                //     var data = res.data;
                //     console.log("data: ", data);
                //     vue.searchItems = vue.searchItems.concat(data);
                // }).catch(function (error) {
                //     alert(error);
                // });
            }
        ],
        watch: {
            'dcv_filter_item.alldayDate': function () {
                vue.search(true);
            },
            'dcv_filter_item.startDate': function () {
                vue.search(true);
            },
            'dcv_filter_item.finishDate': function () {
                vue.search(true);
            },
            'selectedBuilding' : function () {
                vue.search(true);
            },
            'selectedRoom' : function () {
                vue.search(true);
            },
            'searchTags' : function () {
                vue.search(true);
            }
        }
    });
    vue.supporter = new DalSupporter(vue);
    vue.oneClick = new OneClick(vue);
    vue.dalMessage = new DalMessage(vue);
    vue.categoryManager = new CategoryManager(vue, init_category);
    return vue;
}