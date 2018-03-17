

function init(WFA, WFRQ, L_WFRQ) {
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
            wfa : "",
            wfrq : "",
            l_wfrq : ""
        },
        methods: {

        },
        created : function(){
            this.wfa = JSON.parse(WFA);
            this.wfrq = JSON.parse(WFRQ.replace(/&quot;/g,'"'));
            this.l_wfrq = L_WFRQ;
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
            }
        ]
    });
    return vue;
}