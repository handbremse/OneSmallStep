const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const clean = require('../helpers/clean');
const ld = require('lodash');

router.get('/', function(req, res, next) {
    // some Session things
    //console.log(req.session, req.sessionID);
    next();
});

router.post('/', function(req, res, next) {
    // make an item
    let items  = {};
    items[req.body.sku] = req.body;
    items[req.body.sku].create = new Date().getTime();
    items[req.body.sku].update = new Date().getTime();
    items[req.body.sku].qty = parseInt(req.body.qty, 10);
    items[req.body.sku].price = parseFloat(req.body.price);
    // call DB
    let c = req.app.db.collection('carts');
    let cid = req.session.customer &&  req.session.customer.id || req.sessionID;
    c.findOne({sid: cid}, function(err, result) {
        if (!!result) {
            // there is a cart
            // there is an item
            if (!!result.items[req.body.sku]) {
                let qty = result.items[req.body.sku].qty + parseInt(req.body.qty, 10); //update qty
                let create = result.items[req.body.sku].create; // prevent create
                result.items[req.body.sku] = items[req.body.sku];
                result.items[req.body.sku].create = create;
                result.items[req.body.sku].qty = qty;
            }
            // there is no item
            else {
                result.items[req.body.sku] = items[req.body.sku];
            }
            result.update = new Date().getTime();
            c.updateOne({_id: ObjectId(result._id)}, {$set: result}, function (err, result) {
                res.redirect('/cart');
            });
        } // there is no cart
        else {
            let cart = {
                sid: req.sessionID,
                create: new Date().getTime(),
                update: new Date().getTime(),
                items: items //the items
            };
            c.insertOne(cart, function (err, result) {
                if (err) throw err;
                res.redirect('/cart');
            });
        }
    });
});

router.get('/', function(req, res, next) {
    let c = req.app.db.collection('carts');
    let cid = req.session.customer &&  req.session.customer.id || req.sessionID;
    c.findOne({sid: cid}, function(err, result) {
        // only if there is an cart with items
        if(!!result && !!ld.size(result.items)){
            result.total = 0;
            ld.forEach(result.items, function (v, k) {
                v.subtotal = v.qty * v.price;
                result.total+=v.subtotal;
            });
        }
        else {
            result = {
                empty: true
            }
        }
        res.render('cart', {
            title: 'Cart',
            session: req.session,
            cart: result,
            jsons: JSON.stringify(result)
        });
    });
});

router.get('/edit/:id', function(req, res, next) {
    let c = req.app.db.collection('products');
    c.findOne({sku: req.params.id}, function(err, result) {
        res.redirect('/artikel/' + result.permalink);
    });
});

router.get('/remove/:id/qty/:qty', function(req, res, next) {
    let c = req.app.db.collection('carts');
    let cid = req.session.customer &&  req.session.customer.id || req.sessionID;
    c.findOne({sid: cid}, function(err, result) {
        if(req.params.qty == 0)delete result.items[req.params.id];
        else result.items[req.params.id].qty = parseInt(req.params.qty);
        c.updateOne({_id: ObjectId(result._id)}, {$set: result}, function(err, result) {
            res.redirect('/cart');
        });
    });
});

module.exports = router;
