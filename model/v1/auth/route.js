var express = require('express');
var router = express.Router();
var middleware = require('../../../middleware/validation');
var auth = require('./auth_model');
var multer = require('multer');
var path = require('path');
const { request } = require('http');

router.post('/signup', function (req, res) {
    var request = req.body;
    // middleware.decryption(req.body, function (request) {
    var rules = {
        login_type: 'required|in:s,f,g',
        social_id: 'required_if:login_type,f,g',
        user_name: 'required',
        email: 'required|email',
        password: 'required_if:login_type,s'
    }

    var message = {
        require: req.language.reset_keyword_required_message,
        email: req.language.reset_keyword_invalid_email_message
    }

    if (middleware.checkValidationRules(res, request, rules, message)) {
        auth.signup(request, function (code, message, data) {
            middleware.send_response(req, res, code, message, data);
        })
    }
    // })
})

router.post('/login', function (req, res) {
    var request = req.body;
    // middleware.decryption(req.body, function (request) {
    var rules = {
        login_type: 'required|in:s,f,g',
        email: 'required|email',
        password: 'required_if:login_type,s'
    }

    var message = {
        require: req.language.reset_keyword_required_message,
        email: req.language.reset_keyword_invalid_email_message
    }

    if (middleware.checkValidationRules(res, request, rules, message)) {
        auth.loginUser(request, function (code, message, data) {
            middleware.send_response(req, res, code, message, data);
        })
    }
    // })
})

router.post("/logout", function (req, res) {
    var request = req.body;
    // middleware.decryption(req.body, function (request) {

    auth.logoutUser(request, function (code, message, data) {
        middleware.send_response(req, res, code, message, data);
    })
    // })
})

// forgot password
router.post('/forgotpass', function (req, res) {
    var request = req.body;

    // middleware.decryption(req.body, function (request) {
    var rules = {
        email: 'required|email'
    }

    var message = {
        require: req.language.reset_keyword_required_message,
        email: req.language.reset_keyword_invalid_email_message
    }

    if (middleware.checkValidationRules(res, request, rules, message)) {
        auth.forgotpassword(request, function (code, message, data) {
            middleware.send_response(req, res, code, message, data);
        })
    }
    // })
})

router.get('/resetform/:id', function (req, res) {
    auth.getUserDetail(req.params.id, function (userdata) {
        if (userdata != null) {
            var token_time = userdata[0].token_time;
            var current_time = new Date();
            var diffTime = current_time.getHours() - token_time.getHours();
            if (diffTime < '1') {
                if (userdata[0].is_forgot == '1') {
                    res.render('forgotpass.html', { id: req.params.id });
                } else {
                    res.send(req.language.reset_keyword_link_used);
                }
            } else {
                res.send(req.language.reset_keyword_link_expired);
            }
        } else {
            console.log(req.language.reset_keyword_something_wrong_message);
        }
    })
})

router.post('/resetpass/:id', function (req, res) {

    var request = req.body;
    var id = req.params.id;
    auth.getUserDetail(id, function (user_data) {
        if (user_data[0].is_forgot == '1') {
            auth.resetpassword(request, id, function (code, message, data) {
                middleware.send_response(req, res, code, message, data);
            })
        } else {
            res.send(req.language.reset_keyword_link_used);
        }
    })
})

module.exports = router;