// do not ask; hash is object for arguments
const fs = require('fs');
const path = require('path');
const configPathDefault= path.join(process.env.PWD, 'config', 'default.js');
const configPathNew = path.join(process.env.PWD, 'config', 'new.js');
const configPath = fs.existsSync(configPathNew) ? configPathNew : configPathDefault;
const config = require(configPath).config;
module.exports = {
    //{{#peng dinges='foo'}}{{/peng}}
    test: (a, b, c, options)=>{
        console.dir(a);
        console.dir(b);
        console.dir(c);
        console.dir(options);
        return [a, b, c].join();
    },
    customif: (options)=>{
        return (options.hash.expected === options.hash.val) ? options.fn(this) : options.inverse(this);
    },
    splitbrAtWordNum:  (str, wordNum) => {
        let sp = str.toString().split(' ');
        sp.splice(wordNum, 0, '<br>')
        return sp.join(' ');
    },
    toCurrency: c => {
        if (/de/i.test(config.theme.LC_ALL))
            return parseFloat(c)
                    .toFixed(2)
                    .replace(/\./g, ',')
                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.")
                + ' ' + config.theme.currency;
        return  config.theme.currency + ' ' +
                parseFloat(c)
                .toFixed(2)
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    }
};
