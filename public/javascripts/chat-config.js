function init() {
    Vue.use(VueObserveVisibility);
    Vue.directive('observe-visibility', VueObserveVisibility.ObserveVisibility);

    var vue = new Vue({
        el: '#app',
        data: {
            dialog: false,
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
            msgData:{},
            todayDate: null,
            name: "",
            room: "",
            talk: "",
            chatData: []
        },
        created() {
            chat.on("user out", function (data) {
                alert(data);
            });
            chat.on("chat message", function (data) {
                console.log(data);
                vue.chatData.push(data);
            });
            chat.on("user join", function (data) {
                console.log(data);
            });
        },
        methods: {
            connect: function() {
                chat.emit("user join", {
                    name: this.name,
                    room: this.room,
                });
            },
            send: function () {
                chat.emit("chat message", {
                    name: this.name,
                    room: this.room,
                    msg: this.talk
                });
                this.talk = "";
            },
            out: function () {
                chat.emit("user out", {
                    name: this.name,
                    room: this.room
                });
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
                return newArray;
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
        watch:{

        }
    });
    vue.oneClick = new OneClick(vue);
    vue.dalMessage = new DalMessage(vue);
    return vue;
}