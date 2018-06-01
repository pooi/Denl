

function init(init_data, init_category) {

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
            viewer: null,
            isHit: false,
            bottomTab: "find",
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
            // categoryData: null,
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
            requestReceiveDialog: false,
            requestEmail: null,
            requestRecentID: null,
            rgtEmailDialog: false,
            rgtEmailSuccessDialog: false,
            emailRules: [
                v => {
                    return !!v || '잘못된 이메일 주소입니다.'
                },
                v => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || '잘못된 이메일 주소입니다.'
            ],
            requestReceiveSuccessDialog: false,
            requestReceiveCancelSuccessDialog: false,
            confirmReceiveSuccessDialog: false,
            changeStatusDialog: false,
            successStatusChangeDialog: false,

            selectedRequest: null
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
            },
            reloadPage: function () {
                location.reload();
            },
            getCurrentUrl: function () {
                return window.location.href;
            },
            getHastTags: function () {
                var list = [];
                for(var i=0; i<this.itemData.tags.length; i++){
                    list.push(this.itemData.tags[i]);
                }
                for(var i=0; i<this.itemData.recognition_tags.length; i++){
                    list.push(this.itemData.recognition_tags[i]);
                }
                return list;
            },
            shareTo: function (title) {

                var url = window.location.href;
                var origin = window.location.origin;

                var shareItem = this.itemData;
                if(title === "Kakao"){

                    var tags = "";
                    var tagList = this.getHastTags();
                    for(var i=0; i<Math.min(tagList.length, 5); i++){
                        var tag = tagList[i];
                        if(tag !== ""){
                            tags += "#" + tag + " ";
                        }
                    }
                    if(tagList.length > 5)
                        tags += "...";

                    // alert(tags);

                    // alert(Kakao.Link.sendDefault);

                    Kakao.Link.sendDefault({
                        objectType: 'feed',
                        content: {
                            title: 'D&L 유실물' + " - " + shareItem.id + "(" + vue.categoryManager.getCategoryStringFromResult(vue.itemData.subcategory) + ")",
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
                this.sheet = false;

            },
            showRgtEmailDialog: function (req) {

                if(req.email === null) {
                    this.requestEmail = this.loginData.user.email;
                }else{
                    this.requestEmail = req.email;
                }
                this.requestRecentID = req.id;
                this.rgtEmailDialog = true;
            },
            sendRequest: function () {
                if(this.loginData.user === null){
                    this.loginErrorDialog = true;
                    return;
                }

                var data = {
                    lost_id: this.itemData.id,
                    user_id: this.loginData.user.id,
                    rgt_date: getTodayMs()
                };

                axios.post(
                    '/items/request',
                    data
                ).then(function (response) {
                    var data = response.data;
                    var insertId = data.insertId;
                    if (insertId != null) {
                        vue.getRequestUser();
                        vue.requestEmail = vue.loginData.user.email;
                        vue.requestRecentID = insertId;
                        vue.requestSuccessDialog = true;
                    } else {
                        vue.requestErrorDialog = true;
                    }
                    // console.log(response);
                })
                    .catch(function (error) {
                        alert(error);
                    });
            },
            rgtRequestEmail: function () {

                var email = vue.$refs['requestEmail'];

                if(!email.valid){
                    email.validate(true);
                    return
                }

                var data = {
                    request_id: this.requestRecentID,
                    email: this.requestEmail
                };
                axios.post(
                    '/items/rgtEmail',
                    data
                ).then(function (response) {
                    var data = response.data;
                    var affectedRows = data.affectedRows;
                    if (affectedRows > 0) {
                        vue.getRequestUser();
                        vue.requestSuccessDialog = false;
                        vue.rgtEmailDialog = false;
                        vue.rgtEmailSuccessDialog = true;
                        vue.requestEmail= null;
                        vue.requestRecentID= null;
                    } else {
                        vue.requestErrorDialog = true;
                    }
                }).catch(function (error) {
                    alert(error);
                });
            },
            getRequestUser: function () {
                var data = {
                    lost_id: this.itemData.id
                };

                axios.post(
                    '/items/requestList',
                    data
                ).then(function (response) {
                    var data = response.data;
                    console.log("requestList: ", data);
                    vue.requestList = data;
                    // var insertId = data.insertId;
                    // if (insertId != null) {
                    //     vue.requestSuccessDialog = true;
                    // } else {
                    //     vue.requestErrorDialog = true;
                    // }
                    // console.log(response);
                })
                    .catch(function (error) {
                        alert(error);
                    });
            },
            isAlreadyRequest: function () {
                if(this.loginData.user === null)
                    return false;

                for(var i=0; i<this.requestList.length; i++){
                    if(this.requestList[i].user.id === this.loginData.user.id)
                        return true;
                }
                return false;
            },
            isMyRequest: function () {
                if(this.loginData.user === null)
                    return false;

                return this.loginData.user.id === this.itemData.rgt_user.id;
            },
            removeRequest: function (request_id) {

                var chk = confirm("요청을 취소하시겠습니까?");
                if(!chk)
                    return;

                var data = {
                    lost_id: this.itemData.id,
                    request_id: request_id
                };

                axios.post(
                    '/items/removeRequest',
                    data
                ).then(function (response) {
                    var data = response.data;
                    console.log("data: ", data);
                    var affectedRows = data.affectedRows;
                    if (affectedRows > 0) {
                        // vue.requestSuccessDialog = true;
                        vue.getRequestUser();
                        vue.requestCancelDialog = true;
                    } else {
                        vue.requestCancelErrorDialog = true;
                    }
                })
                    .catch(function (error) {
                        alert(error);
                        vue.requestCancelErrorDialog = true;
                    });
            },
            requestReceive: function () {
                var data = {
                    lost_id: this.itemData.id,
                    user_id: this.selectedRequest.user.id
                };

                axios.post(
                    '/items/requestReceive',
                    data
                ).then(function (response) {
                    var data = response.data;
                    var insertId = data.insertId;
                    if (insertId != null) {
                        vue.requestReceiveSuccessDialog = true;
                    } else {
                        vue.requestErrorDialog = true;
                    }
                    // console.log(response);
                })
                    .catch(function (error) {
                        alert(error);
                    });
            },
            cancelRequestReceive: function () {
                var data = {
                    lost_id: this.itemData.id
                };

                axios.post(
                    '/items/cancelRequestReceive',
                    data
                ).then(function (response) {
                    var data = response.data;
                    var insertId = data.insertId;
                    if (insertId != null) {
                        vue.requestReceiveCancelSuccessDialog = true;
                    } else {
                        vue.requestErrorDialog = true;
                    }
                    // console.log(response);
                })
                    .catch(function (error) {
                        alert(error);
                    });
            },
            confirmReceive: function () {
                var check = confirm("수령 확인하겠습니까? 이 작업은 되돌릴 수 없습니다.");
                if(check){

                    var data = {
                        lost_id: this.itemData.id,
                        rcv_date: getTodayMs()
                    };

                    axios.post(
                        '/items/confirmReceive',
                        data
                    ).then(function (response) {
                        var data = response.data;
                        var insertId = data.insertId;
                        if (insertId != null) {
                            vue.confirmReceiveSuccessDialog = true;
                        } else {
                            vue.requestErrorDialog = true;
                        }
                        // console.log(response);
                    })
                        .catch(function (error) {
                            alert(error);
                        });

                }
            },
            changeP2PtoWFA: function () {
                var data = {
                    lost_id: this.itemData.id
                };

                axios.post(
                    '/items/changeP2PtoWFA',
                    data
                ).then(function (response) {
                    var data = response.data;
                    var insertId = data.insertId;
                    if (insertId != null) {
                        vue.successStatusChangeDialog = true;
                    } else {
                        vue.requestErrorDialog = true;
                    }
                    // console.log(response);
                })
                    .catch(function (error) {
                        alert(error);
                    });
            },
            contactUser: function (id) {

                if(this.loginData.user === null){
                    this.loginErrorDialog = true;
                    return;
                }

                alert("TODO");
            },
            acceptItem: function () {
                var data = {
                    lost_id: this.itemData.id
                };

                axios.post(
                    '/items/acceptItem',
                    data
                ).then(function (response) {
                    var data = response.data;
                    var insertId = data.insertId;
                    if (insertId != null) {
                        vue.reloadPage();
                    } else {
                        vue.requestErrorDialog = true;
                    }
                    // console.log(response);
                })
                    .catch(function (error) {
                        alert(error);
                    });
            },
            viewedImage: function () {
                if(!this.isHit) {
                    var data = {
                        id: this.itemData.id
                    };
                    axios.post(
                        '/items/hit',
                        data
                    ).then(function (response) {
                        vue.isHit = true;
                        // console.log(response);
                    }).catch(function (error) {
                        // alert(error);
                    });
                    this.isHit = true;
                }
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
                var json = init_data;
                // console.log("tt");
                // console.log(json);
                this.itemData = JSON.parse(json);
                console.log(this.itemData);
            },
            function () {
                this.getRequestUser();
            },
            function () {

            }
        ]
    });
    vue.supporter = new DalSupporter(vue);
    vue.oneClick = new OneClick(vue);
    vue.dalMessage = new DalMessage(vue);
    vue.categoryManager = new CategoryManager(vue, init_category);
    return vue;
}