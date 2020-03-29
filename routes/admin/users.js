const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const bcrypt = require('bcrypt');

router.get('/', function(req, res, next) {
    let c = req.app.db.collection('users');
    c.find({}).toArray(function(err, result) {
        res.render('admin/users/index', {
            title: 'User',
            users: result,
            layout: 'admin.hbs'
        });
    });
});


router.get('/new', function(req, res, next) {
    res.render('admin/users/new', {
        title: 'New User',
        layout: 'admin.hbs'
    });
});

router.get('/edit/:id', function(req, res, next) {
    let c = req.app.db.collection('users');
    console.log(req.params.id);
    c.findOne({_id: ObjectId(req.params.id)}, function(err, result) {
        res.render('admin/users/edit', {
            title: 'Edit User',
            user: result,
            layout: 'admin.hbs'
        });
    });
});

router.post('/edit', function(req, res, next) {
    let c = req.app.db.collection('users');
    bcrypt.hash(req.body.password, 10).then(function(hash) {
        // Store hash in your password DB.
        req.body.password = hash;
        if(!!req.body._id) {
            let id = req.body._id;
            delete req.body._id;
            c.updateOne({_id: ObjectId(id)}, {$set: req.body}, function(err, result) {
                res.redirect('/admin/users/edit/'+id);
            });
        }
        else {
            c.insertOne(req.body, function(err, result) {
                if (err) throw err;
                res.redirect('/admin/users/edit/'+result.insertedId);
            });

        }
    });
});


module.exports = router;
