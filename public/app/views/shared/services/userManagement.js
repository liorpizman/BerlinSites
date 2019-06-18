angular.module('userApp')
    .service('userManagement', ['$http', 'localStorageModel', function ($http, localStorageModel) {

        let self = this;

        self.currentUser = undefined;
        self.favorites = {};

        let localUser = localStorageModel.getLocalStorage("currentUser");
        if (localUser != null) {
            self.currentUser = localUser;
        }

        let localToken = localStorageModel.getLocalStorage("token");
        if (localUser != null) {
            $http.defaults.headers.common['x-access-token'] = localToken;
        }

        /* method to get current user */
        self.getCurrentUser = function () {
            return self.currentUser;
        }

        /* method to set current user */
        self.setCurrentUser = function (user) {
            self.currentUser = user;
            localStorageModel.addLocalStorage("currentUser", user);
        }

        /* method to remove current user */
        self.removeCurrentUser = function () {
            self.currentUser = undefined;
            localStorageModel.removeLocalStorage("currentUser");
            localStorageModel.removeLocalStorage("token");
        }



    }]);
