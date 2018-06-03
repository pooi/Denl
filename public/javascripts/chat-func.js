class ChatManager {

    constructor(loginData, chatData) {
        this.loginData = loginData;
        console.log(loginData);
        this.vue = null;
        this.data = {
            dialog: false,
            message: "",
            sender: "", //check 나중에 로그인 정보 이름으로 수정
            roomnum: "",
            out_roomnum: "",
            // chat_lists: JSON.parse(chatData),
            /*대화 창에서 상대방 메시지 데이터*/
            chat_clicked: null,
            my_name: "",
            menu: false,
            chat_list: true,
            interval: undefined,
            check_chat_lists: null,
            receiver: null
        }
        console.log(chatData);
    }

    set_vue(vue) {
        this.vue = vue;
        console.log("set_vue",this);
    }

    created() {
        var chatManager = this;
        this.data.interval = setInterval(function () {
            chatManager.get_chat()
        }, 3000)
        console.log("fffff", chatManager);
        chat.on("chat connect", function (data) {
            console.log(data);
            var server_obj = {};
            server_obj.roomport = data.room;
            console.log(server_obj.roomport);
            server_obj.sender =  data.name;
            axios({
                method: 'post',
                url: '/chat/update',
                data: server_obj
            }).then(function (response){
                var result_data = response.data;
                console.log(result_data.update_sign);
                console.log("connect", chatManager.data);
                for(var item in chatManager.data.chat_lists){
                    if(chatManager.data.chat_lists[item].roomport == result_data.roomport){
                        chatManager.data.chat_lists[item].msg = result_data.msg;
                        // vue.chat_lists[item].unreadcount = result_data.unreadcount;
                    }else{
                        continue;
                    }
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
        });
        chat.on("chat message", function (data) {
            console.log(data);
            console.log("send", chatManager);
            for(var item in chatManager.data.chat_lists){
                if(chatManager.data.chat_lists[item].roomport == data.roomport){
                    if(chatManager.data.chat_lists[item].msg == null){
                        chatManager.data.chat_lists[item].msg = [];
                        chatManager.data.chat_lists[item].msg.push({message: data.message, sender: data.sender, sendtime: data.sendtime, chread: data.chread});
                    }
                    else{
                        chatManager.data.chat_lists[item].msg.push({message: data.message, sender: data.sender, sendtime: data.sendtime, chread: data.chread});
                    }
                }
            }
            if(chatManager.vue.loginData.user.id == data.sender){
                axios({
                    method: 'post',
                    url: '/chat/send',
                    data: data
                }).then(function (response) {
                    var result_data = response.data;
                    console.log(result_data);
                    if (chatManager.vue.loginData.user.id == data.receiver) {
                        console.log("check message");
                    } else {
                        console.log("i'm not receiver");
                    }
                }).catch(function (err) {
                    if (err.response) {
                        console.log(err.response);
                    }
                    else if (err.request) {
                        console.log(err.request);
                    }
                    else {
                        console.log(err.message);
                    }
                })
            }
            else {
                console.log("receive");
            }
        });
    }

    get_chat() {
        var chatManager = this;
        axios({
            method: 'post',
            url: '/chat/period'
        }).then(function (response){
            var result_data = response.data;
            chatManager.data.chat_lists = result_data;
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

    myGetChat(){
        var chatManager = this;
        console.log(this);
        axios({
            method: 'post',
            url: '/chat/period'
        }).then(function (response){
            var result_data = response.data;
            console.log(chatManager.data);
            chatManager.data.chat_lists = result_data;
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

    ChatSelect(item) {
        this.data.chat_clicked = item.roomport;
        this.data.out_roomnum = this.data.roomnum;
        this.data.roomnum = item.roomport;
        this.data.chat_list = false;
        this.data.receiver = item.id2;
        if(this.data.sender == item.name2){
            this.data.name = item.name1;
        }
        else{
            this.data.name = item.name2;
        }
        console.log(this.data);
    }

    connect() {
        this.data.sender = this.vue.loginData.user.id;
        var chatManager = this;
        chat.emit("chat connect", {
            name: chatManager.data.sender,
            room: chatManager.data.roomnum,
            out_room: chatManager.data.out_roomnum
        });
    }

    send() {
        var chatManager = this;
        if(this.data.message == ""){
            alert("empty messaege");
        }
        else {
            chat.emit("chat message", {
                sender: chatManager.data.sender,
                receiver: chatManager.data.receiver,
                roomport: chatManager.data.roomnum,
                message: chatManager.data.message,
                chread: 1
            });
            chatManager.data.message = "";
        }
    }

}
