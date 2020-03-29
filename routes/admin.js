const express = require('express');
const router = express.Router();
const msanitize = require('mongo-sanitize');
const bcrypt = require('bcrypt');


router.get('/', (req, res, next) => {
    res.redirect('/admin/dashboard');
});

router.get(/^\/((?!login).)*$/i, (req, res, next) => {
    if (!req.session.admin) {
        res.redirect('/admin/login');
        return;
    }
    else {
        next();
    }
});

router.get('/login', (req, res, next) => {
    res.render('admin/login', {
        title: 'Login',
        layout: 'admin_login.hbs',
        logintriestohigh: !req.session.logintries ? false : req.session.logintries>8,
        error: false
    });
});

router.get('/login/:id', (req, res, next) => {
    res.render('admin/login', {
        title: 'Login',
        layout: 'admin_login.hbs',
        logintriestohigh: !req.session.logintries ? false : req.session.logintries>5,
        error: true
    });
});

router.post('/login', (req, res, next) => {
    req.session.logintries = !req.session.logintries ? 1 : req.session.logintries+1;
    let c = req.app.db.collection('users');
    c.findOne({email: msanitize(req.body.email)}, function(err, result) {
        if(!result || result === null){
            res.redirect('/admin/login/incorrect');
            return;
        }

        // we have a user under that email so we compare the password
        bcrypt.compare(req.body.password, result.password)
            .then((result) => {
                if(result){
                    req.session.user = result.email;
                    req.session.admin = true;
                    res.redirect('/admin/dashboard');
                    return;
                }
                res.redirect('/admin/login/incorrect');
                return;
            });
    });
});

router.get('/logout', (req, res, next) => {
    req.session.destroy(function (err) {
        res.redirect('/admin/login');
    })
});

module.exports = router;
