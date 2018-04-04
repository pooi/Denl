

function init(init_category) {
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
                transition: 'slide-y-reverse-transition'
            },
            loginData:{

            },
            categoryData: null,
            bottomTab: "home",

            shareSheet: false,
            shareItem: null,
            shares: [
                { img: 'kakao.png', title: 'Kakao' },
                { img: 'facebook.png', title: 'Facebook' },
            ],

            cards_introduce: [
                {
                    title_name: '유태우', title_skill_1: 'Full_Stack developer', title_skill_2: 'Manage Server',
                    src: 'http://img.hani.co.kr/imgdb/resize/2017/0224/00500910_20170224.JPG', flex_md: 3
                },
                {
                    title_name: '정하민',
                    title_skill_1: 'Full_Stack developer',
                    title_skill_2: 'Manage Server',
                    src: 'https://static1.squarespace.com/static/ta/5134cbefe4b0c6fb04df8065/9309/assets/blocks/content/home-summer-2017/featured-customers/keanu-reeves-500w.jpg',
                    flex_md: 3
                },
                {
                    title_name: '유현수',
                    title_skill_1: 'FrontEnd developer',
                    title_skill_2: 'Test UI/UX',
                    src: 'https://static1.squarespace.com/static/ta/5134cbefe4b0c6fb04df8065/9309/assets/blocks/content/home-summer-2017/featured-customers/daniel-arsham-500w.jpg?2',
                    flex_md: 3
                },
                {
                    title_name: '김윤욱',
                    title_skill_1: 'FrontEnd developer',
                    title_skill_2: 'Test UI/UX',
                    src: 'https://static1.squarespace.com/static/ta/5134cbefe4b0c6fb04df8065/9309/assets/blocks/content/home-summer-2017/featured-customers/danny-bowien-500w.jpg?2',
                    flex_md: 3
                },
            ],
            /*######## 최근 등록된 유실물 섹션 ########*/
            cards_item: [
                {
                    category: '상위 > 하위',
                    category2: '하위',
                    date: '17.03.02',
                    tag: '카테고리',
                    src: '../images/picture/test_camera.jpg',
                    flex: 3
                },
                {
                    category: '상위',
                    category2: '하위',
                    date: '17.03.02',
                    tag: 'Favorite road trips',
                    src: 'https://beta.denl.xyz/15209169980379ERwLMa3AK.jpg',
                    flex: 3
                },
                {
                    category: '상위',
                    category2: '하위',
                    date: '17.03.02',
                    tag: 'Best airlines',
                    src: '../images/picture/test_earing.jpg',
                    flex: 3
                },
                {
                    category: '상위',
                    category2: '하위',
                    date: '17.03.02',
                    tag: 'Best airlines',
                    src: '../images/picture/test_ring.jpg',
                    flex: 3
                },
                {
                    category: 'camera',
                    date: '17.03.02',
                    tag: 'Best airlines',
                    src: '../images/picture/test_ring.jpg',
                    flex: 3
                },
                {
                    category: 'camera',
                    date: '17.03.02',
                    tag: 'Best airlines',
                    src: '../images/picture/test_ring.jpg',
                    flex: 3
                },
                {
                    category: 'camera',
                    date: '17.03.02',
                    tag: 'Best airlines',
                    src: '../images/picture/test_ring.jpg',
                    flex: 3
                },
                {
                    category: 'camera',
                    date: '17.03.02',
                    tag: 'Best airlines',
                    src: '../images/picture/test_ring.jpg',
                    flex: 3
                },
                {
                    category: 'camera',
                    date: '17.03.02',
                    tag: 'Best airlines',
                    src: '../images/picture/test_ring.jpg',
                    flex: 3
                },
            ],
            recentItems: [],
            e1: 'home',
            recentModel: 0,
            recentSteps: []

        },
        methods:{
            vueMsToDate: function (date) {
                return msToDate(date);
            },
            vueMsToDateKo: function (date) {
                return msToDateKo(date);
            },
            convertStatus: function (status) {
                return convertStatus(status)
            },
            hastTagsToString: function (itemData) {
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
            },
            reduceString: function (str, len) {
                var newStr = str.substring(0, len);
                if (str.length > 100) {
                    newStr += "...";
                }
                return newStr;
            },
            getCategoryStringFromResult: function (title) {
                title = title.replace(" ", "_");
                var keys = Object.keys(this.categoryData);
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    var subcategories = this.categoryData[key]['subcategory'];
                    for (var j = 0; j < subcategories.length; j++) {
                        var subcategory = subcategories[j];
                        if (subcategory.name === title) {
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
            shareTo: function (title) {

                var shareItem = this.shareItem;
                var url = window.location.origin + "/items/" + shareItem.id;
                var origin = window.location.origin;

                if(title === "Kakao"){

                    var tags = this.hastTagsToString(shareItem);

                    Kakao.Link.sendDefault({
                        objectType: 'feed',
                        content: {
                            title: 'D&L 유실물' + " - " + shareItem.id + "(" + vue.getCategoryStringFromResult(shareItem.subcategory) + ")",
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
            }
        },
        mounted:[
            function(){
                $(window).scroll(
                    function (event) {

                        var scroll = $(window).scrollTop();

                        vue.scrollData.scrollT += (scroll-vue.scrollData.offsetTop);

                        if(vue.scrollData.scrollT > vue.scrollData.delta){
                            vue.scrollData.isShowFabTop = true;
                            vue.scrollData.scrollT = 0;
                        }else if (vue.scrollData.scrollT < -vue.scrollData.delta) {
                            vue.scrollData.isShowFabTop = false;
                            vue.scrollData.scrollT = 0;
                        }

                        vue.scrollData.offsetTop = scroll;

                        if(scroll === 0){
                            vue.scrollData.isShowFabTop = false;
                            vue.scrollData.scrollT = 0;
                            vue.scrollData.offsetTop = 0;
                        }

                    }
                );
            },
            function () {
                this.categoryData = JSON.parse(init_category);
                console.log("category: ", this.categoryData);
            },
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
        ]
    });
    return vue;
}