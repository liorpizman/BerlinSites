// info controller
angular.module("userApp")
    .controller("infoController", ['$scope', '$http', '$rootScope', '$window', 'userManagement', '$location', 'poiManagement', '$uibModal', '$q', 'localStorageModel', function ($scope, $http, $rootScope, $window, userManagement, $location, poiManagement, $uibModal, $q ,localStorageModel) {

        let self = this;

        /* method to show current poi's location on the map --- bonus*/
        $scope.saveToken = $http.defaults.headers.common;
        $http.defaults.headers.common = '';
        $http.get('https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine=' + $rootScope.POIName + ", Berlin")
            .then(function (response) {
                var map = L.map('mapid').setView([response.data.candidates[0].location.y, response.data.candidates[0].location.x], 13);

                map.setZoom(13);
                L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
                    maxZoom: 25,
                    id: 'mapbox.streets'
                }).addTo(map);

                L.marker([response.data.candidates[0].location.y, response.data.candidates[0].location.x]).addTo(map);

            }, function (res) {
                console.log(res);
            });

        $http.defaults.headers.common = $scope.saveToken;

        /* function running on page's load for update all info about current poi*/
        $scope.onload = function () {
            if ($rootScope.openedImg) {
                self.currImg = $rootScope.openedImg;

                $rootScope.PID = self.currImg["PID"];
                localStorageModel.updateLocalStorage("PID", $rootScope.PID);
                poiManagement.updateCountViews($rootScope.PID);
                $rootScope.countViews = self.currImg["countViews"];
                localStorageModel.updateLocalStorage("countViews", $rootScope.countViews);

                $http({

                    method: 'PUT',
                    url: 'http://localhost:3000/api/POI/updateCountViews',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                    },
                    data: {
                        "PID": $rootScope.PID
                    }

                }).then(function successCallback(response) {
                }, function errorCallback(response) {
                    console.log(response);
                });

                $rootScope.POIName = self.currImg["POIName"];
                localStorageModel.updateLocalStorage("POIName", $rootScope.POIName);
                $rootScope.url = self.currImg["url"];
                localStorageModel.updateLocalStorage("url", $rootScope.url);
                $rootScope.secondUrl = self.currImg["url"].substring(0, self.currImg["url"].indexOf(".jpg")) + 'a' + '.jpg';
                localStorageModel.updateLocalStorage("secondUrl", $rootScope.secondUrl);
                $rootScope.description = self.currImg["description"] + '';
                localStorageModel.updateLocalStorage("description", $rootScope.description);
                $rootScope.img = self.currImg["img"];
                localStorageModel.updateLocalStorage("img", $rootScope.img);
                $rootScope.landmark = self.currImg["landmark"];
                localStorageModel.updateLocalStorage("landmark", $rootScope.landmark);
                $rootScope.totalRating = ((self.currImg["totalRating"] / 5) * 100 ).toFixed(2);
                localStorageModel.updateLocalStorage("totalRating", $rootScope.totalRating);
                $rootScope.isFav = self.currImg["fav"];
                localStorageModel.updateLocalStorage("isFav", $rootScope.isFav);
            }

            $rootScope.showFirstReview = false;
            localStorageModel.updateLocalStorage("showFirstReview", $rootScope.showFirstReview);
            $rootScope.showSecondReview = false;
            localStorageModel.updateLocalStorage("showSecondReview", $rootScope.showSecondReview);

            let ctgr = self.currImg["category"];
            if (ctgr == '0') {
                self.category = "Museum";
                $rootScope.category = "Museum";
                localStorageModel.updateLocalStorage("category", $rootScope.category);
            } else if (ctgr == '1') {
                self.category = "Club";
                $rootScope.category = "Club";
                localStorageModel.updateLocalStorage("category", $rootScope.category);
            } else if (ctgr == '2') {
                self.category = "Park";
                $rootScope.category = "Park";
                localStorageModel.updateLocalStorage("category", $rootScope.category);
            } else if (ctgr == '3') {
                self.category = "Restaurant";
                $rootScope.category = "Restaurant";
                localStorageModel.updateLocalStorage("category", $rootScope.category);
            } else {
                self.category = "Site";
                $rootScope.category = "Site";
                localStorageModel.updateLocalStorage("category", $rootScope.category);
            }

            $http({

                method: 'GET',
                url: 'http://localhost:3000/api/POI/latestReviews/' + $rootScope.PID,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }

            }).then(function successCallback(response) {
                if (response.data["message"] == 'There is no Review for this POI') {
                    $rootScope.showFirstReview = false;
                    localStorageModel.updateLocalStorage("showFirstReview", $rootScope.showFirstReview);
                    $rootScope.showSecondReview = false;
                    localStorageModel.updateLocalStorage("showSecondReview", $rootScope.showSecondReview);
                }
                else if (response.data["message"] == 'There is one Review for this POI') {
                    $rootScope.showFirstReview = true;
                    localStorageModel.updateLocalStorage("showFirstReview", $rootScope.showFirstReview);
                    $scope.firstReview = response.data[0]["review"];
                    $scope.firstUser = response.data[0]["UserName"];
                    $scope.firstDate = response.data[0]["DateReviewed"];
                    $rootScope.showSecondReview = false;
                    localStorageModel.updateLocalStorage("showSecondReview", $rootScope.showSecondReview);
                }
                else if ($rootScope.PID) {
                    $rootScope.showFirstReview = true;
                    localStorageModel.updateLocalStorage("showFirstReview", $rootScope.showFirstReview);
                    $rootScope.showSecondReview = true;
                    localStorageModel.updateLocalStorage("showSecondReview", $rootScope.showSecondReview);

                    self.firstReview = response.data[0]["review"];
                    self.firstUser = response.data[0]["UserName"];

                    self.firstDate = response.data[0]["DateReviewed"];

                    self.secondReview = response.data[1]["review"];
                    self.secondUser = response.data[1]["UserName"];
                    self.secondDate = response.data[1]["DateReviewed"];
                }


            }, function errorCallback(response) {
                console.log(response);
            });

        }
        $scope.onload();

        /* get suitable image size for current window*/
        let parmWidth = (0.45 * $window.innerWidth) + "px";
        let parmHeight = (0.5 * $window.innerHeight) + "px";

        $scope.imgStyle = {
            "width": parmWidth,
            "height": parmHeight
        }

        /* method to change location to POI */
        self.back = function () {
            $location.path('/POI');
            $location.replace();
            $rootScope.showFooter = true;
            localStorageModel.updateLocalStorage("showFooter", $rootScope.showFooter);
        }

        /* method to add new favorite */
        self.addFavorite = function (pid) {
            poiManagement.addFavorite(pid, '/info');
            $rootScope.isFav = !$rootScope.isFav;
            localStorageModel.updateLocalStorage("isFav", $rootScope.isFav);
            $location.path('/info');
            $location.replace();
        }

        /* method to remove favorite */
        self.removeFavorite = function (pid) {
            poiManagement.removeFavorite(pid, '/info');
            $rootScope.isFav = !$rootScope.isFav;
            localStorageModel.updateLocalStorage("isFav", $rootScope.isFav);
            $location.path('/info');
            $location.replace();
        }

        /* method to open a modal window for review and rating current poi*/
        $scope.open = function (name, img, pid) {
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
        }

    }]);