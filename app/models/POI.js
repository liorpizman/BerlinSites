var express = require('express');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var DB = require("../DataBase");
var util = require('util');

var config = require('../config');

var exports = module.exports = {};

/* This request is used for returning all point of interests */
exports.getAllPOIs = function (req, res) {  //router.get('/getAllPOIs', function (req, res)
    var GetPOIQuery = "SELECT PID, POIName, category, description, countViews, landmark, img, totalRating FROM POI";
    DB.execQuery(GetPOIQuery)
        .then(function (result) {
            res.status(200).send(result);
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send({ success: false, message: "Error connecting to the database." });
        })
};

/* This request is used for returning all point of interests filtered by specific category */
exports.getPOIsByCategory = function (req, res) {  //router.get('/getPOIsByCategory', function (req, res)
    if (!req.body.categoryID) {
        res.status(400).send({ success: false, message: "category name is missing!" });
    }
    else {
        var category = req.body.categoryID;
        var GetPOIQuery = util.format("SELECT POIName, category, description, countViews, landmark, img, totalRating FROM POI WHERE category='%s' ", category);
        DB.execQuery(GetPOIQuery)
            .then(function (result) {
                if (result.length > 0) {
                    res.status(200).send(result);
                }
                else {
                    res.status(400).send(({ success: false, message: "There is no POI for this category" }));
                }

            })
            .catch(err => { //db connection error
                console.log(err);
                res.status(500).send({ success: false, message: "Error connecting to the database." });
            })
    }
};

/* This request is used for getting point of interest */
exports.ID = function (req, res) {  //router.get('/ID', function (req, res)
    var GetPOIQuery = util.format("SELECT * FROM POI WHERE PID = '%s'", req.body.PID);
    DB.execQuery(GetPOIQuery)
        .then(function (result) {
            if (result.length == 0) {
                res.status(400).send(({ success: false, message: "There is no POI for this ID " }));
            }
            else {
                res.status(200).send(result[0]);
            }
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send({ success: false, message: "Error connecting to the database." });
        })
};


/* This request returns two last reviews of a given PID for displaying it for the user (in suitable point of interest page) */
exports.latestReviews = function (req, res) {  //router.get('/latestReviews/:PID', function (req, res)
    console.log("req.params.PID: " + req.params.PID);
    var GetlatestReviews = util.format("SELECT TOP 2 * FROM POIReviews WHERE PID = '%s' order by DateReviewed desc", req.params.PID);
    DB.execQuery(GetlatestReviews)
        .then(function (result) {
            console.log("result: " + result);
            if (result.length == 0) {
                res.status(200).send(({ success: true, message: "There is no Review for this POI" }));
            }
            else if (result.length == 1) {
                res.status(200).send(({ success: true, message: "There is one Review for this POI" }));
            }
            else {
                res.status(200).send(result);
            }
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send({ success: false, message: "Error connecting to the database." });
        })
};

/* This request increases the num of views by 1 */
exports.updateCountViews = function (req, res) {  //router.put('/updateCountViews', function (req, res)
    var oldViewsQuery = util.format("SELECT countViews FROM POI WHERE PID = '%s'", req.body.PID);
    DB.execQuery(oldViewsQuery)
        .then(function (result) {
            if (result.length == 0) {
                res.status(400).send(({ success: false, message: "Something is wrong..." }));
            }
            else {
                var oldViews = Number(result[0]['countViews']);
                var updateViews = util.format("UPDATE POI SET countViews = '%s' WHERE PID = '%s'",
                    oldViews + 1,
                    req.body.PID
                );
                DB.execQuery(updateViews)
                    .then(function (secondResult) {
                        res.status(200).send(({ success: true, message: "The raw has been updated" }));
                    })
                    .catch(function (err) {
                        console.log(err);
                        res.status(500).send({ success: false, message: "Error connecting to the database." });
                    })
            }
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send({ success: false, message: "Error connecting to the database." });
        })
};

/* This request is used for getting 3 random popular points of interests, above the given rating */
exports.getFooterPOIs = function (req, res) {  //router.get('/getFooterPOIs', function (req, res)
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Content - Type, Accept");
    if (!req.body.rating) {
        res.status(400).send({ success: false, message: "rating filter is missing!" });
    }
    else {
        var GetPOIQuery = util.format("SELECT TOP 3 PID, POIName, category, description, countViews, landmark, img, totalRating FROM POI WHERE totalRating >'%s' ORDER BY NEWID() ", req.body.rating);
        DB.execQuery(GetPOIQuery)
            .then(function (result) {
                if (result.length > 0) {
                    res.status(200).send(result);
                }
                else {
                    res.status(400).send(({ success: false, message: "There is no POI for this rating" }));
                }
            })
            .catch(err => { //db connection error
                console.log(err);
                res.status(500).send({ success: false, message: "Error connecting to the database." });
            })
    }
};


/* This request is used for get all images for a given img ID of current point of view. */
exports.getImages = function (req, res) {  //router.get('/getImages', function (req, res)
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Content - Type, Accept");
    if (!req.body.imgID) {
        res.status(400).send({ success: true, message: "Img ID is missing!" });
    }
    else {
        var GetURLSQuery = util.format("SELECT url FROM ImgURL WHERE imgID = '%s'", req.body.imgID);
        DB.execQuery(GetURLSQuery)
            .then(function (result) {
                if (result.length > 0) {
                    res.status(200).send(result);
                }
                else {
                    res.status(400).send(({ success: false, message: "There is no URLS for this ID" }));
                }
            })
            .catch(err => { //db connection error
                console.log(err);
                res.status(500).send({ success: false, message: "Error connecting to the database." });
            })
    }
};





