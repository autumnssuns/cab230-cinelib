var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var bcrypt = require('bcrypt');

/**
 * Hashes a password using bcrypt
 * @param {*} password 
 */
function hashPassword(password) {

}

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

async function registerUser(knex, email, password) {
  // TODO: Hash password

  if (!email || !password) {
    throw new Error("Request body incomplete, both email and password are required");
  }
  // Check if user already exists
  const user = await knex('users')
    .where('email', email)
    .first();

  console.log(user);
  // If user exists, throw error
  if (user) {
    throw new Error("User already exists");
  }
  // If user does not exist, insert user
  return knex('users')
    .insert({
      email: email,
      password: password
    });
}

async function loginUser(knex, email, password, longExpiry = false) {
  // TODO: Hash password

  if (!email || !password) {
    throw new Error("Request body incomplete, both email and password are required");
  }
  // Check if correct credentials. Throw error if not correct
  const user = await knex('users')
    .where('email', email)
    .where('password', password)
    .first();
  if (!user) {
    throw new Error("Incorrect email or password");
  }
  // Create the tokens
  const [bearerToken, bearerIat, bearerExp] = createBearerToken(email, longExpiry);
  const [refreshToken, refreshIat, refreshExp] = createRefreshToken(email, longExpiry);

  // Find the user's session in the database
  const session = await knex('sessions')
    .where('email', email)
    .first();
  
  // If the session exists, update the tokens
  if (session) {
    await knex('sessions')
      .where('email', email)
      .update({
        bearer_exp: bearerExp,
        refresh_exp: refreshExp
      });
  } else {
    // If the session does not exist, create it
    await knex('sessions')
      .insert({
        email: email,
        bearer_exp: bearerExp,
        refresh_exp: refreshExp
      });
  }

  // Return the tokens
  return {
    bearerToken: {
      token: bearerToken,
      token_type: 'Bearer',
      expires_in: bearerExp - bearerIat
    },
    refreshToken: {
      token: refreshToken,
      token_type: 'Bearer',
      expires_in: refreshExp - refreshIat
    }
  };
}

// JSON-WEB-TOKEN
function createBearerToken(email, longExpiry) {
  // Create the token
  const token = jwt.sign({
    email: email
  }, process.env.JWT_SECRET, {
    expiresIn: longExpiry ? '365d' : '10m'
  });

  // Get the iat and exp values from the token
  const {
    iat,
    exp
  } = jwt.decode(token);

  return [token, iat, exp];
}

function createRefreshToken(email, longExpiry) {
  // Create the token
  const token = jwt.sign({
    email: email
  }, process.env.JWT_SECRET, {
    expiresIn: longExpiry ? '365d' : '1d'
  });

  // Get the iat and exp values from the token
  const {
    iat,
    exp
  } = jwt.decode(token);

  return [token, iat, exp];
}

/* --- POST register a new user. --- */
router.post('/register', function(req, res, next) {
  // Get the email and password from the request
  const email = req.body.email;
  const password = req.body.password;

  // Get the knex instance from the request
  const knex = req.db;

  registerUser(knex, email, password)
    .then(() => {
      res.status(201).json({
        message: 'User created'
      });
    }).catch(error => {
      if (error.message.match('User already exists')) {
        res.status(409).json({
          error: true,
          message: error.message
        });
      } else {
        res.status(400).json({
          error: true,
          message: error.message
        });
      }
    });
});

/* --- POST login a user. --- */
router.post('/login', function(req, res, next) {
  // Get the email and password from the request
  const email = req.body.email;
  const password = req.body.password;

  // Get the knex instance from the request
  const knex = req.db;

  loginUser(knex, email, password)
    .then(tokens => {
      res.status(200).json(tokens);
    }).catch(error => {
      const status = error.message.match('Incorrect email or password') ? 401 : 400;
      res.status(status).json({
        error: true,
        message: error.message
      });
    });
});
module.exports = router;