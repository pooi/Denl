

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
            bottomTab: "find",
            todayDate: null,
            categoryData: null,
            searchItems: [],
            searchSnackbar : false,
            category: null,
            subcategory: null,
            categoryDialog: false,
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
            }

        },
        methods: {
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
            isSameCategoryData : function (c1, c2) {
                if(c1 === null ||c2 === null)
                    return false;
                return c1.name == c2.name
            },
            changeSubCategories: function (key) {

                if (vue.categoryData.hasOwnProperty(key)) {
                    vue.category = vue.categoryData[key];
                    vue.subcategory = null;
                    vue.subcategories = vue.category.subcategory;
                }

            },
            getCategoryBreadcrumbs : function () {
                var list = [];
                if(this.category !== null){
                    list.push(this.category.ko);
                }
                if(this.subcategory !== null){
                    list.push(this.subcategory.ko);
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
            resetFilterItem: function () {
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
                this.searchSnackbar = false;
                var data = {
                    category: this.category === null ? "" : this.category,
                    subcategory: this.subcategory === null ? "" : this.subcategory,
                    dcv_filter_item: this.dcv_filter_item,
                    rgt_filter_item: this.rgt_filter_item
                };
                console.log(data);

                axios.post(
                    '/search',
                    data
                ).then(function (response) {
                    var res = response;
                    var data = res.data;
                    console.log("data: ", data);
                    vue.searchItems = [];
                    vue.searchItems = vue.searchItems.concat(data);
                    vue.searchSnackbar = showSnackbar;
                }).catch(function (error) {
                    alert(error);
                    // vue.filterDialog = false;
                    // vue.isFilterProgress = false;
                });

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
                this.categoryData = JSON.parse(init_category);
                console.log("category: ", this.categoryData);
            },
            function () {
                this.search(false);
                // var data = {
                // };
                //
                // axios.post(
                //     '/search',
                //     data
                // ).then(function (response) {
                //     var res = response;
                //     var data = res.data;
                //     console.log("data: ", data);
                //     vue.searchItems = vue.searchItems.concat(data);
                // }).catch(function (error) {
                //     alert(error);
                // });
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
            }
        }
    });
    return vue;
}