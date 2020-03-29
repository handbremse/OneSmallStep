// core
const ld = require('lodash');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const debug = require('debug')('shop:server');
// config
const configPathDefault= path.join(process.env.PWD, 'config', 'default.js');
const configPathNew = path.join(process.env.PWD, 'config', 'new.js');
const configPath = fs.existsSync(configPathNew) ? configPathNew : configPathDefault;
const config = require(configPath).config;
// server
const http = require('http');
const https = require('https');
const createError = require('http-errors');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const MongoStore = require('connect-mongo')(session);
const logger = require('morgan');
let handlebars = require('express-handlebars');
let handlebarshelpers = require('./helpers/handlebars');
// database
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(config.mongo.host, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let app = express();
app.config = config;

client.connect(err => {
  assert.equal(null, err);
  console.log("Connected successfully to database");
  const db = client.db('eshop');
  app.db = db;
  app.use((req, res, next) => {
    req.app = app;
    next();
  });
});

// view engine setup
app.set('views', path.join(__dirname, 'views', 'default'));
app.engine('hbs', handlebars({
  extname: 'hbs',
  layoutsDir: path.join(__dirname, 'views', 'default', 'layouts'),
  defaultLayout: 'eshop.hbs',
  partialsDir: [path.join(__dirname, 'views', 'default')],
  helpers: handlebarshelpers
}));
app.set('view engine', 'hbs');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    url: config.mongo.host+'/sessions',
    ttl: 30 * 24 * 60 * 60 // => first is  days
  }),
  cookie: {
    path: '/',
    httpOnly: true,
    secure: false,
    maxAge: 30 * 24 * 60 * 60 * 1000 // => first is  days
  },
  genid: function(req) {
    return uuidv4()
  },
}));
app.use(express.static(path.join(__dirname, 'public', 'default')));

/*
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
 */

app.use('/', require('./routes/index'));
app.use('/customer', require('./routes/customer'));
app.use('/admin', require('./routes/admin'));
app.use('/admin/products', require('./routes/admin/products'));
app.use('/admin/orders', require('./routes/admin/orders'));
app.use('/admin/customers', require('./routes/admin/customers'));
app.use('/admin/dashboard', require('./routes/admin/dashboard'));
app.use('/admin/users', require('./routes/admin/users'));


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


let server = http.createServer(app);
server.listen(80);



server.on('error', onError => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  let bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
});

server.on('listening', () => {
  let addr = server.address();
  let bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
  debug('Listening on ' + bind);
});


module.exports = app;


