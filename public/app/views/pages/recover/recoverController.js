// about controller
angular.module("userApp")
    .controller("recoverController", ['$scope', '$http', '$location', 'localStorageModel', function ($scope, $http, $location, localStorageModel) {

        self = this;

        /* method to change location to home page*/
        self.login = function () {
            $location.path('/');
            $location.replace();
        }

        /*method to get current password for current user */
        self.recoverPassword = function () {
            $http({

                method: 'POST',
                url: 'http://localhost:3000/api/Users/restorePassword',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                data: {
                    "username": self.userName,
                    "retrievalAnswer1": self.firstAnswer,
                    "retrievalAnswer2": self.secondAnswer
                }

            }).then(function successCallback(response) {
                if (response.data["message"] == 'Your answers are incorrect!') {
                    alert('Your answers are incorrect!');
                    $scope.showPass = false;
                    return;
                }
                else {
                    $scope.restoredPass = response.data["Password"];
                    $scope.showPass = true;
                }

            }, function errorCallback(response) {
                $scope.vaildUser = false;
                $scope.isDisabled = false;
                $scope.showPass = false;
                console.log(response);
            });
        }

        /* method to check wether a current user is valid */
        self.vaildUserName = function () {
            if (self.userName == undefined || self.userName.length == 0) {
                alert('Invalid User name !');
                $scope.vaildUser = false;
                $scope.isDisabled = false;
                return;
            }
            $http({

                method: 'POST',
                url: 'http://localhost:3000/api/Users/getRecoveryQuestions',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                data: {
                    "username": self.userName
                }

            }).then(function successCallback(response) {
                if (response.data["message"] == 'There is no suitable user name is the system!') {
                    alert('User name does not exist!');
                    $scope.vaildUser = false;
                    $scope.isDisabled = false;
                    return;
                }
                else {
                    $scope.firstQuestion = response.data[0]["question1"];
                    $scope.secondQuestion = response.data[0]["question2"];

                    $scope.vaildUser = true;
                    $scope.isDisabled = true;
                }

            }, function errorCallback(response) {
                $scope.vaildUser = false;
                $scope.isDisabled = false;
                console.log(response);
            });
        }

        self.resetInputs = function () {
            $scope.vaildUser = false;
            $scope.isDisabled = false;
            $scope.showPass = false;
        }


    }]);