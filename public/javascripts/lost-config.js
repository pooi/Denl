

function init(init_image, init_labels, init_texts, init_logos, init_colors) {
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
            imgSrc: '',
            domEleArray: null,
            isFile: false,
            isProgress: false,
            locationProgress: false,
            isRecognitionProgress: true,
            recognitionData: null,
            category: null,
            tempCategory: null,
            subcategory: null,
            loadingSubCategory: false,
            categories: [
                '가방', '귀금속'
            ],
            subcategories: [],
            categoryData:{
                '가방': [
                    '여성용가방', '남성용가방', '기타가방'
                ],
                '귀금속': [
                    '반지', '목걸이', '시계', '귀걸이'
                ]
            },
            // categoryData: [
            //     {
            //         id: '가방',
            //         data:[
            //             '여성용가방', '남성용가방', '기타가방'
            //         ]
            //     },
            //     {
            //         id: '귀금속',
            //         data:[
            //             '반지', '목걸이', '시계', '귀걸이'
            //         ]
            //     }
            //
            // ],
            hashtags: [],
            description: null,
            labels: [],
            texts: [],
            logos: [],
            colors: [],
            picker: null,
            date: null,
            menu: false,
            isShowMap: false,
            mapUrl: null,
            selectedBuilding: null,
            buildings: [
                '고인돌 잔디밭', '광개토관', '군자관', '다산관', '대양홀', '모짜르트홀', '무방관', '박물관', '세종관',
                '세종이노베이션센터', '아사달 연못', '애지헌', '영실관', '용덕관', '우정당', '율곡관', '이당관', '진관홀',
                '집현관', '충무관', '학생회관', '학술정보원', '행복기숙사'
            ],
            selectedRoom: null,
            rooms: [
                '101', '201', '301', '401'
            ],
            modal: false,
            responseDialog: false,
            resSuccessMsg: "This is temporary message.",
            resSuccessCode: "1",
            responseErrorDialog: false,
            categoryDialog: false
        },
        methods: {
            browseClick: function () {
                var inputFile = document.getElementById('file')
                inputFile.click()
            },
            removeFile: function () {
                this.domEleArray[1] = this.domEleArray[0].clone(true); // 쌔거(0번) -> 복사(1번)
                $('#file').replaceWith(this.domEleArray[1]);
                $("#file").change(function () {
                    vue.imageChange()
                });
                this.isFile = false
            },
            imageChange: function () {
                var inputFile = document.getElementById('file')

                var reader = new FileReader();
                reader.onload = function () {
                    $('#uploaded-img').attr('src', reader.result);
                }
                reader.readAsDataURL(inputFile.files[0]);
                this.isFile = true
            },
            uploadImage: function (e) {
                vue.isProgress = true
                var form = document.getElementById('image-form')
                form.submit()
            },
            removeLogo: function (item) {
                this.logos.splice(this.logos.indexOf(item), 1);
            },
            removeHashtag: function(item){
                this.hashtags.splice(this.hashtags(item), 1);
                // this.hashtags = this.hashtags;
            },
            getCurrentLocation: function () {
                if (navigator.geolocation) {
                    this.locationProgress = true;
                    //위치 정보를 얻기
                    navigator.geolocation.getCurrentPosition(function (pos) {
                        var latitude = pos.coords.latitude;   // 적도의 북쪽 기준 각도인 위도
                        var longitude = pos.coords.longitude; // 그리니치 천문대의 동쪽 기준 각도인 경도
                        var accuracy = pos.coords.accuracy;   // 미터 단위의 정확도

                        vue.isShowMap = true
                        // // initMap(latitude, longitude);
                        //
                        // // 해당 위치의 구글 지도에 대한 정적 이미지 URL을 생성한다.
                        // var map_url = "http://maps.google.com/maps/api/staticmap"
                        //     + "?center=" + latitude + "," + longitude + "&size=640x640&scale=2&sensor=true&&markers=color:red%7Clabel:C%7C" + latitude +"," + longitude;
                        //
                        // // 대략적으로 지도 줌 레벨을 계산하여 설정한다.
                        // var zoomlevel = 17; // 대부분 최대한 확대하여 시작한다.
                        // if (accuracy > 80)  // 위치가 부정확할 경우 축소한다.
                        //     zoomlevel -= Math.round(Math.log(accuracy / 50) / Math.LN2);
                        //
                        // map_url += "&zoom=" + zoomlevel; // 줌 레벨을 URL에 추가한다.
                        //
                        // // API key 추가 ( 키 발급 필요, 키가 없으면 지도 요청시 응답 상태 코드가 403 (Forbidden) 떨어짐.)
                        // map_url += "&key=AIzaSyCEFVgjGWKUi7iA37ful7Fgkle2nGVzfv8";
                        //
                        // // 이제 이미지 객체에 지도를 출력한다.
                        // // image.src = map_url;
                        // vue.mapUrl = map_url;
                        // console.log(map_url);

                        var uluru = {lat: latitude, lng: longitude};
                        var map = new google.maps.Map(document.getElementById('div_map'), {
                            zoom: 17,
                            center: uluru
                        });
                        console.log(map);
                        var marker = new google.maps.Marker({
                            position: uluru,
                            map: map
                        });

                        // alert(pos.coords.latitude + ", " + pos.coords.longitude);
                        // $('#latitude').html(pos.coords.latitude);     // 위도
                        // $('#longitude').html(pos.coords.longitude); // 경도
                        vue.locationProgress = false;

                        // var divMap = document.getElementById('div_map');
                        // divMap.appendChild("")
                    }, function (error) {
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                alert("User denied the request for Geolocation.");
                                break;
                            case error.POSITION_UNAVAILABLE:
                                alert("Location information is unavailable.");
                                break;
                            case error.TIMEOUT:
                                alert("The request to get user location timed out.");
                                break;
                            case error.UNKNOWN_ERROR:
                                alert("An unknown error occurred.");
                                break;
                            default:
                                alert("An unknown error occurred.");
                                break;
                        }
                        vue.locationProgress = false;
                    });
                } else {
                    alert("이 브라우저에서는 Geolocation이 지원되지 않습니다.")
                }
            },
            dateToMs: function (date) {
                var temp = date.split('-');
                var year = parseInt(temp[0]);
                var month = parseInt(temp[1]);
                var day = parseInt(temp[2]);
                var k = Date.parse(date);
                return k;
            },
            msToDate: function (ms) {
                var date = new Date(ms);
                var dd = date.getDate();
                var mm = date.getMonth() + 1; //January is 0!

                var yyyy = date.getFullYear();
                if (dd < 10) {
                    dd = '0' + dd;
                }
                if (mm < 10) {
                    mm = '0' + mm;
                }
                var dateString = yyyy + "-" + mm + "-" + dd;
                return dateString
            },
            listToString: function (arr) {
                var result = "";
                for (var i = 0; i < arr.length; i++) {
                    result += arr[i];
                    if (i + 1 < arr.length) {
                        result += ";";
                    }
                }
                return result;
            },
            changeSubCategories: function () {

                console.log('changeSubCategories');
                if(!vue.loadingSubCategory) {
                    vue.subcategory = null;
                    vue.loadingSubCategory = true;

                    setTimeout(function () {
                        console.log('timeout');
                        if (vue.categoryData.hasOwnProperty(vue.tempCategory)) {
                            var list = vue.categoryData[vue.tempCategory];
                            vue.subcategories = list;
                        }
                        vue.loadingSubCategory = false;
                        clearTimeout();
                    }, 500);
                }

                // alert(vue.tempCategory);
                // if(vue.categoryData.hasOwnProperty(vue.tempCategory)){
                //     var list = vue.categoryData[vue.tempCategory];
                //     vue.subcategories = list;
                // }

            },
            changeSubCategories2: function (item) {

                if (vue.categoryData.hasOwnProperty(item)) {
                    vue.category = item;
                    vue.subcategory = null;
                    var list = vue.categoryData[item];
                    vue.subcategories = list;
                }

                // console.log('changeSubCategories');
                // if(!vue.loadingSubCategory) {
                //     vue.subcategory = null;
                //     vue.loadingSubCategory = true;
                //
                //     setTimeout(function () {
                //         console.log('timeout');
                //         if (vue.categoryData.hasOwnProperty(vue.tempCategory)) {
                //             var list = vue.categoryData[vue.tempCategory];
                //             vue.subcategories = list;
                //         }
                //         vue.loadingSubCategory = false;
                //         clearTimeout();
                //     }, 500);
                // }

                // alert(vue.tempCategory);
                // if(vue.categoryData.hasOwnProperty(vue.tempCategory)){
                //     var list = vue.categoryData[vue.tempCategory];
                //     vue.subcategories = list;
                // }

            },
            submitWithAxios: function () {

                var image = init_image;
                image = image.startsWith('/') ? image : '/' + image;

                var data = {
                    photos: image,
                    discovery_date: this.dateToMs(this.date),
                    tags: this.listToString(this.labels),
                    description: this.listToString(this.texts),
                    brand: this.listToString(this.logos),
                    category: this.category
                };

                axios.post(
                    '/lost',
                    data
                ).then(function (response) {
                    var data = response.data;
                    var insertId = data.insertId;
                    if (insertId != null) {
                        vue.resSuccessMsg = "The item was successfully registered. The registration number is ";
                        vue.resSuccessCode = insertId;
                        vue.responseDialog = true;
                    } else {
                        vue.responseErrorDialog = true;
                    }
                    console.log(response);
                })
                    .catch(function (error) {
                        alert(error);
                    });
            }
        },
        mounted: [
            function () {
                this.domEleArray = [$('#file').clone()];
            },
            // function () {
            //     this.scrollData.isShowFabTop = true;
            //     $(window).scroll(
            //         function (event) {
            //
            //             var scroll = $(window).scrollTop();
            //
            //             vue.scrollData.scrollT += (scroll - vue.scrollData.offsetTop);
            //
            //             if (vue.scrollData.scrollT > vue.scrollData.delta) {
            //                 vue.scrollData.isShowFabTop = false;
            //                 vue.scrollData.scrollT = 0;
            //             } else if (vue.scrollData.scrollT < -vue.scrollData.delta) {
            //                 vue.scrollData.isShowFabTop = true;
            //                 vue.scrollData.scrollT = 0;
            //             }
            //
            //             vue.scrollData.offsetTop = scroll;
            //
            //             if (scroll === 0) {
            //                 vue.scrollData.isShowFabTop = true;
            //                 vue.scrollData.scrollT = 0;
            //                 vue.scrollData.offsetTop = 0;
            //             }
            //             if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
            //                 vue.scrollData.isShowFabTop = true;
            //             }
            //
            //         }
            //     );
            // },
            // function () {
            //
            //     if(init_image === null || init_image === ''){
            //         return;
            //     }
            //
            //     var data = {
            //         image: init_image
            //     };
            //
            //     axios.post(
            //         '/lost/recognition',
            //         data
            //     ).then(function (response) {
            //         var data = response.data;
            //         console.log(data);
            //         vue.isRecognitionProgress = false;
            //         vue.recognitionData = data;
            //         vue.category = data[0].title;
            //         // var insertId = data.insertId;
            //         // if (insertId != null) {
            //         //     vue.resSuccessMsg = "The item was successfully registered. The registration number is ";
            //         //     vue.resSuccessCode = insertId;
            //         //     vue.responseDialog = true;
            //         // } else {
            //         //     vue.responseErrorDialog = true;
            //         // }
            //         // console.log(response);
            //     })
            //         .catch(function (error) {
            //             alert(error);
            //         });
            // },
            function () {
                var text = init_labels;
                var list = text.split(',');
                if (list.length > 0 && (list[0] === '' || list[0] === ' ')) {
                    list.pop()
                }
                this.labels = list
            },
            function () {
                var text = init_texts;
                var list = text.split(',');
                if (list.length > 0 && (list[0] === '' || list[0] === ' ')) {
                    list.pop()
                }
                this.texts = list
            },
            function () {
                var text = init_logos;
                var list = text.split(',');
                if (list.length > 0 && (list[0] === '' || list[0] === ' ')) {
                    list.pop()
                }
                this.logos = list
            },
            function (){
                var color = init_colors;
                this.colors = JSON.parse(color);
            },
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
                this.date = today;
            }
        ]
    });
    return vue;
}