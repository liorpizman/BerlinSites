// All routes of our single page app using different controllers
angular.module('appRoutes', ['ngRoute', 'LocalStorageModule', 'ui.bootstrap', 'ngMaterial', 'jkAngularRatingStars'])
    .config(function ($routeProvider, $locationProvider) {
        $routeProvider
            // homepage
            .when('/', {
                templateUrl: 'app/views/pages/home/home.html',
                controller: 'homeController as hmCtrl'
            })
            // about
            .when('/about', {
                templateUrl: 'app/views/pages/about/about.html',
                controller: 'aboutController as abtCtrl'
            })
            // poi
            .when('/POI', {
                templateUrl: 'app/views/pages/poi/poi.html',
                controller: 'poiController as poiCtrl'
            })
            // register
            .when('/register', {
                templateUrl: 'app/views/pages/register/register.html',
                controller: 'registerController as regCtrl'
            })
            // login
            .when('/login', {
                templateUrl: 'app/views/pages/login/login.html',
                controller: 'loginController as lgnCtrl'
            })
            // recover password
            .when('/recoverPassword', {
                templateUrl: 'app/views/pages/recover/recover.html',
                controller: 'recoverController as rcvCtrl'
            })
            // poi info
            .when('/info', {
                templateUrl: 'app/views/pages/info/info.html',
                controller: 'infoController as infCtrl'
            })
            // favorites
            .when('/favorites', {
                templateUrl: 'app/views/pages/favorites/favorites.html',
                controller: 'favoritesController as favCtrl'
            })
            // other
            .otherwise({ redirectTo: '/' });
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    })

angular.module('appRoutes')
    .config(['$qProvider', function ($qProvider) {
        $qProvider.errorOnUnhandledRejections(false);
    }]);



