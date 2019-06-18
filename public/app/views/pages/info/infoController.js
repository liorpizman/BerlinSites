// info controller
angular.module("userApp")
    .controller("infoController", ['$scope', '$http', '$rootScope', '$window', 'userManagement', '$location', 'poiManagement', '$uibModal', '$q', function ($scope, $http, $rootScope, $window, userManagement, $location, poiManagement, $uibModal, $q) {

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
            if (poiManagement.openedImg) {
                self.currImg = poiManagement.openedImg;

                $rootScope.PID = self.currImg["PID"];
                poiManagement.updateCountViews($rootScope.PID);
                $rootScope.countViews = self.currImg["countViews"];

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
                $rootScope.url = self.currImg["url"];
                $rootScope.secondUrl = self.currImg["url"].substring(0, self.currImg["url"].indexOf(".jpg")) + 'a' + '.jpg';
                $rootScope.description = self.currImg["description"] + '';
                $rootScope.img = self.currImg["img"];
                $rootScope.landmark = self.currImg["landmark"];
                $rootScope.totalRating = (self.currImg["totalRating"] / 5).toFixed(2) * 100;
                $rootScope.isFav = self.currImg["fav"];
            }

            $rootScope.showFirstReview = false;
            $rootScope.showSecondReview = false;

            let ctgr = self.currImg["category"];
            if (ctgr == '0') {
                self.category = "Museum";
                $rootScope.category = "Museum";
            } else if (ctgr == '1') {
                self.category = "Club";
                $rootScope.category = "Club";
            } else if (ctgr == '2') {
                self.category = "Park";
                $rootScope.category = "Park";
            } else if (ctgr == '3') {
                self.category = "Restaurant";
                $rootScope.category = "Restaurant";
            } else {
                self.category = "Site";
                $rootScope.category = "Site";
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
                    $rootScope.showSecondReview = false;
                }
                else if (response.data["message"] == 'There is one Review for this POI') {
                    $rootScope.showFirstReview = true;
                    $scope.firstReview = response.data[0]["review"];
                    $scope.firstUser = response.data[0]["UserName"];
                    $scope.firstDate = response.data[0]["DateReviewed"];
                    $rootScope.showSecondReview = false;
                }
                else if ($rootScope.PID) {
                    $rootScope.showFirstReview = true;
                    $rootScope.showSecondReview = true;

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
        }

        /* method to add new favorite */
        self.addFavorite = function (pid) {
            poiManagement.addFavorite(pid, '/info');
            $rootScope.isFav = !$rootScope.isFav;
            $location.path('/info');
            $location.replace();
        }

        /* method to remove favorite */
        self.removeFavorite = function (pid) {
            poiManagement.removeFavorite(pid, '/info');
            $rootScope.isFav = !$rootScope.isFav;
            $location.path('/info');
            $location.replace();
        }

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