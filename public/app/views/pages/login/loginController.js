// login controller
angular.module("userApp")
    .controller("loginController", ['$scope', '$rootScope', '$location', '$http', 'setHeadersToken', 'poiManagement', 'localStorageModel', function ($scope, $rootScope, $location, $http, setHeadersToken, poiManagement, localStorageModel) {


        let self = this

        /* method to change loaction to recover password */
        self.recoverPassword = function () {
            $location.path('/recoverPassword');
            $location.replace();
        }

        /* method to get a token for a valid user */
        self.login = function () {
            if (self.userName == '' || self.password == '' || self.userName == undefined || self.password == undefined) {
                alert("Please fill your user name and password!");
                return;
            }
            else {
                $http({

                    method: 'POST',
                    url: 'http://localhost:3000/api/Users/login',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                    },
                    data: {
                        "username": self.userName,
                        "password": self.password
                    }

                }).then(function successCallback(response) {
                    let res = response.data["message"];
                    if (res == 'No match') {
                        alert("User name and password do not match, Please try again!");
                        return;
                    }
                    else {
                        $rootScope.userConnected = true;
                        localStorageModel.updateLocalStorage("userConnected", $rootScope.userConnected);
                        setHeadersToken.set(response.data["token"]);
                        poiManagement.loadFavorites();
                        $rootScope.helloTag = response.data["message"][0]["firstName"];
                        localStorageModel.updateLocalStorage("helloTag", $rootScope.helloTag);

                        $location.path('/');
                        $location.replace();
                    }
                }, function errorCallback(response) {
                    console.log(response);
                });

            }
        }


    }]);