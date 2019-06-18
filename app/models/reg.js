var express = require('express');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var DB = require("../DataBase");
var util = require('util');


var config = require('../config');
var exports = module.exports = {};

/* This request returns two most recent POIs the user saved. If not exists, it will return null. */
exports.getLastSaved = function (req, res) {  //router.get('/POI/getLastSaved', function (req, res)
    var token = req.headers['x-access-token'] || req.body.token || req.query.token;
    if (!token) {
        res.status(200).send(({ success: true, message: "Something is worng....." }));
    }
    var user = GetUserByToken(token);
    if (!user) {
        res.status(400).send(({ success: false, message: "This user Token is incorrect" }));
    }
    var LastSavedQuery = util.format("SELECT PID, POIName, category, description, countViews, landmark, img, totalRating FROM POI WHERE PID IN (SELECT TOP 2 PID FROM POIForUser WHERE Username='%s' order by SaveDate desc)", user);
    DB.execQuery(LastSavedQuery)
        .then(function (result) {
            res.status(200).send(result);
        })
        .catch((err) => {
            console.log(err);
            res.status(400).send(({ success: false, message: "Something is worng....." }));
        })
};

/* This request creates a new entry POI to the favorites list. */
exports.insertFavorite = function (req, res) {  //router.post('/POI/insertFavorite', function (req, res)
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Content - Type, Accept");
    var token = req.headers['x-access-token'] || req.body.token || req.query.token;

    var user = GetUserByToken(token);
    if (!user) {
        res.status(400).send(({ success: false, message: "This user Token is incorrect" }));
    }
    var saveDate = new Date();  // .getTime() // saveDate will be time stamp
    // for showing the time use ---- epochTime = new Date(saveDate);
    var existFavQuery = util.format("SELECT * FROM POIForUser WHERE PID = '%s' AND UserName= '%s'",
        req.body.PID,
        user
    );
    DB.execQuery(existFavQuery)
        .then(function (firstResult) {
            if (firstResult.length > 0) {
                res.status(200).send(({ success: true, message: "This user has already selected this favorite" }));
            }
            else {
                var insertFavoriteQuery = util.format("INSERT INTO POIForUser (UserName,PID,orderByUser,SaveDate) VALUES ('%s','%s','%s','%s')",
                    user,
                    req.body.PID,
                    0,
                    saveDate.toISOString()
                );
                DB.execQuery(insertFavoriteQuery)
                    .then(function (secondResult) {
                        res.status(200).send(({ success: true, message: "The favorite has been added to the user record" }));
                    })
                    .catch(function (err) {
                        console.log(err);
                        res.status(500).send({ success: false, message: "Error while connecting to db internal" });
                    })
            }
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send({ success: false, message: "Error while connecting to db external" });
        })

};

/* This request returns the relevant POI’s for a given name */
exports.getPOIbyName = function (req, res) {  //router.get('/POI/getPOIbyName', function (req, res)
    var GetPOIQuery = util.format("SELECT category, description, countViews, landmark, img, totalRating FROM POI WHERE POIName = '%s'", req.body.PIOName);
    DB.execQuery(GetPOIQuery)
        .then(function (result) {
            if (result.length == 0) {
                res.status(400).send(({ success: false, message: "There is no POI for this name" }));
            }
            else {
                res.status(200).send(result[0]);
            }
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send({ success: false, message: "Error while connecting to db" });
        })
};

/* This request returns user’s details */
exports.getUserDetails = function (req, res) {  //router.post('/getUserDetails', function (req, res) 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Content - Type, Accept");
    var token = req.headers['x-access-token'] || req.body.token || req.query.token;
    if (!token) {
        res.status(400).send(({ success: false, message: "This Token is missing" }));
    }
    var user = GetUserByToken(token);
    if (!user) {
        res.status(400).send(({ success: false, message: "This user Token is incorrect" }));
    }
    else if (token) {
        var selecQuery = util.format("SELECT * FROM Users WHERE UserName='%s'", user);
        DB.execQuery(selecQuery)
            .then(function (result) {
                if (result.length == 0) {
                    res.status(400).send(({ success: false, message: "The User does not exist in the system" }));
                }
                else {
                    res.status(200).send(result[0]);
                }
            })
            .catch(function (err) {
                console.log(err);
                res.status(500).send({ success: false, message: "Error while connecting to db" });
            })
    }
    else {
        res.status(404).send({ success: false, message: 'Failed to authenticate token.' });
    }
};

