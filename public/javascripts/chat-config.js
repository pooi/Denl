function init() {
    Vue.use(VueObserveVisibility);
    Vue.directive('observe-visibility', VueObserveVisibility.ObserveVisibility);

    var vue = new Vue({
        el: '#app',
        data: {
            title_login: 'Login',
            dialog: false,
            title: 'D&L chat',
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
            chatData: [],
            //현수파트
            dialog: false,
            message: "",
            chat_lists: [
                {
                    name : "유태우",
                    msg : [
                        { sentence: "연락드립니다", stamp: "유태우"},
                        { sentence: "연락드", stamp: "정하민"},
                        { sentence: "연락드립니", stamp: "유태우"}
                    ],
                    avatar : "/images/person.png"
                },
                {
                    name: "유현수",
                    msg: [
                        { sentence: "연락드립니다", stamp: "유현수"},
                        { sentence: "연락드", stamp: "정하민"},
                        { sentence: "연락드립니", stamp: "유현수"}
                    ],
                    avatar : "/images/person.png"
                }
            ],
            /*대화 창에서 상대방 메시지 데이터*/
            chat_clicked : null,
            my_name : "",
            receiveuser : ""
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
            //현수 파트
            loginSejong: function () {
                var id = document.getElementsByName('loginId');
                var pw = document.getElementsByName('loginPw');
                loginSejong(id, pw);
            },
            ChatSelect: function (item) {
                var list = [];
                var tmp = [];
                this.chat_clicked = item.roomname;
            },
            connect: function() {
                chat.emit("user join", {
                    name: this.loginData.user.name,
                    room: "aaa"
                });
            },
            send: function () {
                if(this.loginData.user != null){
                    chat.emit("chat message", {
                        name: this.loginData.user.name,
                        room: this.room,
                        msg: this.talk
                    });
                    this.talk = "";
                }else{
                    alert("please login");
                }
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
            //송신자 이름 설정
            function() {
                this.my_name = this.loginData.user.name
            }
        ],
        watch : {
            chat_clicked: function(val){
                this.receiveuser = val;
            }
        }
    });
    vue.oneClick = new OneClick(vue);
    vue.dalMessage = new DalMessage(vue);
    return vue;
}