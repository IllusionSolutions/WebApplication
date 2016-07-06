var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var firebase = require("firebase");

//var routes = require('./routes/index');
//var users = require('./routes/users');


var routes = require('./routes/index');
var login = require('./routes/login');
var session = require('express-session');
var app = express();

var config = {
  apiKey: "AIzaSyD7ec7C79ogJZSJTiRvJLZJEEvywfYGg1Y",
  authDomain: "powercloud-bf968.firebaseapp.com",
  databaseURL: "https://powercloud-bf968.firebaseio.com",
  storageBucket: "powercloud-bf968.appspot.com",
};
firebase.initializeApp(config);

//app.use(express.static(path.join(__dirname, 'public')));

// look for view html in the views directory
app.set('views', path.join(__dirname, 'views'));

// use ejs to render
app.set('view engine', 'ejs');

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({resave: true, saveUninitialized: true, secret: 'SOMERANDOMSECRETHERE', cookie: { maxAge: 6000000 }}));

app.use('/', routes);
//app.use('/', routes);
//app.use('/users', users);
app.get('/login', login.get);
app.post('/login', login.post);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

//.constant('FirebaseUrl', 'https://powercloud-bf968.firebaseio.com/');