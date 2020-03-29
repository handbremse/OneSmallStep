const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const clean = require('../helpers/clean');
const bcrypt = require('bcrypt');


router.get('/', function(req, res, next) {
    // some Session things
    next();
});

router.get('/register', function(req, res, next) {
    res.render('customer/register', {
        title: 'Register',
        session: req.session
    });
});

router.post('/register/submit', function(req, res, next) {
    let c = req.app.db.collection('customers');
    c.findOne({email:req.body.email}, (err, result) => {
        if(!!result) {
            req.session.customer = {
                login: false,
                email: req.body.email,
                invalidregisteremail: true
            };
            res.redirect('/customer/register');
        }
        else {
            bcrypt.hash(req.body.password, 10).then(function(hash) {
                // Store hash in your password DB.
                req.body.password = hash;
                delete req.body.repeatpassword;
                c.insertOne(req.body, function(err, result) {
                    if(err)console.error(err);
                    req.session.customer = {
                        login: true,
                        email: req.body.email,
                        name: req.body.firstname + ' ' + req.body.name,
                        invalidregisteremail: false
                    };
                    res.redirect('/customer/account/');
                });
            });
        }
    });
});

router.get('/logout', function(req, res, next) {
    req.session.destroy(function (err) {
        res.render('customer/logout', {
            title: 'Logged out',
            session: req.session
        });
    });
});

router.get('/account', function(req, res, next) {
    res.render('customer/account', {
        title: 'Customer Account',
        session: req.session
    });
});

router.get('/login', function(req, res, next) {
    res.render('customer/login', {
        title: 'Sign in',
        session: req.session
    });
});

router.get('/loginpassword', function(req, res, next) {
    res.render('customer/loginpassword', {
        title: 'Enter Password',
        session: req.session
    });
});

router.post('/login/password/submit', function(req, res, next) {
    let c = req.app.db.collection('customers');
    c.findOne({email:req.session.customer.email}, (err, result) => {
        if(!result) {
            req.session.customer = {
                login: false,
                invalidloginemail: true
            };
            res.redirect('/customer/login');
        }
        else {
            // we have a user under that email so we compare the password
            if(!!result.password){
                bcrypt.compare(req.body.password, result.password)
                    .then((rslt) => {
                        if(rslt){
                            req.session.customer = {
                                email: result.email,
                                name: result.firstname + ' ' + result.name,
                                login: true,
                                invalidloginpassword: false,
                            };
                            res.redirect('/customer/account');
                        }
                        else {
                            req.session.customer.invalidloginpassword = true;
                            res.redirect('/customer/loginpassword');
                        }
                    });
            }
            else {
                req.session.customer.invalidloginpassword = true;
                res.redirect('/customer/loginpassword');
            }
        }
    });
});

router.post('/login/email/submit', function(req, res, next) {
    let c = req.app.db.collection('customers');
    c.findOne({email:req.body.email}, (err, result) => {
        if(!result) {
            req.session.customer = {
                login: false,
                invalidloginemail: true
            };
            res.redirect('/customer/login');
        }
        else {
            req.session.customer = {
                email: result.email
            };
            res.redirect('/customer/loginpassword');
        }
    });
});

router.get('/forgotpassword', function(req, res, next) {
    res.render('customer/forgotpassword', {
        title: 'Forgot Password',
        session: req.session
    });
});

router.post('/forgotpassword/submit', function(req, res, next) {
    let c = req.app.db.collection('customers');
    c.findOne({email:req.body.email}, (err, result) => {
        if(!result) {
            req.session.customer = {
                login: false,
                invalidforgotemail: true
            };
            res.redirect('/customer/forgotpassword');
        }
        else {
            req.session.customer = {
                login: false,
                invalidforgotemail: false,
            };
            res.redirect('/customer/forgotpassword/sent');
        }
    });
});

router.get('/forgotpassword/sent', function(req, res, next) {
    res.render('customer/forgotpassword_sent', {
        title: 'Password sent',
        session: req.session
    });
});

router.get('/service', function(req, res, next) {
    res.render('customer/service', {
        title: 'Customer Servicer'
    });
});

router.post('/destroy', function(req, res, next) {
    req.session.destroy(function (err) {
        res.json({message: 'Customer destroyed' })
    });
});

module.exports = router;
