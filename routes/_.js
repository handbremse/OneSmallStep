const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const clean = require('../helpers/clean');
const ld = require('lodash')

router.get('/', function(req, res, next) {
  // some Session things
  console.log(req.session, req.sessionID);
  next();
});

router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Homepage',
    session: req.session
  });
});

router.get('/shop', function(req, res, next) {
  let c = req.app.db.collection('products');
  c.find({status:true}).toArray(function(err, result) {
    let j = [];
    result.forEach((v,i)=>{
      v.mainimage = !!v.images?v.images[0]:false;
      j.push(clean(v));
    });
    res.render('shop', {
      title: 'Category Page',
      session: req.session,
      products: result,
      jsons: JSON.stringify(j)
    });
  });
});

router.get('/artikel/:id', function(req, res, next) {
  let c = req.app.db.collection('products');
  c.findOne({permalink: req.params.id}, (err, result) => {
    result.mainimage = !!result.images?result.images[0]:false;
    let j = clean(result);
    res.render('artikel', {
      title: 'Product Page',
      session: req.session,
      product: result,
      jsons: JSON.stringify(j)
    });
  });
});

module.exports = router;
