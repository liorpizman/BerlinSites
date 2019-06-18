// about controller
angular.module("userApp")
    .controller("homeController", ['$scope', '$http', '$location', 'poiManagement', '$rootScope', '$uibModal', '$rootScope', function ($scope, $http, $location, poiManagement, $rootScope, $uibModal, $rootScope) {

        let self = this;
        self.src = "app/views/resources/";
        $scope.imgs = [];
        $scope.savedImgs = [];
        $scope.showFirst = false;
        $scope.showSecond = false;

        /* method to change current location to POI*/
        self.jumpToPoi = function () {
            $location.path('/POI');
            $location.replace();
        }

        /* updates explore section on load*/
        self.initState = function () {
            $rootScope.showFooter = true;
        }

        self.initState();

        $scope.imgStyle = {
            "width": "280px",
            "height": "160px"
        };

        /* method for opening new window for more accurate data about current poi*/
        self.openInfo = function (img) {
            poiManagement.setImg(img);
            $rootScope.showFooter = false;
            $location.path('/info');
            $location.replace();
        }

        /* method to change current location to register*/
        $scope.SignUpPage = function () {
            $location.path('/register');
            $location.replace();
        }

        /* method to change current location to login*/
        $scope.LoginPage = function () {
            $location.path('/login');
            $location.replace();
        }

        /* method to add new favorite */
        self.addFavorite = function (pid) {
            poiManagement.addFavorite(pid, 'home');
            self.POIS = poiManagement.POIS;
        }

        /* method to remove favorite */
        self.removeFavorite = function (pid) {
            poiManagement.removeFavorite(pid, 'home');
            self.POIS = poiManagement.POIS;
        }

        /* method to set suitable categories for user */
        self.setCategory = function (ctgr) {
            if (ctgr == '0') {
                return "Museum";
            } else if (ctgr == '1') {
                return "Club";
            } else if (ctgr == '2') {
                return "Park";
            } else if (ctgr == '3') {
                return "Restaurant";
            } else {
                return "Site";
            }
        };


        /* loading two recommended pois for home page */
        $http({

            method: 'GET',
            url: 'http://localhost:3000/api/reg/POI/getRecommended',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }

        }).then(function successCallback(response) {
            if (response.data['message'] == 'Something is worng.....') {
                //console.log('The user is not connected to system.');
                return;
            }
            else {
                $scope.firstName = response.data[0]["POIName"];
                $scope.firstCtg = self.setCategory(response.data[0]["category"]);

                $scope.secondName = response.data[1]["POIName"];
                $scope.secondCtg = self.setCategory(response.data[1]["category"]);

                $scope.firstObj = response.data[0];
                $scope.secondObj = response.data[1];

                for (let i = 0; i < response.data.length; i++) {

                    $http({

                        method: 'POST',
                        url: 'http://localhost:3000/api/POI/getImages',
                        headers: {
                            'Content-Type': 'application/json; charset=utf-8'
                        },
                        data: {
                            "imgID": response.data[i]["img"]
                        }

                    }).then(function successCallback(response) {
                        $scope.imgs[i] = self.src + response.data[0]["url"] + ".jpg";
                        if (i == 0) {
                            $scope.firstObj["url"] = $scope.imgs[0];
                        } else if (i == 1) {
                            $scope.secondObj["url"] = $scope.imgs[1];
                        }

                    }, function errorCallback(response) {
                        console.log(response);
                    });
                }

            }

        }, function errorCallback(response) {
            console.log(response);
        });


        /* loading two las saved pois of current user for home page */
        $http({

            method: 'GET',
            url: 'http://localhost:3000/api/reg/POI/getLastSaved',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }

        }).then(function successCallback(response) {
            if (response.data['message'] == 'Something is worng.....') {
                return;
            }
            else {
                let checker = 0;
                if (response.data.length == 0) {
                    $scope.message = 'There are no recently saved!';
                    $scope.showFirst = false;
                    $scope.showSecond = false;
                }
                else if (response.data.length == 1) {
                    checker = 1;
                    $scope.message = 'You have saved only one!';
                    $scope.firstSaved = response.data[0]["POIName"];
                    $scope.firstSavedCtg = self.setCategory(response.data[0]["category"]);
                    $scope.showFirst = true;
                    $scope.showSecond = false;
                    $scope.firstSavedObj = response.data[0];
                }
                else {
                    checker = 2;
                    $scope.message = '';
                    $scope.firstSaved = response.data[0]["POIName"];
                    $scope.firstSavedCtg = self.setCategory(response.data[0]["category"]);

                    $scope.secondSaved = response.data[1]["POIName"];
                    $scope.secondSavedCtg = self.setCategory(response.data[1]["category"]);

                    $scope.showFirst = true;
                    $scope.showSecond = true;

                    $scope.firstSavedObj = response.data[0];
                    $scope.secondSavedObj = response.data[1];

                }
                for (let i = 0; i < response.data.length; i++) {

                    $http({

                        method: 'POST',
                        url: 'http://localhost:3000/api/POI/getImages',
                        headers: {
                            'Content-Type': 'application/json; charset=utf-8'
                        },
                        data: {
                            "imgID": response.data[i]["img"]
                        }

                    }).then(function successCallback(res) {
                        $scope.savedImgs[i] = self.src + res.data[0]["url"] + ".jpg";
                        if (i == 0) {
                            $scope.firstSavedObj["url"] = $scope.savedImgs[0];
                        } else if (i == 1) {
                            $scope.secondSavedObj["url"] = $scope.savedImgs[1];
                        }

                    }, function errorCallback(res) {
                        console.log(res);
                    });
                }
            }

        }, function errorCallback(response) {
            console.log(response);
        });

        /* method to open a modal window for review and rating current poi*/
        $scope.open = function (name, img, pid) {
            $rootScope.modalPoi = name;
            $rootScope.modalImg = img;
            $rootScope.modalPID = pid;
            var modalInstance = $uibModal.open({
                templateUrl: "app/views/pages/modal/modal.html",
                controller: "modalController as mdlCtrl",
                scope: $scope,
                size: ''
            });
        }

    }]);
