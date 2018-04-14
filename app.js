var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
app.locals.pretty = true;

var index = require('./routes/index');
var auth = require('./routes/auth')(app);
var lost = require('./routes/lost');
var find = require('./routes/find');
var items = require('./routes/items');
var manage = require('./routes/manage');
var statistics = require('./routes/statistics');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'uploads_temp')));
app.use('/scripts', express.static(__dirname + '/node_modules/vue/dist'));
app.use('/scripts', express.static(__dirname + '/node_modules/vuetify/dist'));
app.use('/styles', express.static(__dirname + '/node_modules/vuetify/dist'));
app.use('/scripts', express.static(__dirname + '/node_modules/axios/dist'));
app.use('/scripts', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/scripts', express.static(__dirname + '/node_modules/chart.js/dist'));
app.use('/scripts', express.static(__dirname + '/node_modules/vue-observe-visibility/dist'));

app.use('/', index);
app.use('/auth', auth);
app.use('/lost', lost);
app.use('/find', find);
app.use('/items', items);
app.use('/manage', manage);
app.use('/statistics', statistics);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

app.use(function(req, res, next){
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.render('404', { url: req.url });
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
