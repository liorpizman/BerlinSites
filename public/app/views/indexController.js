// index controller
angular.module("userApp")
    .controller("indexController", ['$scope', '$http', '$rootScope', '$window', 'userManagement', '$location', 'poiManagement', '$uibModal', 'localStorageModel', function ($scope, $http, $rootScope, $window, userManagement, $location, poiManagement, $uibModal, localStorageModel) {
        let self = this;

        $rootScope.helloTag = "Guest";
        self.footer = [];
        self.src = "app/views/resources/";

        /* get suitable image size for current window*/
        let parmWidth = (0.2 * $window.innerWidth) + "px";
        let parmHeight = (0.2 * $window.innerHeight) + "px";

        $scope.imgStyle = {
            "width": parmWidth,
            "height": parmHeight
        }

        /* updates favorites' counter */
        $rootScope.countFav = localStorageModel.getLocalStorage("favorites").length;

        /* inits explore section in the page*/
        self.initState = function () {
            $rootScope.showFooter = true;
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
            poiManagement.resetFavorites();
            $rootScope.countFav = 0;
            $rootScope.helloTag = "Guest";
            $location.path('/');
            $location.replace();
        }

        /* method for opening new window for more accurate data about current poi*/
        self.openInfo = function (img) {
            $location.path('/');
            $location.replace();
            poiManagement.setImg(img);
            $rootScope.showFooter = false;
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
            $rootScope.modalImg = img;
            $rootScope.modalPID = pid;
            var modalInstance = $uibModal.open({
                templateUrl: "app/views/pages/modal/modal.html",
                controller: "modalController as mdlCtrl",
                scope: $scope,
                size: ''
            });

        };

    }]);


