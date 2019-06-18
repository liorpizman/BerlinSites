
var express = require('express');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var DB = require("../DataBase");
var util = require('util');
const xml2js = require('xml2js');
const fs = require('fs');


var config = require('../config');
var exports = module.exports = {};

/* This request adds information about new user to the server */
exports.register = function (req, res) {  //router.post('/register', function (req, res) 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Content - Type, Accept");
    if (!req.body.username || !req.body.password || !req.body.firstName || !req.body.lastName || !req.body.city
        || !req.body.country || !req.body.email || !req.body.retrievalQuestion1 || !req.body.retrievalQuestion2
        || !req.body.retrievalAnswer1 || !req.body.retrievalAnswer2 || !req.body.categoriesIDs) {
        res.status(400).send({ success: false, message: "Missing some details!" });
    }
    else {
        var categories = req.body.categoriesIDs;
        if (categories.length == 0) {
            res.status(400).send({ success: false, message: "You have not selected a category" });
        }
        else {
            var selecQuery = util.format("SELECT * FROM Users WHERE UserName='%s' ", req.body.username);
            DB.execQuery(selecQuery)
                .then(function (result) {
                    if (result.length > 0) {
                        res.status(200).send({ success: true, message: "User name already exists in the system!" });
                    } else {
                        var AddUserQuery = util.format("INSERT INTO Users VALUES ('%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s');",
                            req.body.username,
                            req.body.password,
                            req.body.firstName,
                            req.body.lastName,
                            req.body.city,
                            req.body.country,
                            req.body.email,
                            req.body.retrievalQuestion1,
                            req.body.retrievalAnswer1,
                            req.body.retrievalQuestion2,
                            req.body.retrievalAnswer2);
                        //console.log(AddUserQuery);   // for test
                        DB.execQuery(AddUserQuery)
                            .then(function (secondResult) {
                                var insertCategory;
                                for (i = 0; i < categories.length; i++) {
                                    insertCategory = util.format("INSERT INTO UsersCategory VALUES ('%s','%s');",
                                        req.body.username,
                                        categories[i]
                                    );
                                    DB.execQuery(insertCategory)
                                        .then(function (thirdResult) {
                                        })
                                        .catch((err) => {
                                            console.log(err);
                                            res.status(400).send({ success: false, message: "Error while adding category!" });
                                        })
                                }
                                res.status(200).send({ success: true, message: "User have been successfully added" });
                            })
                            .catch(err => { //db connection error
                                res.status(500).send({ success: false, message: "Error in creating category for user in db." });
                            })
                    }
                })
                .catch(err => { //db connection error
                    console.log(err);
                    res.status(500).send({ success: false, message: "Error connecting to the database." });
                })
        }
    }
};

/* This request verifies user’s details in the server without changing any information */
exports.login = function (req, res) {  //router.post('/login', function (req, res)
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Content - Type, Accept");
    if (!req.body.username || !req.body.password) {
        res.status(400).send({ success: false, message: "Missing some details!" });
    }
    else {
        var selecQuery = util.format("SELECT firstName FROM Users WHERE UserName='%s' AND Password='%s'",
            req.body.username,
            req.body.password);
        DB.execQuery(selecQuery)
            .then(function (result) {
                if (result.length > 0) {  // the userName and password are both correct
                    UpdateToken(result, req.body.username, res);
                } else { //the userName ore the password is incorrect
                    res.status(200).send({ success: true, message: "No match" });
                }
            })
            .catch(err => { //db connection error
                console.log(err);
                res.status(500).send({ success: false, message: "Error connecting to the database." });
            })
    }
};

/* This function updates the token of a current user name */
function UpdateToken(firstName, userName, res) {
    var payload = { UserName: userName }
    var token = jwt.sign(payload, config.secret, {
        expiresIn: 86400 // expires in 24 hours
    });
    // returns the information including token as JSON
    res.status(200).send({
        success: true,
        message: firstName,
        token: token
    });
}

