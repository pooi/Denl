class ChatManager {

    constructor(vue, chatData) {
        this.vue = vue;
        this.data = {
            dialog: false,
            message: "",
            sender: "", //check 나중에 로그인 정보 이름으로 수정
            roomnum: "",
            out_roomnum: "",
            chat_lists: JSON.parse(chatData),
            /*대화 창에서 상대방 메시지 데이터*/
            chat_clicked: null,
            my_name: "",
            menu: false,
            chat_list: true,
            interval: undefined,
            check_chat_lists: null,
            receiver: null
        }

    }

    created() {
        this.data.interval = setInterval(this.get_chat, 3000);
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
                let result_data = response.data;
                console.log(result_data.update_sign);
                for(var item in ChatManager.data.chat_lists){
                    if(ChatManager.data.chat_lists[item].roomport == result_data.roomport){
                        ChatManager.data.chat_lists[item].msg = result_data.msg;
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
            for(item in this.data.chat_lists){
                if(this.data.chat_lists[item].roomport == data.roomport){
                    if(this.data.chat_lists[item].msg == null){
                        this.data.chat_lists[item].msg = [];
                        this.data.chat_lists[item].msg.push({message: data.message, sender: data.sender, sendtime: data.sendtime, chread: data.chread});
                    }
                    else{
                        this.data.chat_lists[item].msg.push({message: data.message, sender: data.sender, sendtime: data.sendtime, chread: data.chread});
                    }
                }
            }
            if(this.vue.loginData.user.id == data.sender){
                axios({
                    method: 'post',
                    url: '/chat/send',
                    data: data
                }).then(function (response) {
                    var result_data = response.data;
                    console.log(result_data);
                    if (ChatManager.vue.loginData.user.id == data.receiver) {
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

    interval() {
        this.data.interval = setInterval(this.get_chat, 3000);
    }

    get_chat() {
        axios({
            method: 'post',
            url: '/chat/period'
        }).then(function (response){
            let result_data = response.data;
            console.log("period update");
            this.data.chat_lists = result_data;
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

    chat_message() {
        chat.on("chat message", function (data) {
            console.log(data);
            for(item in this.data.chat_lists){
                if(this.data.chat_lists[item].roomport == data.roomport){
                    if(this.data.chat_lists[item].msg == null){
                        this.data.chat_lists[item].msg = [];
                        this.data.chat_lists[item].msg.push({message: data.message, sender: data.sender, sendtime: data.sendtime, chread: data.chread});
                    }
                    else{
                        this.data.chat_lists[item].msg.push({message: data.message, sender: data.sender, sendtime: data.sendtime, chread: data.chread});
                    }
                }
            }
            if(this.vue.loginData.user.id == data.sender){
                axios({
                    method: 'post',
                    url: '/chat/send',
                    data: data
                }).then(function (response) {
                    var result_data = response.data;
                    console.log(result_data);
                    if (ChatManager.vue.loginData.user.id == data.receiver) {
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

    chat_connect() {
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
                let result_data = response.data;
                console.log(result_data.update_sign);
                for(var item in ChatManager.data.chat_lists){
                    if(ChatManager.data.chat_lists[item].roomport == result_data.roomport){
                        ChatManager.data.chat_lists[item].msg = result_data.msg;
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
    }

    connect() {
        this.data.sender = this.vue.loginData.user.id;
        chat.emit("chat connect", {
            name: this.data.sender,
            room: this.data.roomnum,
            out_room: this.data.out_roomnum
        });
    }

    send() {
        if(this.data.message == ""){
            alert("empty messaege");
        }
        else {
            chat.emit("chat message", {
                sender: this.data.sender,
                receiver: this.data.receiver,
                roomport: this.data.roomnum,
                message: this.data.message,
                chread: 1
            });
            this.data.message = "";
        }
    }

}
