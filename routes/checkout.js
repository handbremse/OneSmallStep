const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const ld = require('lodash');

router.get('/', function(req, res, next) {
    //console.log(req.session.customer);
    if(!req.session.customer) {
        req.session.afterlogin = '/cart';
        res.redirect('/customer/login');
        return;
    }
    res.redirect('/checkout/payment');
});

router.get('/payment', function(req, res, next) {
    let c = req.app.db.collection('customers');
    c.findOne({_id: ObjectId(req.session.customer.id)}, (err, result) => {
        res.render('checkout/payment', {
            title: 'Checkout Payment',
            session: req.session,
            customer: result
        });
    });
});

router.get('/shipping', function(req, res, next) {
    let c = req.app.db.collection('customers');
    c.findOne({_id: ObjectId(req.session.customer.id)}, (err, result) => {
        res.render('checkout/shipping', {
            title: 'Checkout Shipping',
            session: req.session,
            customer: result
        });
    });
});

router.get('/success', function(req, res, next) {
    let c = req.app.db.collection('carts');
    c.findOne({sid: req.session.customer.id}, (err, result) => {
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
        res.render('checkout/success', {
            title: 'Checkout Success',
            session: req.session,
            order: result
        });
    });
});

router.post('/payment/check', function(req, res, next) {
    let c = req.app.db.collection('customers');
    c.updateOne({_id: ObjectId(req.session.customer.id)}, {$push: {payments: req.body}}, (err, result) => {
        let ct = req.app.db.collection('carts');
        ct.updateOne({sid: req.session.customer.id}, {$set: {payment: req.body.payment}}, function (err, result) {
            res.redirect('/checkout/shipping');
        });
    });
});

router.post('/shipping/check', function(req, res, next) {
    let c = req.app.db.collection('customers');
    c.updateOne({_id: ObjectId(req.session.customer.id)}, {$push: {addresses: req.body}}, (err, result) => {
        let ct = req.app.db.collection('carts');
        ct.updateOne({sid: req.session.customer.id}, {$set: {addresses: req.body}}, (err, result) => {
            res.redirect('/checkout/success');
        });
    });
});

module.exports = router;
