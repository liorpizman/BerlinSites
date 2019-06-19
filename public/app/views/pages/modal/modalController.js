angular.module("userApp")
    .controller('modalController', ['$scope', '$uibModalInstance', '$rootScope', '$http', 'localStorageModel', function ($scope, $uibModalInstance, $rootScope, $http, localStorageModel) {

        $scope.secondRate = 3;
        $scope.ratingUpdated = false;
        $scope.reviewUpdated = false;
        $rootScope.modalRating = 3;
        localStorageModel.updateLocalStorage("modalRating", $rootScope.modalRating);

        $scope.imgStyle = {
            "width": "180px",
            "height": "120px"
        }

        /* method to close modal window */
        $scope.exit = function () {
            $uibModalInstance.close("Ok");
        }

        /* method running when the rating curser is changed*/
        $scope.onItemRating = function (rating) {
            $rootScope.modalRating = rating;
            localStorageModel.updateLocalStorage("modalRating", $rootScope.modalRating);
        };

        /* method to submit rating for current user */
        $scope.submitRating = function () {
            $http({

                method: 'POST',
                url: 'http://localhost:3000/api/reg/POI/insertRating',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                data: {
                    "PID": $rootScope.modalPID,
                    "rating": $rootScope.modalRating
                }

            }).then(function successCallback(response) {
                if (response.data["message"] == 'There rating has been updated' || response.data["message"] == 'The rating has been added and updated') {
                    $scope.ratingUpdated = true;
                }

            }, function errorCallback(response) {
                console.log(response);
            });
        }

        /* method to submit review for current user */
        $scope.submitReview = function () {

            $http({

                method: 'POST',
                url: 'http://localhost:3000/api/reg/POI/InsertReview',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                data: {
                    "PID": $rootScope.modalPID,
                    "textReview": $scope.modalReview
                }

            }).then(function successCallback(response) {
                if (response.data["message"] == 'There review has been updated' || response.data["message"] == 'The review has been added to the user and POI records') {
                    $scope.reviewUpdated = true;
                }
            }, function errorCallback(response) {
                console.log(response);
            });
        }




    }]);