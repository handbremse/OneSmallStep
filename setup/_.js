// core
const fs = require('fs');
const config = {
    mongo: {
        host: 'mongodb://localhost:27017'
    }
};

console.log('Start Agile&JS+E-Com SETUP - - - - - - - - - - ');

const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(config.mongo.host, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});




client.connect(err => {
    console.log("Connected to database");
    if(!!err)return console.error('NO DATABASE CONNECTION');
    const db = client.db('onesmallstep');
    console.log("read install file");
    let datas = JSON.parse(fs.readFileSync('./setup/sample_db.txt'));
    datas.push({ //add a sample User admin@admin.admin // admin
        collection: "users",
        data: [
            {
                name: "Admin Admin",
                email: "admin@admin.admin",
                password: "$2b$10$8hGYxdwFK8onbI/nGloVeOaDPoM17eZ4rk0VT6upshnBdj.Em/b6a"
            }
        ]
    });
    let cnt = 0;
    let limit = 0;
    console.log("counting documents");
    // first count limit
    datas.forEach(function (list) {
        list.data.forEach(function (v) {
            limit++;
        });
    });
    console.log("installing documents");
    datas.forEach(function (list) {
        list.data.forEach(function (v) {
            db.collection(list.collection)
                .insertOne(v, function(err, result) {
                    if (err) throw err;
                    cnt++;
                    console.log(cnt + ' of ' + limit);
                    if(cnt >= limit ) {
                        client.close();
                        copyFiles();
                    }
                });
        });
    });
});


let copyFiles = function() {
    let filelist = fs.readdirSync('./setup/sample_product_images');
    console.log("counting files");
    console.log("installing files");
    filelist.forEach(v=>fs.copyFileSync('./setup/sample_product_images/'+v, './public/default/products/'+v));
    console.log('End Agile&JS+E-Com SETUP - - - - - - - - - - ');
    console.log(' - - - - - - - - - - ');
    console.log('- - - - - - - - - - ');
    console.log(' - - - - - - - - - - ');
    console.log('- - - - - - - - - - ');
    console.log(' Please install nodemon by:');
    console.log('npm install -g nodemon');
    console.log(' - - - - - - - - - - ');
    console.log('run Agile&JS+E-Com by:');
    console.log('nodemon');
    console.log(' - - - - - - - - - - ');
    console.log('Goto Browser: http://localhost');
    console.log('For Admin goto Browser : http://localhost/admin');
    console.log('E-Mail: admin@admin.admin -- Password: admin');
};