/* This request returns the questions for retrieving user’s password */
exports.getRecoveryQuestions = function (req, res) { //router.post('/getRecoveryQuestions', function (req, res) 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Content - Type, Accept");
    if (!req.body.username) {
        res.status(400).send({ success: false, message: "user name is missing!" });
    }
    else {
        var RecoveryQuestionsQuery = util.format("SELECT question1, question2 FROM Users WHERE UserName='%s'", req.body.username);
        DB.execQuery(RecoveryQuestionsQuery)
            .then((result) => {
                if (result.length > 0) {
                    res.status(200).send(result);
                }
                else {
                    res.status(200).send({ success: true, message: "There is no suitable user name is the system!" });
                }
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({ success: false, message: "Error while connecting to db" });
            })
    }
};

/* This request verifies the answers to the questions and returns the password if there is verification */
exports.restorePassword = function (req, res) {  //router.post('/restorePassword', function (req, res)
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Content - Type, Accept");
    if (!req.body.username) {
        res.status(400).send({ success: false, message: "User name is missing!" });
    }
    else if (!req.body.retrievalAnswer1 || !req.body.retrievalAnswer2) {
        res.status(400).send({ success: false, message: "Answer is missing!" });
    }
    else {
        var PasswordRecoveryQuery = util.format("SELECT Password FROM Users WHERE UserName='%s' AND Answer1='%s' AND Answer2='%s'",
            req.body.username,
            req.body.retrievalAnswer1,
            req.body.retrievalAnswer2
        );
        DB.execQuery(PasswordRecoveryQuery)
            .then(function (result) {
                if (result.length == 0) {
                    res.status(200).send({ success: true, message: "Your answers are incorrect!" });
                }
                else {
                    res.status(200).send(result[0]);
                }
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({ success: false, message: "Error while connecting to db" });
            })
    }
};

/* This request returns all possible categories of the city */
exports.getCategories = function (req, res) {  //router.get('/getCategories', function (req, res) 
    var selecQuery = util.format("SELECT * FROM Categories");
    DB.execQuery(selecQuery)
        .then(function (result) {
            if (result.length == 0) {
                console.log("There was a problem while trying to find the categories");
                res.json({ success: false, message: "There was a problem while trying to find the categories" })
            } else {
                res.status(200).send(result);
            }
        })
        .catch(err => { //db connection error
            console.log("Error connecting to the database.");
            res.json({ success: false, message: "Error connecting to the database." });
        })
};

/* This request returns current token for current user */
exports.getToken = function (req, res) {  // router.get('/getToken', function (req, res) 
    var token = req.headers['x-access-token'] || req.body.token || req.query.token;
    if (token) {
        var decoded = jwt.verify(token, config.secret);
        res.status(200).send({ success: true, messsage: 'You got a token', token: decoded.UserName });
    }
    else {
        res.status(404).send({ success: false, message: 'Failed to authenticate token.' });
    }
};

/* This request verifies current token for a user name */
exports.verify = function (req, res, next) {  //router.get('/verify', function (req, res, next)
    var token = req.headers['x-access-token'] || req.body.token || req.query.token;
    // console.log(token);
    var decoded = jwt.verify(token, config.secret);
    // console.log(decoded.UserName);
    res.status(200).send(decoded.UserName);
};

/* This request returns JSON array of countries that were read from XML file */
exports.getCountries = function (req, res) {  //router.get('/getCountries', function (req, res)
    const parser = new xml2js.Parser();
    let xml_string = fs.readFileSync("countries.xml", "utf8");
    parser.parseString(xml_string, function (error, result) {
        if (error === null) {
            res.status(200).send(result);
        }
        else {
            console.log(error);
            res.status(400).send({ success: false, message: 'Failed to read xml file' });
        }
    });
};


/* This request returns JSON array of 2 random questions */
exports.getRandomQuestions = function (req, res) { //router.get('/getRandomQuestions', function (req, res) 
    var GetQuestionsQuery = util.format("SELECT TOP 2 questionDescription FROM Questions ORDER BY NEWID() ");
    DB.execQuery(GetQuestionsQuery)
        .then(function (result) {
            if (result.length > 0) {
                res.status(200).send(result);
            }
            else {
                res.status(400).send(({ success: false, message: "There is no Questions" }));
            }
        })
        .catch(err => { //db connection error
            console.log(err);
            res.status(500).send({ success: false, message: "Error connecting to the database." });
        })
};
