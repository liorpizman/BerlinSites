angular.module("userApp")
    .service('localStorageModel', ['localStorageService', function (localStorageService) {


        var self = this;

        /* method to add new data to local storage */
        self.addLocalStorage = function (key, value) {
            var dataVal = localStorageService.get(key);
            if (!dataVal)
                if (localStorageService.set(key, value)) {
                    console.log("data added")
                }
            //else    /* for test use */
            //console.log('failed to add the data');
        }

        /* method to get data from local storage */
        self.getLocalStorage = function (key) {
            return localStorageService.get(key)
        }

        /* method to update data in local storage */
        self.updateLocalStorage = function (key, value) {
            localStorageService.remove(key);
            localStorageService.set(key, value);
        }

        /* method to remove data frpm local storage */
        self.removeLocalStorage = function (key) {
            localStorageService.remove(key);
        }
    }]);