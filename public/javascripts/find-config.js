

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
            isShowComplete: false,
            sortDialog: false,
            sort: "recommendation",
            tempSort: "recommendation",

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
            removeHashtag: function(item){
                this.searchTags.splice(this.searchTags(item), 1);
                // this.hashtags = this.hashtags;
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
                console.log("search");

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
                    category: this.categoryManager === null ? "" : (this.categoryManager.category === null ? "" : this.categoryManager.category),
                    subcategory: this.categoryManager === null ? "" : (this.categoryManager.subcategory === null ? "" : this.categoryManager.subcategory),
                    dcv_filter_item: this.dcv_filter_item,
                    rgt_filter_item: this.rgt_filter_item,
                    building: this.selectedBuilding === null ? "" : this.selectedBuilding,
                    room: this.selectedRoom === null ? "" : this.selectedRoom,
                    tags: this.searchTags,
                    sort: this.sort
                };
                console.log(data);

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
                console.log("load more");

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
                    tags: this.searchTags,
                    sort: this.sort
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
            },
            showComplete: function () {
                alert("hi");
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
            },
            'isShowComplete' : function () {
                vue.isShowComplete()
            }
        }
    });
    vue.supporter = new DalSupporter(vue);
    vue.oneClick = new OneClick(vue);
    vue.dalMessage = new DalMessage(vue);
    vue.categoryManager = new CategoryManager(vue, init_category);
    return vue;
}