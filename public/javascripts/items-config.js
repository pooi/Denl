

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
        ]
    });
    return vue;
}