/* This request deletes an existing entry POI from the favorites list. */
exports.deleteFavorite = function (req, res) {  //router.delete('/POI/deleteFavorite', function (req, res)
    var token = req.headers['x-access-token'] || req.body.token || req.query.token;
    if (!token) {
        res.status(400).send(({ success: false, message: "This Token is missing" }));
    }
    var user = GetUserByToken(token);
    if (!user) {
        res.status(400).send(({ success: false, message: "This Token is incorrect" }));
    }
    if (token) {
        var deleteFavQuery = util.format("DELETE FROM POIForUser WHERE PID = '%s' AND UserName= '%s' ",
            req.body.PID,
            user
        );
        DB.execQuery(deleteFavQuery)
            .then(function (result) {
                res.status(200).send(({ success: true, message: "The favorite has been deleted from the user record" }));
            })
            .catch(function (err) {
                console.log(err);
                res.status(500).send({ success: false, message: "Error while connecting to db" });
            })
    }
    else {
        res.status(404).send({ success: false, message: 'Failed to authenticate token.' });
    }
};

/* This request returns a list of user’s favorites point of interests. */
exports.getFavorites = function (req, res) {  //router.get('/POI/getFavorites', function (req, res)
    var token = req.headers['x-access-token'] || req.body.token || req.query.token;
    if (!token) {
        res.status(400).send(({ success: false, message: "This Token is missing" }));
    }
    var user = GetUserByToken(token);
    if (!user) {
        res.status(400).send(({ success: false, message: "This user Token is incorrect" }));
    }
    var GetPOIQuery = util.format("SELECT PID, POIName, category, description, countViews, landmark, img, totalRating FROM POI WHERE PID IN (SELECT PID FROM POIForUser WHERE UserName='%s')", user);
    DB.execQuery(GetPOIQuery)
        .then(function (result) {
            if (result.length == 0) {
                res.status(200).send(({ success: true, message: "There is no POI for this ID" }));
            }
            else {
                res.status(200).send(result);
            }
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send({ success: false, message: "Error while connecting to db" });
        })
};

/* This request sets the order for the favorites list of a given user by category, by rating, and by user’s choice. */
exports.setFavoritesOrder = function (req, res) {  //router.post('/POI/setFavoritesOrder', function (req, res)
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Content - Type, Accept");
    var token = req.headers['x-access-token'] || req.body.token || req.query.token;
    if (!req.body.PIDS || !token || !req.body.orderFilter ||
        (req.body.orderFilter !== "orderByCategory" && req.body.orderFilter !== "orderByRating" && req.body.orderFilter !== "orderByUser")) {
        res.status(400).send(({ success: false, message: "Something is worng....." }));
    }
    var user = GetUserByToken(token);
    if (!user) {
        res.status(400).send(({ success: false, message: "This user Token is incorrect" }));
    }
    var PIDsList = req.body.PIDS;
    var updateOrderQuery;
    var UpdatesPromises = [];
    for (var i = 0; i < PIDsList.length; i++) {
        updateOrderQuery = util.format("UPDATE POIForUser SET %s='%s' WHERE UserName = '%s' AND PID='%s'",
            req.body.orderFilter,
            i,
            user,
            PIDsList[i]
        );
        UpdatesPromises.push(DB.execQuery(updateOrderQuery));
    }
    Promise.all(UpdatesPromises)
        .then(function () {
            res.status(200).send(({ success: true, message: "There order has been updated" }));
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send({ success: false, message: "An error occurred while updating the order" });
        })
};

