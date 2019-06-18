//register controller
angular.module("userApp")
    .controller("registerController", ['$scope', '$http', '$location', '$rootScope', '$window', function ($scope, $http, $location, $rootScope, $window) {

        self = this;

        $scope.countries = []
        $scope.firstQuestion = ""
        $scope.secondQuestion = ""

        /* method to load countries for select section */
        $http({

            method: 'GET',
            url: 'http://localhost:3000/api/Users/getCountries',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }

        }).then(function successCallback(response) {
            let res = response.data;
            let names = res.Countries.Country;
            for (let i = 0; i < names.length; i++) {
                $scope.countries.push(names[i].Name[0]);
            }
        }, function errorCallback(response) {
            console.log(response);
        });

        /* method to ger random question for the user */
        $http({

            method: 'GET',
            url: 'http://localhost:3000/api/Users/getRandomQuestions',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }

        }).then(function successCallback(response) {
            let res = response.data;
            $scope.firstQuestion = res[0]["questionDescription"];
            $scope.secondQuestion = res[1]["questionDescription"];
        }, function errorCallback(response) {
            console.log(response);
        });

        /* method to sign up new user to the system by current rules */
        self.signup = function () {
            let letters = /^[a-z]+$/;
            let lettersAndNums = /^[a-zA-Z0-9_.-]*$/;

            if (self.username.length < 3 || self.username.length > 8 || !self.username.match(letters)) {
                alert('User name should contain 3-8 letters without numbers!');
                return;
            }
            if (self.password.length < 5 || self.password.length > 10 || !self.password.match(lettersAndNums)) {
                alert('Password should contain 5-10 including letters or numbers only!');
                return;
            }

            self.categoriesIDs = []
            if (self.Museum == true) {
                self.categoriesIDs.push("0");
            }
            if (self.Club == true) {
                self.categoriesIDs.push("1");
            }
            if (self.Park == true) {
                self.categoriesIDs.push("2");
            }
            if (self.Restaurant == true) {
                self.categoriesIDs.push("3");
            }
            if (self.categoriesIDs.length < 2) {
                alert('You must choose at least 2 categories of interests!');
                return;
            }

            $http({

                method: 'POST',
                url: 'http://localhost:3000/api/Users/register',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                data: {
                    "username": self.username,
                    "password": self.password,
                    "firstName": self.firstName,
                    "lastName": self.lastName,
                    "city": self.city,
                    "country": self.country,
                    "email": self.email,
                    "retrievalQuestion1": $scope.firstQuestion,
                    "retrievalAnswer1": self.firstAnswer,
                    "retrievalQuestion2": $scope.secondQuestion,
                    "retrievalAnswer2": self.secondAnswer,
                    "categoriesIDs": self.categoriesIDs
                }

            }).then(function successCallback(response) {
                let msg = response.data["message"];
                if (msg == "User name already exists in the system!") {
                    alert("User name already exists in the system, Please choose another one!");
                    return;
                }
                else {
                    if (msg === "User have been successfully added") {
                        alert(msg);
                    }
                    $location.path('/login');
                    $location.replace();
                }


            }, function errorCallback(response) {
                console.log(response);
            });
        }

    }]);