var Users = require('../models/Users');
var POI = require('../models/POI');
var reg = require('../models/reg');

module.exports = function (router) {

    /* POI MODEL  */

    router.get('/POI/getAllPOIs', POI.getAllPOIs);

    router.get('/POI/getPOIsByCategory', POI.getPOIsByCategory);

    router.get('/POI/ID', POI.ID);

    router.get('/POI/latestReviews/:PID', POI.latestReviews);

    router.put('/POI/updateCountViews', POI.updateCountViews);

    router.post('/POI/getFooterPOIs', POI.getFooterPOIs);

    router.post('/POI/getImages', POI.getImages);

    /* reg MODEL */

    router.get('/reg/POI/getLastSaved', reg.getLastSaved);

    router.post('/reg/POI/insertFavorite', reg.insertFavorite);

    router.get('/reg/POI/getPOIbyName', reg.getPOIbyName);

    router.post('/reg/getUserDetails', reg.getUserDetails);

    router.delete('/reg/POI/deleteFavorite', reg.deleteFavorite);

    router.get('/reg/POI/getFavorites', reg.getFavorites);

    router.post('/reg/POI/setFavoritesOrder', reg.setFavoritesOrder);

    router.post('/reg/POI/insertRating', reg.insertRating);

    router.post('/reg/POI/InsertReview', reg.InsertReview);

    router.get('/reg/POI/getCountFavorites', reg.getCountFavorites);

    router.get('/reg/POI/getRecommended', reg.getRecommended);

    router.get('/reg/POI/POIOrder', reg.POIOrder);

    router.post('/reg/POI/POIFavOrder', reg.POIFavOrder);

    /* Users MODEL */

    router.post('/Users/register', Users.register);

    router.post('/Users/login', Users.login);

    router.post('/Users/getRecoveryQuestions', Users.getRecoveryQuestions);

    router.post('/Users/restorePassword', Users.restorePassword);

    router.get('/Users/getCategories', Users.getCategories);

    router.get('/Users/getToken', Users.getToken);

    router.get('/Users/verify', Users.verify);

    router.get('/Users/getCountries', Users.getCountries);

    router.get('/Users/getRandomQuestions', Users.getRandomQuestions);

    return router;
}