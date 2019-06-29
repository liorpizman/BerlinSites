angular.module("userApp")
    .controller("favoritesController", ['$scope', '$http', '$rootScope', '$window', 'userManagement', '$location', 'poiManagement', '$uibModal', 'localStorageModel', function ($scope, $http, $rootScope, $window, userManagement, $location, poiManagement, $uibModal, localStorageModel) {

        let self = this;

        //$rootScope.favPois = [[]];
        $rootScope.showFooter = true;
        localStorageModel.updateLocalStorage("showFooter", $rootScope.showFooter);

        if (localStorageModel.getLocalStorage("favPois", $rootScope.favPois) != null)
            $rootScope.favPois = localStorageModel.getLocalStorage("favPois", $rootScope.favPois);
        else
            $rootScope.favPois = [[]];



        $scope.sortBy = ['Category', 'Rating'];

        /* method for setting users' new order of favorites*/
        $scope.setUserOrder = function () {
            self.orderValues = self.userOrder.split(" ");
            self.chosenOrder = new Array($rootScope.countFav);
            if (self.orderValues.length != $rootScope.countFav) {
                alert("You have mentioned more POIS than you have in your list!")
                return;
            }
            if (self.hasDuplicates(self.orderValues) == true) {
                alert("You have mentioned duplicate indexes in your choice!")
                return;
            }
            for (let j = 1; j <= $rootScope.countFav; j++) {
                for (let i = 0; i < self.orderValues.length; i++) {
                    if (Number.isInteger(Number(self.orderValues[i])) && self.between(Number(self.orderValues[i]), 1, $rootScope.countFav)) {
                        if (Number(self.orderValues[i]) == j) {
                            self.chosenOrder[j - 1] = Number($scope.inputPIDs[i]);
                        }
                    }
                    else {
                        alert("You have entered invalid number in input!")
                        return;
                    }
                }
            }

            /* sets users' new order of favorites in the db*/
            $http({

                method: 'POST',
                url: 'http://localhost:3000/api/reg/POI/setFavoritesOrder',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                data: {
                    "PIDS": self.chosenOrder,
                    "orderFilter": "orderByUser"
                }

            }).then(function successCallback(response) {

            }, function errorCallback(response) {
                console.log(response);
            });

            self.sortProperty = 'user';
            $scope.sortByProperty();

        }

        /* method to check whether number in range of two other numbers*/
        self.between = function (x, min, max) {
            return x >= min && x <= max;
        }


        /* method to sort favorites by chosen property*/
        $scope.sortByProperty = function () {
            let value = "user";
            if ($rootScope.favPois && $rootScope.favPois.length != 0) {
                if (self.sortProperty == 'Category') {
                    value = "category";
                } else if (self.sortProperty == 'Rating') {
                    value = "totalRating";
                }
                $http({

                    method: 'POST',
                    url: 'http://localhost:3000/api/reg/POI/POIFavOrder',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                    },
                    data: {
                        "Filter": value.trim()
                    }

                }).then(function successCallback(response) {
                    self.favOrder = response.data;
                    self.tmpOrder = [[]];
                    let row = 0;
                    let col = 0;
                    for (let index = 0; index < self.favOrder.length; index++) {
                        for (let i = 0; i < $rootScope.favPois.length; i++) {
                            for (let j = 0; j < 3 && j < $rootScope.favPois[i].length; j++) {
                                if ($rootScope.favPois[i][j]["PID"] == self.favOrder[index]["PID"]) {
                                    self.tmpOrder[row][col] = $rootScope.favPois[i][j];
                                    if (col == 2) {
                                        col = 0;
                                        row += 1;
                                        self.tmpOrder[row] = [];
                                    }
                                    else {
                                        col += 1;
                                    }
                                }
                            }
                        }
                    }
                    $rootScope.favPois = self.tmpOrder;
                    localStorageModel.updateLocalStorage("favPois", $rootScope.favPois);
                }, function errorCallback(response) {
                    console.log(response);
                });

            }
            for (let i = 0; i < $rootScope.favPois.length; i++) {
                for (let j = 0; j < 3 && j < $rootScope.favPois[i].length; j++) {
                    $scope.inputNames[i * 3 + j] = $rootScope.favPois[i][j]["POIName"];
                    $scope.inputPIDs[i * 3 + j] = $rootScope.favPois[i][j]["PID"];
                }
            }
        }

        /* method which starts on controller's load*/
        self.onLoad = function () {
            if($rootScope.favPois=== undefined || $rootScope.favPois=== null){
                let row = 0;
                let col = 0;
                for (let i = 0; i < poiManagement.POIS.length; i++) {
                    //console.log(poiManagement.POIS);
                    for (let j = 0; j < 3 && j < poiManagement.POIS[i].length; j++) {
                        if (poiManagement.POIS[i][j]["fav"] == true) {
                            $rootScope.favPois[row][col] = poiManagement.POIS[i][j];
                            if (col == 2) {
                                col = 0;
                                row += 1;
                                $rootScope.favPois[row] = [];
                            }
                            else {
                                col += 1;
                            }
                        }
                    }
                }
                localStorageModel.updateLocalStorage("favPois", $rootScope.favPois);
             }
            return $rootScope.favPois;
        }

        self.onLoad();

        /* method to save current favorites in db*/
        $scope.saveInDB = function () {
            poiManagement.saveInDB();
        }

        $scope.inputNames = [];
        $scope.inputPIDs = [];

        /* For showing the user current order of favorites*/
        for (let i = 0; i < $rootScope.favPois.length; i++) {
            for (let j = 0; j < 3 && j < $rootScope.favPois[i].length; j++) {
                $scope.inputNames[i * 3 + j] = $rootScope.favPois[i][j]["POIName"];
                $scope.inputPIDs[i * 3 + j] = $rootScope.favPois[i][j]["PID"];
            }
        }

        /* method to remove current poi from favorites */
        self.removeFavorite = function (pid) {
            poiManagement.removeFavorite(pid, 'favorites');
            $rootScope.favPois = self.onLoad();
            localStorageModel.updateLocalStorage("favPois", $rootScope.favPois);
            if ($rootScope.countFav >= 0) {
                $rootScope.countFav -= 1;
                localStorageModel.updateLocalStorage("countFav", $rootScope.countFav);
            }
            $location.path('/favorites');
            $location.replace();
        }

        /* method for opening new window for more accurate data about current poi*/
        self.openInfo = function (img) {
            poiManagement.setImg(img);
            $rootScope.showFooter = false;
            localStorageModel.updateLocalStorage("showFooter", $rootScope.showFooter);
            $location.path('/info');
            $location.replace();
        }

        /* method to check whether there is any duplicate in current array*/
        self.hasDuplicates = function (array) {
            return (new Set(array)).size !== array.length;
        }
    }]);
