var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

//Genreral Routers
var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var applyRouter = require('./routes/apply');

//Admin Routers
var adminManageRouter = require('./routes/adminmanage');
var adminApplicationRouter = require('./routes/adminapplication');
var adminFeedbackRouter = require('./routes/adminfeedback');

//Instructor Routers
var instructorAssessmentsRouter = require('./routes/instructorassessments');
var instructorAttendenceRouter = require('./routes/instructorattendence');
var instructorCertificatesRouter = require('./routes/instructorcertificates');

//Social Worker Routers
var socialWorkerHistoryRouter = require('./routes/socialworkerhistory');
var socialWorkerNotificationsRouter = require('./routes/socialworkernotifications');
var socialWorkerScheduleRouter = require('./routes/socialworkerschedule');

//Sponsor Router
var sponsorPortalRouter = require('./routes/sponsorportal');

//Owner Router
var ownerPortalRouter = require('./routes/ownerportal');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist/")));
app.use(express.static(path.join(__dirname, "node_modules/bootstrap-icons/")));
app.use(express.static(path.join(__dirname, "node_modules/crypto-js/")));

//This will set up the database if it doesn't already exist
var dbCon = require('./lib/database');

// Session management to store cookies in a MySQL server (this has a bug, so we assist it by creating the database for it)
var dbSessionPool = require('./lib/sessionPool.js');
var sessionStore = new MySQLStore({}, dbSessionPool);

// Necessary middleware to store session cookies in MySQL
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret1234',
    store: sessionStore,
    resave: true,
    saveUninitialized: true,
  cookie : {
    sameSite: 'strict'
  }
}));

// Middleware to make session variables available in .ejs template files
app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/apply', applyRouter);

//Use Admin Pages
app.use('/adminmanage', adminManageRouter);
app.use('/adminapplication', adminApplicationRouter);
app.use('/adminfeedback', adminFeedbackRouter);

//Use Instructor Pages
app.use('/instructorassessments', instructorAssessmentsRouter);
app.use('/instructorattendence', instructorAttendenceRouter);
app.use('/instructorcertificates', instructorCertificatesRouter);

//Use Social Worker Pages
app.use('/socialworkerhistory', socialWorkerHistoryRouter);
app.use('/socialworkernotifications', socialWorkerNotificationsRouter);
app.use('/socialworkerschedule', socialWorkerScheduleRouter);

//Use Sponsor Page
app.use('/sponsorportal', sponsorPortalRouter);

//Use Owner Page
app.use('/ownerportal', ownerPortalRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
