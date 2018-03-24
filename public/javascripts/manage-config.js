

function init(WFA, WFRQ, init_category) {
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
            WFAs : null,
            WFRQs : null
        },
        methods: {
            hastTagsToString: function (itemData) {
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
            }
        },
        created : function(){
            this.WFAs = JSON.parse(WFA);
            this.WFRQs = JSON.parse(WFRQ);
            // wfas.forEach(function (lost){
            //     this.WFAs.push(lost)
            // })
            // var wfrqs = JSON.parse(WFRQ);
            // wfrqs.forEach(function (lost){
            //     this.WFRQs.push(lost)
            // })
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
                this.itemData = JSON.parse(json);
                console.log(this.itemData);
            },
            function () {
                this.categoryData = JSON.parse(init_category);
                console.log("category: ", this.categoryData);
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
        ]
    });
    return vue;
}