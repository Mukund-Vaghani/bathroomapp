var express = require('express');
var router = express.Router();
var middleware = require('../../../middleware/validation');
var auth = require('./place');

router.post('/addplace', function (req, res) {
    var request = req.body;
    // middleware.decryption(req.body, function (request) {
    var rules = {
        user_id: 'required|numeric',
        name: 'required',
        about: 'required',
        location: 'required|string',
        latitude: 'required',
        longitude: 'required'
    }

    var message = {
        require: req.language.reset_keyword_required_message
    }

    if (middleware.checkValidationRules(res, request, rules, message)) {
        auth.addplace(request, function (code, message, data) {
            middleware.send_response(req, res, code, message, data);
        })
    }
    // })
})

router.post('/addrating', function (req, res) {
    var request = req.body;
    // middleware.decryption(req.body, function (request) {

        var rules = {
            user_id: 'required',
            place_id: 'required',
            review: '',
            rating: 'required|numeric|between:1,5'
        }

        var message = {
            require: req.language.reset_keyword_required_message
        }
        if (middleware.checkValidationRules(res, request, rules, message)) {
            auth.addPlaceRating(request, function (code, message, data) {
                middleware.send_response(req, res, code, message, data);
            })
        }
    // })
})

router.post('/getplacedetail', function(req,res){
    var id = req.user_id;
    var request = req.body;
    // middleware.decryption(req.body, function (request) {

        var rules = {
            // user_id: 'required',
            place_id: 'required',
        }

        var message = {
            require: req.language.reset_keyword_required_message
        }
        if (middleware.checkValidationRules(res, request, rules, message)) {
            auth.getPlace(request,id, function (code, message, data) {
                middleware.send_response(req, res, code, message, data);
            })
        }
    // })
})

router.post('/home', function(req,res){
    var id = req.user_id;
    var request = req.body;
    // middleware.decryption(req.body, function (request) {

        var rules = {
            // user_id: 'required',
            search: '',
        }

        var message = {
            require: req.language.reset_keyword_required_message
        }
        if (middleware.checkValidationRules(res, request, rules, message)) {
            auth.homePage(request,id, function (code, message, data) {
                middleware.send_response(req, res, code, message, data);
            })
        }
    // })
})

module.exports = router;