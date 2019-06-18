// poi controller
angular.module("userApp")
    .controller("poiController", ['$uibModal', '$scope', '$http', '$window', 'poiManagement', '$location', '$rootScope', function ($uibModal, $scope, $http, $window, poiManagement, $location, $rootScope) {
        let self = this;

        self.POIS = [];

        self.initState = function () {
            $rootScope.showFooter = true;
        }

        $scope.categories = ['Museum', 'Club', 'Park', 'Restaurant'];

        self.initState();

        $scope.imgStyle = {
            "width": "280px",
            "height": "160px"
        }

        /* method for opening new window for more accurate data about current poi*/
        self.openInfo = function (img) {
            poiManagement.setImg(img);
            $rootScope.showFooter = false;
            $location.path('/info');
            $location.replace();
        }

        /* method to add new favorite */
        self.addFavorite = function (pid) {
            poiManagement.addFavorite(pid, 'POI');
            if (self.POIS.length == 1) {
                self.POIS = poiManagement.search(self.searchValue);
            }
            else if (self.POIS.length == 5) {
                self.POIS = poiManagement.searchByCategory(self.categorySearch);
                $scope.searchResult = "";
            }
            else {
                self.POIS = poiManagement.POIS;
            }
        }

        /* method to remove favorite */
        self.removeFavorite = function (pid) {
            poiManagement.removeFavorite(pid, 'POI');
            if (self.POIS.length == 1) {
                self.POIS = poiManagement.search(self.searchValue);
            }
            else if (self.POIS.length == 5) {
                self.POIS = poiManagement.searchByCategory(self.categorySearch);
                $scope.searchResult = "";
            }
            else {
                self.POIS = poiManagement.POIS;
            }

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

        /* method to search poi */
        $scope.search = function () {
            self.POIS = poiManagement.search(self.searchValue);
            if (!self.POIS || self.POIS.length == 0) {
                $scope.searchResult = "No search results found!";
            }
            else {
                $scope.searchResult = "";
            }
        }

        /* method to search poi by category */
        $scope.searchByCategory = function () {
            self.POIS = poiManagement.searchByCategory(self.categorySearch);
            $scope.searchResult = "";
        }

        /* method to show all pois */
        $scope.showAll = function () {
            self.POIS = poiManagement.POIS;
            $scope.searchResult = "";
        }

        /* method to sort current pois by rating */
        $scope.sortByRating = function () {
            if (self.POIS && self.POIS.length != 0) {
                self.POIS = poiManagement.sortByRating(self.POIS);
            }
        }

    }]);