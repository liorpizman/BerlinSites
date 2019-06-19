// about controller
angular.module("userApp")
    .controller("aboutController", ['$scope', '$rootScope', '$window', 'localStorageModel', function ($scope, $rootScope, $window, localStorageModel) {

        self.initState = function () {
            $rootScope.showFooter = true;
            localStorageModel.updateLocalStorage("showFooter", $rootScope.showFooter);
        }

        self.initState();

        /* get suitable image size for current window*/
        let parmWidth = (0.35 * $window.innerWidth) + "px";
        let parmHeight = (0.3 * $window.innerHeight) + "px";

        $scope.imgStyle = {
            "width": parmWidth,
            "height": parmHeight
        }
    }]);