angular.module('userApp')
    .service('setHeadersToken', ['$http', 'localStorageService', function ($http, localStorageService) {

        this.set = function (t) {

            $http.defaults.headers.common['x-access-token'] = t
            localStorageService.set("token", t);
        }

    }])
