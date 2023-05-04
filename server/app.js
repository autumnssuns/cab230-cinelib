var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Added dotenv for environment variables
const dotenv = require('dotenv');
dotenv.config();

var usersRouter = require('./routes/users');
var moviesRouter = require('./routes/movies');

var app = express();

// Added swagger documentation
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// Set up knex
const options = require('./knexfile.js');
const knex = require('knex')(options);
const cors = require('cors');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Added cors 
app.use(cors());

// Add knex to the request
app.use((req, res, next) => {
  req.db = knex;
  next()
});

// Setup routes
app.use('/user', usersRouter);
app.use('/movies', moviesRouter);
// Set up swagger route
app.use('/', swaggerUI.serve, swaggerUI.setup(swaggerDocument, {
  swaggerOptions: { defaultModelsExpandDepth: -1 }, // Hide the Schemas
}));

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

  req.db = knex;
  next()
});

module.exports = app;