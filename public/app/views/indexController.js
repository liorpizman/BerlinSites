// index controller
angular.module("userApp")
    .controller("indexController", ['$scope', '$http', '$rootScope', '$window', 'userManagement', '$location', 'poiManagement', '$uibModal', 'localStorageModel', 'setHeadersToken', function ($scope, $http, $rootScope, $window, userManagement, $location, poiManagement, $uibModal, localStorageModel, setHeadersToken) {
        let self = this;

        if (localStorageModel.getLocalStorage("helloTag") == "" || localStorageModel.getLocalStorage("helloTag") == null) {
            $rootScope.helloTag = "Guest";
            localStorageModel.updateLocalStorage("helloTag", $rootScope.helloTag);
        }
        self.footer = [];
        self.src = "app/views/resources/";

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        $rootScope.helloTag = localStorageModel.getLocalStorage("helloTag");
        $rootScope.showFooter = localStorageModel.getLocalStorage("showFooter");
        $rootScope.countFav = localStorageModel.getLocalStorage("countFav");
        $rootScope.modalPoi = localStorageModel.getLocalStorage("modalPoi");
        $rootScope.modalImg = localStorageModel.getLocalStorage("modalImg");
        $rootScope.modalPID = localStorageModel.getLocalStorage("modalPID");
        $rootScope.POIName = localStorageModel.getLocalStorage("POIName");
        $rootScope.PID = localStorageModel.getLocalStorage("PID");
        $rootScope.countViews = localStorageModel.getLocalStorage("countViews");
        $rootScope.url = localStorageModel.getLocalStorage("url");
        $rootScope.secondUrl = localStorageModel.getLocalStorage("secondUrl");
        $rootScope.description = localStorageModel.getLocalStorage("description");
        $rootScope.img = localStorageModel.getLocalStorage("img");
        $rootScope.landmark = localStorageModel.getLocalStorage("landmark");
        $rootScope.totalRating = localStorageModel.getLocalStorage("totalRating");
        $rootScope.isFav = localStorageModel.getLocalStorage("isFav");
        $rootScope.showFirstReview = localStorageModel.getLocalStorage("showFirstReview");
        $rootScope.showSecondReview = localStorageModel.getLocalStorage("showSecondReview");
        $rootScope.category = localStorageModel.getLocalStorage("category");
        $rootScope.userConnected = localStorageModel.getLocalStorage("userConnected");
        $rootScope.modalRating = localStorageModel.getLocalStorage("modalRating");
        $rootScope.openedImg = localStorageModel.getLocalStorage("openedImg");
        $rootScope.favPois = localStorageModel.getLocalStorage("favPois");

        if ($rootScope.userConnected) {
            setHeadersToken.set(localStorageModel.getLocalStorage("token"));
            poiManagement.loadFavorites();
        }
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        /* get suitable image size for current window*/
        let parmWidth = (0.2 * $window.innerWidth) + "px";
        let parmHeight = (0.2 * $window.innerHeight) + "px";

        $scope.imgStyle = {
            "width": parmWidth,
            "height": parmHeight
        }

        /* updates favorites' counter */
        if (localStorageModel.getLocalStorage("favorites") != null) {
            $rootScope.countFav = localStorageModel.getLocalStorage("favorites").length;
        }
        else {
            $rootScope.countFav = 0;
        }
        localStorageModel.updateLocalStorage("countFav", $rootScope.countFav);

        /* inits explore section in the page*/
        self.initState = function () {
            $rootScope.showFooter = true;
            localStorageModel.updateLocalStorage("showFooter", $rootScope.showFooter);
        }

        self.initState();

        $rootScope.$on('$locationChangeSuccess', function (event, newUrl, oldUrl) {

            /* call for get 3 pois for explore section  */
            $http({

                method: 'POST',
                url: 'http://localhost:3000/api/POI/getFooterPOIs',
                data: { "rating": "2" }, // min rating for explore section 
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }

            }).then(function successCallback(response) {
                self.footer = response.data;
                for (let i = 0; i < self.footer.length; i++) {

                    $http({

                        method: 'POST',
                        url: 'http://localhost:3000/api/POI/getImages',
                        headers: {
                            'Content-Type': 'application/json; charset=utf-8'
                        },
                        data: {
                            "imgID": self.footer[i]["img"]
                        }

                    }).then(function successCallback(response) {
                        let res = self.src + response.data[0]["url"] + ".jpg";
                        self.footer[i]["url"] = res;
                    }, function errorCallback(response) {
                        console.log(response);
                    });
                }

            }, function errorCallback(response) {
                console.log(response);
            });

        });




        /* method for logout from user's account*/
        self.logout = function () {
            alert.conf
            userManagement.removeCurrentUser();
            localStorageModel.removeLocalStorage("favorites");
            $rootScope.userConnected = false;
            localStorageModel.updateLocalStorage("userConnected", $rootScope.userConnected);
            poiManagement.resetFavorites();
            $rootScope.countFav = 0;
            localStorageModel.updateLocalStorage("countFav", $rootScope.countFav);
            $rootScope.helloTag = "Guest";
            localStorageModel.updateLocalStorage("helloTag", $rootScope.helloTag);
            $location.path('/');
            $location.replace();
        }

        /* method for opening new window for more accurate data about current poi*/
        self.openInfo = function (img) {
            $location.path('/');
            $location.replace();
            poiManagement.setImg(img);
            $rootScope.showFooter = false;
            localStorageModel.updateLocalStorage("showFooter", $rootScope.showFooter);
            $location.path('/info');
            $location.replace();
        }

        /* method to add new favorite */
        $rootScope.addFavorite = function (pid) {
            poiManagement.addFavorite(pid);
        }

        /* method to open a modal window for review and rating current poi*/
        $rootScope.open = function (name, img, pid) {
            $rootScope.modalPoi = name;
            localStorageModel.updateLocalStorage("modalPoi", $rootScope.modalPoi);
            $rootScope.modalImg = img;
            localStorageModel.updateLocalStorage("modalImg", $rootScope.modalImg);
            $rootScope.modalPID = pid;
            localStorageModel.updateLocalStorage("modalPID", $rootScope.modalPID);
            var modalInstance = $uibModal.open({
                templateUrl: "app/views/pages/modal/modal.html",
                controller: "modalController as mdlCtrl",
                scope: $scope,
                size: ''
            });

        };

        // self.isRefresh = false;

        // $rootScope.$on('$routeChangeStart', function () {
        //     $location.path('/');
        //     $location.replace();
        // });

        // /* method to clear local storage from browser*/
        // $scope.onExit = function () {

        //     if (self.isRefresh == true) {
        //         localStorageModel.removeLocalStorage("helloTag");
        //         localStorageModel.removeLocalStorage("showFooter");
        //         localStorageModel.removeLocalStorage("countFav");
        //         localStorageModel.removeLocalStorage("modalPoi");
        //         localStorageModel.removeLocalStorage("modalImg");
        //         localStorageModel.removeLocalStorage("modalPID");
        //         localStorageModel.removeLocalStorage("POIName");
        //         localStorageModel.removeLocalStorage("PID");
        //         localStorageModel.removeLocalStorage("countViews");
        //         localStorageModel.removeLocalStorage("url");
        //         localStorageModel.removeLocalStorage("secondUrl");
        //         localStorageModel.removeLocalStorage("description");
        //         localStorageModel.removeLocalStorage("img");
        //         localStorageModel.removeLocalStorage("landmark");
        //         localStorageModel.removeLocalStorage("totalRating");
        //         localStorageModel.removeLocalStorage("isFav");
        //         localStorageModel.removeLocalStorage("showFirstReview");
        //         localStorageModel.removeLocalStorage("showSecondReview");
        //         localStorageModel.removeLocalStorage("category");
        //         localStorageModel.removeLocalStorage("userConnected");
        //         localStorageModel.removeLocalStorage("modalRating");
        //         localStorageModel.removeLocalStorage("favorites");
        //         localStorageModel.removeLocalStorage("token");
        //     }
        //     self.isRefresh = false;
        // };

        // $window.onbeforeunload = function (){
        //     $location.path('/');
        //     $location.replace();
        // }


    }]);