/* Adds user’s rating to database and updates the average rating for given POI. */
exports.insertRating = function (req, res) {  //router.post('/POI/insertRating', function (req, res)
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Content - Type, Accept");
    var token = req.headers['x-access-token'] || req.body.token || req.query.token;
    if (!req.body.PID || !token || !req.body.rating) {
        res.status(400).send(({ success: false, message: "Something is worng....." }));
    }
    var user = GetUserByToken(token);
    if (!user) {
        res.status(400).send(({ success: false, message: "This user Token is incorrect" }));
    }
    var saveDate = new Date();
    var PID = req.body.PID;
    var rating = req.body.rating;
    var ratingNum = Number(req.body.rating);
    var checkRatingExists = util.format("SELECT rating FROM UserRating WHERE UserName = '%s' AND PID='%s'", user, PID);
    DB.execQuery(checkRatingExists)
        .then(function (firstResult) {
            if (firstResult.length > 0) { // rating exists for this POI from the current user
                var oldUserRatingNum = Number(firstResult[0]['rating']);
                var oldRatingQuery = util.format("SELECT countRated , sumRated FROM POI WHERE PID='%s'", PID);
                DB.execQuery(oldRatingQuery)
                    .then(function (secondResult) {
                        var oldCountRated = Number(secondResult[0]['countRated']);
                        var oldAllRatingNum = Number(secondResult[0]['sumRated']);
                        var updateRatingQuery = util.format("UPDATE UserRating SET rating='%s' ,SaveDate='%s' WHERE UserName = '%s' AND PID='%s'",
                            rating,
                            saveDate.toISOString(),
                            user,
                            PID
                        );
                        DB.execQuery(updateRatingQuery)
                            .then(function () {
                                var UpdateOldRatingQuery = util.format("UPDATE POI SET sumRated='%s' ,totalRating='%s' WHERE PID='%s'",
                                    (oldAllRatingNum - oldUserRatingNum + ratingNum),
                                    ((oldAllRatingNum - oldUserRatingNum + ratingNum) / oldCountRated),
                                    PID
                                );
                                DB.execQuery(UpdateOldRatingQuery)
                                    .then(function () {
                                        res.status(200).send(({ success: true, message: "There rating has been updated" }));
                                    })
                                    .catch(function (err) {
                                        console.log(err);
                                        res.status(500).send({ success: false, message: "An error occurred while updating the rating" });
                                    })
                            })
                            .catch(function (err) {
                                console.log(err);
                                res.status(500).send({ success: false, message: "An error occurred while updating the rating" });
                            })
                    })
                    .catch(function (err) {
                        console.log(err);
                        res.status(500).send({ success: false, message: "An error occurred while updating the rating" });
                    })
            }
            else {  // first rating of user
                var PIOQuery = util.format("SELECT countRated ,sumRated FROM POI WHERE PID='%s'", PID);
                DB.execQuery(PIOQuery)
                    .then(function (thirdResult) {
                        var oldCountRated = Number(thirdResult[0]['countRated']);
                        var oldSumRated = Number(thirdResult[0]['sumRated']);
                        var insertRatingQuery = util.format("INSERT INTO UserRating  (PID,UserName,rating,SaveDate) VALUES ('%s','%s','%s','%s')",
                            PID,
                            user,
                            rating,
                            saveDate.toISOString()
                        );
                        DB.execQuery(insertRatingQuery)
                            .then(function () {
                                var updatePOIQuery = util.format("UPDATE POI SET countRated='%s' ,sumRated='%s' ,totalRating='%s'  WHERE PID='%s'",
                                    oldCountRated + 1,
                                    ratingNum + oldSumRated,
                                    (ratingNum + oldSumRated) / (oldCountRated + 1),
                                    PID
                                );
                                DB.execQuery(updatePOIQuery)
                                    .then(function () {
                                        res.status(200).send(({ success: true, message: "The rating has been added and updated" }));
                                    })
                                    .catch(function (err) {
                                        console.log(err);
                                        res.status(500).send({ success: false, message: "An error occurred while updating the rating" });
                                    })
                            })
                            .catch(function (err) {
                                console.log(err);
                                res.status(500).send({ success: false, message: "An error occurred while updating the rating" });
                            })
                    })
                    .catch(function (err) {
                        console.log(err);
                        res.status(500).send({ success: false, message: "An error occurred while updating the rating" });
                    })
            }
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send({ success: false, message: "An error occurred while updating the rating" });
        })
};

