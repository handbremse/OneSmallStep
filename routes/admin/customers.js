var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
    req.session.hits = !!req.session.hits ? req.session.hits+1 : 1;
    res.render('admin/customers/index', {
        title: 'Customers',
        layout: 'admin.hbs'
    });
});

module.exports = router;
