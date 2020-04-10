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
    const db = client.db('eshop');
    let collections = [
        'products'
        //user will be done in import script
    ];
    let datas = [];
    let cnt = 0;
    collections.forEach(function (v) {
        db.collection(v)
            .find({}, {projection:{_id:0}})
            .toArray((err, data) => {
                if (err) throw err;
                console.log(data);
                datas.push({
                    collection: v,
                    data: data
                });
                cnt++;
                if(collections.length >= cnt) {
                    fs.writeFileSync('./setup/sample_db.txt', JSON.stringify(datas));
                    client.close();
                }
            });
    })
});