/* Adds user’s review to database for existing review, otherwise, creates a new review with current text review. */
exports.InsertReview = function (req, res) {  //router.post('/POI/InsertReview', function (req, res)
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Content - Type, Accept");
    var token = req.headers['x-access-token'] || req.body.token || req.query.token;
    if (!req.body.PID || !token || !req.body.textReview) {
        res.status(400).send(({ success: false, message: "Something is worng....." }));
    }
    else {
        var user = GetUserByToken(token);
        if (!user) {
            res.status(400).send(({ success: false, message: "This user Token is incorrect" }));
        }
        else {
            var PID = req.body.PID;
            var existPIDQuery = util.format("SELECT * FROM POI WHERE PID = '%s'", PID);
            DB.execQuery(existPIDQuery)
                .then(function (result) {
                    if (result.length > 0) {
                        var saveDate = new Date();
                        var review = req.body.textReview;
                        var existReviewQuery = util.format("SELECT * FROM POIReviews WHERE PID = '%s' AND UserName= '%s'",
                            PID,
                            user
                        );
                        DB.execQuery(existReviewQuery)
                            .then(function (firstResult) {
                                if (firstResult.length > 0) {
                                    var updateReviwQuery = util.format("UPDATE POIReviews SET review ='%s' ,DateReviewed ='%s' WHERE UserName = '%s' AND PID='%s'",
                                        review,
                                        saveDate.toISOString(),
                                        user,
                                        PID
                                    );
                                    DB.execQuery(updateReviwQuery)
                                        .then(function () {
                                            res.status(200).send(({ success: true, message: "There review has been updated" }));
                                        })
                                        .catch(function (err) {
                                            console.log(err);
                                            res.status(500).send({ success: false, message: "An error occurred while updating the review" });
                                        })
                                }
                                else {
                                    var insertReviewQuery = util.format("INSERT INTO POIReviews (PID,UserName,review,DateReviewed) VALUES ('%s','%s','%s','%s')",
                                        PID,
                                        user,
                                        review,
                                        saveDate.toISOString()
                                    );
                                    DB.execQuery(insertReviewQuery)
                                        .then(function (secondResult) {
                                            res.status(200).send(({ success: true, message: "The review has been added to the user and POI records" }));
                                        })
                                        .catch(function (err) {
                                            console.log(err);
                                            res.status(500).send({ success: false, message: "An error occurred while updating the review" });
                                        })

                                }
                            })
                            .catch(function (err) {
                                console.log(err);
                                res.status(500).send({ success: false, message: "An error occurred while updating the review" });
                            })
                    }
                    else {
                        res.status(500).send({ success: false, message: "An error occurred while updating the review" });
                    }
                })
                .catch(function (err) {
                    console.log(err);
                    res.status(500).send({ success: false, message: "An error occurred while updating the review" });
                });
        }
    }
};

/* This request returns the number of favorite POIs of a given user */
exports.getCountFavorites = function (req, res) {  //router.get('/POI/getCountFavorites', function (req, res)
    var token = req.headers['x-access-token'] || req.body.token || req.query.token;
    if (!token) {
        res.status(400).send(({ success: false, message: "Something is worng....." }));
    }
    var user = GetUserByToken(token);
    if (!user) {
        res.status(400).send(({ success: false, message: "This user Token is incorrect" }));
    }
    var countFavoritesQuery = util.format("SELECT COUNT(*) as counter FROM POIForUser WHERE UserName = '%s'", user);
    DB.execQuery(countFavoritesQuery)
        .then(function (result) {
            res.status(200).send(result[0]);
        })
        .catch(function (err) {
            res.status(500).send({ success: false, message: "Error while getting number of favorite" });
        })
};

