const fs = require('fs');
const path = require('path');
const configPathDefault= path.join(process.env.PWD, 'config', 'default.js');
const configPathNew = path.join(process.env.PWD, 'config', 'new.js');
const configPath = fs.existsSync(configPathNew) ? configPathNew : configPathDefault;
const config = require(configPath).config;
const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join('public', config.theme.name, 'products'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
const upload = multer({ storage: storage })

router.get('/', function(req, res, next) {
    let c = req.app.db.collection('products');
    c.find({}).toArray(function(err, result) {
        res.render('admin/products/index', {
            title: 'Products',
            products: result,
            layout: 'admin.hbs'
        });
    });
});


router.get('/new', function(req, res, next) {
    res.render('admin/products/new', {
        title: 'New Product',
        layout: 'admin.hbs',
        currency: config.theme.currency
    });
});

router.get('/edit/:id', function(req, res, next) {
    let c = req.app.db.collection('products');
    c.findOne({_id: ObjectId(req.params.id)}, function(err, result) {
        result.permalink = result.permalink || result.name.toLowerCase().replace(/[^\x1F-\x7F]+/ig, '').replace(/[\s\/]/ig, '').replace();
        res.render('admin/products/edit', {
            title: 'Edit Product',
            product: result,
            layout: 'admin.hbs',
            currency: config.theme.currency
        });
    });
});

router.post('/edit', function(req, res, next) {
    req.body.status = !!parseInt(req.body.status, 10);
    let c = req.app.db.collection('products');
    if(!!req.body._id) {
        let id = req.body._id;
        req.body.price = parseFloat(parseFloat(req.body.price).toFixed(2));
        delete req.body._id;
        c.updateOne({_id: ObjectId(id)}, {$set: req.body}, function(err, result) {
            res.redirect('/admin/products/edit/'+id);
        });
    }
    else {
        c.insertOne(req.body, function(err, result) {
            if (err) throw err;
            res.redirect('/admin/products/edit/'+result.insertedId);
        });
    }
});

router.post('/upload', upload.single('uploadFile'), (req, res, next) => {
    let c = req.app.db.collection('products');
    c.updateOne({_id: ObjectId(req.body._id)}, {"$push": {images: req.file.originalname}}, function(err, result) {
        res.redirect('/admin/products/edit/'+req.body._id);
    });
});

router.get('/removeimage/:id/p/:path', (req, res, next) => {
    let c = req.app.db.collection('products');
    c.updateOne({_id: ObjectId(req.params.id)}, {"$pull": {images: req.params.path}}, function(err, result) {
        res.redirect('/admin/products/edit/'+req.params.id);
    });
});

router.get('/remove/:id', (req, res, next) => {
    let c = req.app.db.collection('products');
    c.deleteOne({_id: ObjectId(req.params.id)}, function(err, obj) {
        res.redirect('/admin/products');
    });
});

module.exports = router;
