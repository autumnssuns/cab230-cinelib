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
var peopleRouter = require('./routes/people');

var app = express();

// Added swagger documentation
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// Set up knex based on the environment
const options = require('./knexfile')[process.env.NODE_ENV || 'development'];
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

// Set up swagger route
app.use('/', swaggerUI.serve);
app.get('/', swaggerUI.setup(swaggerDocument, {
  swaggerOptions: { defaultModelsExpandDepth: -1 }, // Hide the Schemas
}))

// Setup routes
app.use('/user', usersRouter);
app.use('/movies', moviesRouter);
app.use('/people', peopleRouter);

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
  res.json({ error: true, message: err.status == 404 ? "Page not found!" : "An unexpected error has occurred." });

  req.db = knex;
  next()
});

module.exports = app;