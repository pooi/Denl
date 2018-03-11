

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
            todayDate: null,
            itemData: null,
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
            ]
        },
        methods: {
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
            getCategoryBreadcrumbs : function () {

                var list = [];
                if(this.itemData.subcategory !== null){
                    var title = this.itemData.subcategory;
                    title = title.replace(" ", "_");
                    var keys = Object.keys(this.categoryData);
                    for(var i=0; i<keys.length; i++){
                        var key = keys[i];
                        var subcategories = this.categoryData[key]['subcategory'];
                        for(var j=0; j<subcategories.length; j++){
                            var subcategory = subcategories[j];
                            if(subcategory.name === title){
                                // this.category = this.categoryData[key];
                                // this.subcategory = subcategory;
                                list.push(this.categoryData[key].ko);
                                list.push(subcategory.ko);
                                return list;
                            }
                        }
                    }
                }
                return list;
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

                    Kakao.Link.sendDefault({
                        objectType: 'feed',
                        content: {
                            title: 'D&L 유실물' + " - " + shareItem.id + "(" + vue.getCategoryStringFromResult(vue.itemData.subcategory) + ")",
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