/* This request returns two most recommended POIs for the user in 2 different categories which are suitable for his previous choices. */
exports.getRecommended = function (req, res) {  //router.get('/POI/getRecommended', function (req, res)
    var token = req.headers['x-access-token'] || req.body.token || req.query.token;
    if (!token) {
        res.status(200).send(({ success: true, message: "Something is worng....." }));
    }
    var user = GetUserByToken(token);
    if (!user) {
        res.status(400).send(({ success: false, message: "This user Token is incorrect" }));
    }
    var selectCategories = util.format("SELECT DISTINCT TOP(2) CategoryID FROM UsersCategory WHERE UserName='%s'", user);
    DB.execQuery(selectCategories)
        .then(function (categoriesRes) {
            if (categoriesRes.length == 2) {
                var selectFirst = util.format("SELECT TOP (1) PID, POIName, category, description, countViews, landmark, img, totalRating FROM POI WHERE category='%s' order by totalRating desc", categoriesRes[0]['CategoryID']);
                DB.execQuery(selectFirst)
                    .then(function (firstResult) {
                        if (firstResult.length === 1) {
                            var selectSecond = util.format("SELECT TOP (1) PID, POIName, category, description, countViews, landmark, img, totalRating FROM POI WHERE category='%s' order by totalRating desc", categoriesRes[1]['CategoryID']);
                            DB.execQuery(selectSecond)
                                .then(function (secondResult) {
                                    if (secondResult.length === 1) {
                                        res.status(200).send([firstResult[0], secondResult[0]]);
                                    }
                                    else {
                                        res.status(400).send({ success: false, message: 'The user do not have 2 categories!' });
                                    }
                                })
                                .catch(function (err) {
                                    res.status(500).send({ success: false, message: "Error while getting POI order" });
                                })
                        }
                        else {
                            res.status(400).send({ success: false, message: 'The user do not have 2 categories!' });
                        }
                    })
                    .catch(function (err) {
                        res.status(500).send({ success: false, message: "Error while getting POI order" });
                    })
            }
        })
        .catch(function (err) {
            res.status(500).send({ success: false, message: "Error while getting CategoryID" });
        })
};

/* This request is used for getting the point of interest order by totalRating*/
exports.POIOrder = function (req, res) { //router.get('/POI/POIOrder', function (req, res)
    var token = req.headers['x-access-token'] || req.body.token || req.query.token;
    if (!token) {
        res.status(400).send(({ success: false, message: "Something is worng....." }));
    }
    var user = GetUserByToken(token);
    if (!user) {
        res.status(400).send(({ success: false, message: "This user Token is incorrect" }));
    }
    var selectOrder = util.format("SELECT PID, POIName, category, description, countViews, landmark, img, totalRating FROM POI order by totalRating desc");
    DB.execQuery(selectOrder)
        .then(function (result) {
            res.status(200).send(result);
        })
        .catch(function (err) {
            res.status(500).send({ success: false, message: "Error while getting POI order" });
        })
};

/* This request is used for getting the favorites point of interest order of user by his filter (category ,totalRating ,user) */
exports.POIFavOrder = function POIFavOrder(req, res) {  //router.get('/POI/POIFavOrder', function (req, res)
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Content - Type, Accept");
    if (!req.body.Filter || (!(req.body.Filter === 'user') && !(req.body.Filter === 'category') && !(req.body.Filter === 'totalRating'))) {
        res.status(400).send(({ success: false, message: "Your filter is incorrect!" }));
    }
    else {
        var token = req.headers['x-access-token'] || req.body.token || req.query.token;
        if (!token) {
            res.status(400).send(({ success: false, message: "Something is worng....." }));
        }
        else {
            var user = GetUserByToken(token);
            if (!user) {
                res.status(400).send(({ success: false, message: "This user Token is incorrect" }));
            }
            if (req.body.Filter === 'user') {
                var selectOrder = util.format("SELECT A.PID FROM POI as A INNER JOIN POIForUser as B ON A.PID = B.PID WHERE B.UserName ='%s' order by B.orderByUser desc", user);
            }
            else if (req.body.Filter === 'category') {
                var selectOrder = util.format("SELECT A.PID FROM POI as A INNER JOIN POIForUser as B ON A.PID = B.PID WHERE B.UserName ='%s' order by A.category desc", user);
            }
            else {
                var selectOrder = util.format("SELECT A.PID FROM POI as A INNER JOIN POIForUser as B ON A.PID = B.PID WHERE B.UserName ='%s' order by A.totalRating desc", user);
            }
            DB.execQuery(selectOrder)
                .then(function (result) {
                    res.status(200).send(result);
                    console.log(user);
                })
                .catch(function (err) {
                    res.status(500).send({ success: false, message: "Error while getting POI order" });
                })
        }
    }
};


/* This function returns the suitable user name for current token */
function GetUserByToken(Token) {
    if (!Token) {
        return false;
    }
    try {
        var decoded = jwt.verify(Token, config.secret);
        return (decoded.UserName);
    }
    catch (e) {
        return false;
    }
}

