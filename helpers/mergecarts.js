module.exports = (c, sid, cid, cb) => {
    const ld = require('lodash');
    c.findOne({sid: sid}, (err, cartSession) => {
        c.findOne({sid: cid}, (err, cartCustomer) => {
            if(!cartCustomer && !!cartSession){
                // no CustomerCart set id to customerID
                c.updateOne({sid: sid}, {$set: {sid: cid}}, (err, result) => {
                    c.findOne({sid: cid}, (err, result) => {
                        return cb(null, result);
                    });
                });
            }
            else if(!cartSession && !!cartCustomer) {
                // there is customerCart to return; no merging
                return cb(null, cartCustomer);
            }
            else if(!!cartSession && !!cartCustomer){
                // merge the carts // the max is for qty max integer
                let m = ld.mergeWith(cartSession, cartCustomer, (s,c)=>{if(parseInt(s) === s && s+c<20)return Math.max(s,c)});
                c.deleteOne({sid: sid}, (err, result) => {
                    // delete the sessionCart
                   return cb(null, m);
                });
            }
            else {
                return cb(new Error('there is no cart in database'), null);
            }
        });
    });
};
