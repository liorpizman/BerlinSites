angular.module('userApp')
    .service('poiManagement', ['$http', 'localStorageModel', '$rootScope', '$location', function ($http, localStorageModel, $rootScope, $location) {

        let self = this;

        $rootScope.openedImg = {};
        self.POIS = [];
        self.src = "app/views/resources/";
        self.imgs = [];
        self.favorites = localStorageModel.getLocalStorage("favPois");

        $rootScope.openedImg = localStorageModel.getLocalStorage("openedImg");

        /* method to set current image for info location */
        self.setImg = function (img) {
            $rootScope.openedImg = img;
            localStorageModel.updateLocalStorage("openedImg", $rootScope.openedImg);
        }

        /* method to search poi by name */
        self.search = function (value) {
            self.searchImg = [[]];
            for (let i = 0; i < self.POIS.length; i++) {
                for (let j = 0; j < 3 && j < self.POIS[i].length; j++) {
                    if (self.POIS[i][j]["POIName"].trim() == value.trim()) {
                        self.searchImg[0][0] = self.POIS[i][j];
                        return self.searchImg;
                    }
                }
            }
            return;
        }

        /* method to update count views for current poi */
        self.updateCountViews = function (pid) {
            for (let i = 0; i < self.POIS.length; i++) {
                for (let j = 0; j < 3 && j < self.POIS[i].length; j++) {
                    if (self.POIS[i][j]["PID"].trim() == pid) {
                        self.POIS[i][j]["countViews"] = String(Number(self.POIS[i][j]["countViews"]) + 1);
                        return self.searchImg;
                    }
                }
            }
        }

        /* method to search poi by category */
        self.searchByCategory = function (value) {
            self.searchImg = [[]];
            let tmp = [];
            self.categoryNum = '0';
            if (value == 'Museum') {
                self.categoryNum = '0';
            } else if (value == 'Club') {
                self.categoryNum = '1';
            } else if (value == 'Park') {
                self.categoryNum = '2';
            } else {
                self.categoryNum = '3';
            }
            for (let i = 0, row = 0, col = 0; i < self.POIS.length; i++) {
                for (let j = 0; j < 3 && j < self.POIS[i].length; j++) {
                    if (self.POIS[i][j]["category"].trim() == self.categoryNum) {
                        tmp.push(self.POIS[i][j]);
                    }
                }
            }
            for (let i = 0; i < tmp.length; i++) {
                self.searchImg[i] = [];
                for (let j = 0; j < 3 && j < tmp.length; j++) {
                    self.searchImg[i][j] = tmp[i * 3 + j];
                }
            }
            return self.searchImg;
        }

        /* method to search poi by category */
        self.sortByRating = function (POIStoSort) {
            self.sorted = [[]];
            self.tmp = [];
            for (let i = 0; i < POIStoSort.length; i++) {
                for (let j = 0; j < 3 && j < POIStoSort[i].length; j++) {
                    self.tmp.push(POIStoSort[i][j]);
                }
            }
            self.tmp.sort(self.compareRatings);
            for (let i = 0; (i * 3) < self.tmp.length; i++) {
                self.sorted[i] = [];
                for (let j = 0; j < 3 && (i * 3 + j) < self.tmp.length; j++) {
                    self.sorted[i][j] = self.tmp[i * 3 + j];
                }
            }
            return self.sorted;
        }

        /* method to compare two ratings*/
        self.compareRatings = function (a, b) {
            if (parseFloat(a["totalRating"]) === parseFloat(b["totalRating"])) {
                return 0;
            }
            else {
                return (parseFloat(a["totalRating"]) > parseFloat(b["totalRating"])) ? -1 : 1;
            }
        }

        /* method to add new favorite */
        self.addFavorite = function (pid, path) {

            $http({

                method: 'POST',
                url: 'http://localhost:3000/api/reg/POI/insertFavorite',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                data: {
                    "PID": String(pid)
                }

            }).then(function successCallback(response) {
                if (response.data["message"] == "The favorite has been added to the user record") {

                    let count = 0;
                    for (let i = 0; i < self.favorites.length; i++) {
                        if (self.favorites[i] != pid) {
                            count += 1;
                        }
                    }
                    if (count == self.favorites.length) {
                        self.favorites.push(pid);
                    }
                    localStorageModel.removeLocalStorage("favorites");
                    localStorageModel.addLocalStorage("favorites", self.favorites);
                    self.updateFavoriteValue(pid, true);
                    self.loadFavorites();
                }
            }, function errorCallback(response) {
                console.log(response);
            });

        }

        /* method to update current poi's fav attribute */
        self.updateFavoriteValue = function (pid, value) {
            for (let i = 0; i < self.POIS.length; i++) {
                if (self.POIS["PID"] == pid) {
                    self.POIS["fav"] = value;
                    return;
                }
            }
        }

        /* method to reset current favorites' fav attribute */
        self.resetFavorites = function () {
            for (let i = 0; i < self.POIS.length; i++) {
                self.POIS["fav"] = false;
            }
            self.favorites = [];

        }

        /* method to set fav attribute for each poi */
        self.setFavoritesValue = function () {
            for (let i = 0; i < self.POIS.length; i++) {
                for (let j = 0; j < 3 && j < self.POIS[i].length; j++) {
                    if (self.favorites.includes(self.POIS[i][j]["PID"])) {
                        self.POIS[i][j]["fav"] = true;
                    } else {
                        self.POIS[i][j]["fav"] = false;
                    }
                }
            }
        }

        /* method to remove favorite */
        self.removeFavorite = function (pid, path) {

            $http({

                method: 'DELETE',
                url: 'http://localhost:3000/api/reg/POI/deleteFavorite',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                },
                data: {
                    "PID": String(pid)
                }

            }).then(function successCallback(response) {
                if (response.data["success"] == true || response.data["message"] == "The favorite has been deleted from the user record") {
                    self.tmp = [];
                    for (let i = 0; i < self.favorites.length; i++) {
                        if (self.favorites[i] != pid) {
                            self.tmp.push(self.favorites[i]);
                        }
                    }
                    self.favorites = self.tmp;
                    localStorageModel.removeLocalStorage("favorites");
                    localStorageModel.addLocalStorage("favorites", self.favorites);
                    self.updateFavoriteValue(pid, false);
                    self.loadFavorites();
                }

            }, function errorCallback(response) {
                console.log(response);
            });
        }

        /* method to save favorites in db*/
        self.saveInDB = function () {
            self.loadFavorites();
            alert('Your favorites are saved in the DB!');
        }

        /* method to load favorites from db*/
        self.loadFavorites = function () {
            $http.get('http://localhost:3000/api/reg/POI/getFavorites').then(function (response) {
                if (response.data["message"] == "There is no POI for this ID") {
                    self.setFavoritesValue();
                    return;
                }
                let favs = response.data;
                self.favorites = [];
                for (let i = 0; i < favs.length; i++) {
                    self.favorites.push(favs[i]["PID"]);
                }
                localStorageModel.removeLocalStorage("favorites");
                localStorageModel.addLocalStorage("favorites", self.favorites);

                $rootScope.countFav = self.favorites.length;
                localStorageModel.updateLocalStorage("countFav", $rootScope.countFav);
                self.setFavoritesValue();
            }).catch(function (err) {
                console.log(err);
            });
        }

        $http.get('http://localhost:3000/api/POI/getAllPOIs').then(function (response) {
            let points = response.data;
            for (let i = 0; i < points.length; i++) {

                $http({

                    method: 'POST',
                    url: 'http://localhost:3000/api/POI/getImages',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                    },
                    data: {
                        "imgID": points[i]["img"]
                    }

                }).then(function successCallback(response) {
                    points[i]["url"] = self.src + response.data[0]["url"] + ".jpg";
                    if (points[i]["totalRating"] == "NaN") {
                        points[i]["totalRating"] = '3';
                    }
                }, function errorCallback(response) {
                    console.log(response);
                });
            }
            self.imgs = points;
            for (let i = 0; i < self.imgs.length;) {
                newLine = [];
                for (let j = 0; j < 3 && i < self.imgs.length; j++ , i++) {
                    newLine.push(self.imgs[i]);
                }
                self.POIS.push(newLine);
            }

        }).catch(function (err) {
            console.log(err);
        });

    }]);
