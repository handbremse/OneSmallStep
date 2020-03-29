// core
const fs = require('fs');
const config = {
    mongo: {
        host: 'mongodb://localhost:27017'
    }
};
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(config.mongo.host, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

client.connect(err => {
    console.log("Connected successfully to database");
    const db = client.db('tryeshop');
    let datas = JSON.parse(fs.readFileSync('./___/export.txt'));
    let cnt = 0;
    let limit = 0;
    // first count limit
    datas.forEach(function (list) {
        list.data.forEach(function (v) {
            limit++;
        });
    });
    datas.forEach(function (list) {
        list.data.forEach(function (v) {
            db.collection(list.collection)
                .insertOne(v, function(err, result) {
                    if (err) throw err;
                    cnt++;
                    console.log(cnt + ' of ' + limit);
                    if(cnt >= limit ) {
                        client.close();
                    }
                });
        });
    });
});
