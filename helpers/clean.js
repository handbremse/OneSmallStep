module.exports = o => {
    let c = {};
    for(let k in o) {
        if(!/^description/i.test(k))c[k] = o[k];
    }
    return c;
};
