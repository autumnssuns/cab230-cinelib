var express = require("express");
var jwt = require("jsonwebtoken");
var router = express.Router();
const query = require("../middleware/query");
const parse = require("../middleware/parse");
const send = require("../middleware/send");
const bcrypt = require("bcrypt");
const authorization = require("../middleware/authorization");
const { toDate } = require("../utils/types");

/**
 * Hashes a password using bcrypt with 10 salt rounds
 * @param {*} password The password to hash
 * @returns The hashed password
 */
function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hashSync(password, saltRounds);
}

/**
 * Gets the user data from the database given a refresh token
 * @param {*} knex The knex instance
 * @param {*} refreshToken The refresh token
 * @returns The user data
 */
async function tryGetUserByToken(knex, refreshToken) {
  // Check if token is valid
  try {
    jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") throw {
      code: 401,
      message: "JWT token has expired",
    }; 
    else throw {
      code: 401,
      message: "Invalid JWT token",
    };
  }
  // Decode token and get user
  const decoded = jwt.decode(refreshToken);
  const user = await knex("users")
    .where("email", decoded.email)
    .where("refresh_iat", decoded.iat)
    .where("refresh_exp", decoded.exp)
    .first();
  return user;
}

/**
 * Creates the users table if it does not exist
 * @param {*} knex The knex instance
 */
async function createUserTableIfNotExist(knex) {
  const hasTable = await knex.schema.hasTable("users");
  if (!hasTable) {
    return knex.schema.createTable("users", (table) => {
      table.increments("id").primary();
      table.string("email").notNullable();
      table.string("password").notNullable();
      table.string("refresh_iat");
      table.string("refresh_exp");
      table.string("first_name");
      table.string("last_name");
      table.string("dob");
      table.string("address");
    });
  }
}

/**
 * Registers a user given an email and password
 * @param {*} knex The knex instance
 * @param {*} email The email of the user
 * @param {*} password The password of the user
 * @returns The status of the registration
 */
async function registerUser({ knex, email, password }) {
  if (!email || !password) {
    throw {
      code: 400,
      message: "Request body incomplete, both email and password are required",
    };
  }
  const hashedPassword = hashPassword(password);
  await createUserTableIfNotExist(knex);
  // Check if user already exists
  const user = await knex("users").where("email", email).first();
  // If user exists, throw error
  if (user) {
    throw {
      code: 409,
      message: "User already exists",
    };
  }
  // If user does not exist, insert user
  return knex("users")
    .insert({
      email: email,
      password: hashedPassword,
    })
    .then(() => {
      return {
        code: 201,
        message: "User created",
      };
    });
}

/**
 * Logins a user given an email and password
 * @param {*} knex The knex instance
 * @param {*} email The email of the user
 * @param {*} password The password of the user
 * @param {*} longExpiry Whether the token should have a long expiry
 * @param {*} bearerExpire The expiry of the bearer token in seconds
 * @param {*} refreshExpire The expiry of the refresh token in seconds
 * @returns The bearer and refresh tokens
 */
async function loginUser({
  knex,
  email,
  password,
  longExpiry = false,
  bearerExpire = 600,
  refreshExpire = 86400,
}) {
  if (!email || !password) throw {
      code: 400,
      message: "Request body incomplete, both email and password are required",
    };
  // Check if correct credentials. Throw error if not correct
  const user = await knex("users").where("email", email).first();
  if (!user) throw {
      code: 401,
      message: "Incorrect email or password",
    };
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) throw {
    code: 401,
    message: "Incorrect email or password",
  };
  // Create the tokens
  const [bearerToken, bearerIat, bearerExp] = createBearerToken(
    email,
    longExpiry,
    bearerExpire
  );
  const [refreshToken, refreshIat, refreshExp] = createRefreshToken(
    email,
    longExpiry,
    refreshExpire
  );
  // Update the user's session
  await knex("users").where("email", email).update({
    refresh_iat: refreshIat,
    refresh_exp: refreshExp,
  });
  // Return the tokens
  return {
    bearerToken: {
      token: bearerToken,
      token_type: "Bearer",
      expires_in: bearerExp - bearerIat,
    },
    refreshToken: {
      token: refreshToken,
      token_type: "Refresh",
      expires_in: refreshExp - refreshIat,
    },
  };
}

/**
 * Refreshes the tokens given a refresh token
 * @param {*} knex The knex instance
 * @param {*} token The refresh token
 * @returns The new bearer and refresh tokens
 */
async function refresh({ knex, token }) {
  const user = await tryGetUserByToken(knex, token);
  const email = user.email;
  const [bearerToken, bearerIat, bearerExp] = createBearerToken(
    email,
    false,
    null
  );
  const [refreshToken, refreshIat, refreshExp] = createRefreshToken(
    email,
    false,
    null
  );
  // Update the user's session
  await knex("users").where("email", email).update({
    refresh_iat: refreshIat,
    refresh_exp: refreshExp,
  });
  return {
    bearerToken: {
      token: bearerToken,
      token_type: "Bearer",
      expires_in: bearerExp - bearerIat,
    },
    refreshToken: {
      token: refreshToken,
      token_type: "Refresh",
      expires_in: refreshExp - refreshIat,
    },
  };
}

/**
 * Logs out a user given a refresh token
 * @param {*} knex The knex instance  
 * @param {*} refreshToken The refresh token
 * @returns The status of the logout
 */
async function logout({ knex, refreshToken }) {
  const user = await tryGetUserByToken(knex, refreshToken);
  const email = user.email;
  await knex("users").where("email", email).update({
    refresh_iat: null,
    refresh_exp: null,
  });
  return {
    error: false,
    message: "Token successfully invalidated",
  };
}

/**
 * Gets the user profile given an email
 * @param {*} knex The knex instance
 * @param {*} email The email of the user
 * @param {*} authorization The authorization information obtained
 * from the bearer token of the request
 * @returns The user profile
 */
async function getUserProfile({ knex, email, authorization}) {
  const user = await knex("users").where("email", email).first();
  if (!user) throw {
    code: 404,
    message: "User not found"
  };
  const basicInfo = {
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name
  };
  const authorisedInfo = authorization?.email === email ? {
    dob: user.dob,
    address: user.address
  } : {};
  return {...basicInfo, ...authorisedInfo};
}

/**
 * Updates the user profile given an email
 * @param {*} knex The knex instance
 * @param {*} email The email of the user
 * @param {*} authorization The authorization information obtained
 * from the bearer token of the request
 * @param {*} firstName The first name of the user
 * @param {*} lastName The last name of the user
 * @param {*} dob The date of birth of the user
 * @param {*} address The address of the user
 * @returns The user profile
 */
async function updateUserProfile({ knex, email, authorization, firstName, lastName, dob, address }) {
  const user = await knex("users").where("email", email).first();
  if (!user) throw {
    code: 404,
    message: "User not found"
  };
  if (authorization?.email !== email) throw {
    code: 403,
    message: "Forbidden"
  };
  const update = {};
  // Create update based on what is provided
  if (firstName) update.first_name = firstName;
  if (lastName) update.last_name = lastName;
  if (dob) {
    const now = new Date();
    if (dob >= now) throw {
      code: 400,
      message: "Invalid input: dob must be a date in the past."
    };
    update.dob = dob.toLocaleDateString('en-CA');
  }
  if (address) update.address = address;
  await knex("users").where("email", email).update(update);
  return {
    email: email,
    firstName: firstName,
    lastName: lastName,
    dob: dob.toLocaleDateString('en-CA'),
    address: address
  };
}

/**
 * Creates a bearer token
 * @param {*} email The email of the user
 * @param {*} longExpiry Whether the token should have a long expiry
 * @param {*} expiry The expiry of the token, in seconds. If null, defaults
 * to 10 minutes.
 * @returns The bearer token, iat and exp
 */
function createBearerToken(email, longExpiry, expiry = null) {
  expiry = expiry ? expiry + "s" : longExpiry ? "365d" : "10m";
  const token = jwt.sign(
    {
      email: email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: expiry,
    }
  );
  // Get the iat and exp values from the token
  const { iat, exp } = jwt.decode(token);
  return [token, iat, exp];
}

/**
 * Creates a refresh token
 * @param {*} email The email of the user
 * @param {*} longExpiry Whether the token should have a long expiry
 * @param {*} expiry The expiry of the token, in seconds. If null, defaults
 * to 24 hours.
 * @returns The refresh token, iat and exp
 */
function createRefreshToken(email, longExpiry, expiry = null) {
  expiry = expiry ? expiry + "s" : longExpiry ? "365d" : "24h";
  // Create the token
  const token = jwt.sign(
    {
      email: email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: expiry,
    }
  );
  // Get the iat and exp values from the token
  const { iat, exp } = jwt.decode(token);
  return [token, iat, exp];
}

router.post(
  "/register",
  parse((req) => {
    return {
      email: req.body.email,
      password: req.body.password,
    };
  }),
  query(registerUser),
  send
);

router.post(
  "/login",
  parse((req) => {
    return {
      email: req.body.email,
      password: req.body.password,
      longExpiry: req.body.longExpiry,
      bearerExpire: req.body.bearerExpiresInSeconds,
      refreshExpire: req.body.refreshExpiresInSeconds,
    };
  }),
  query(loginUser),
  send
);

router.post(
  "/refresh",
  parse((req) => {
    if (!req.body.refreshToken) {
      throw {
        code: 400,
        message: "Request body incomplete, refresh token required",
      };
    }
    return {
      token: req.body.refreshToken,
    };
  }),
  query(refresh),
  send
);

router.post(
  "/logout",
  parse((req) => {
    if (!req.body.refreshToken) {
      throw {
        code: 400,
        message: "Request body incomplete, refresh token required",
      };
    }
    return {
      refreshToken: req.body.refreshToken,
    };
  }),
  query(logout),
  send
);

router.get(
  "/:email/profile",
  authorization,
  // Set skipOnError to false so that even without authorization
  // the user can still get the profile
  parse((req) => {
    return {
      email: req.params.email,
      authorization: req.authorization
    };
  }, false), 
  query(getUserProfile, false),
  send
);

router.put(
  "/:email/profile",
  authorization,
  parse((req) => {
    // Must have all fields
    if (!req.body.firstName || !req.body.lastName || !req.body.dob || !req.body.address) throw {
      code: 400,
      message: "Request body incomplete: firstName, lastName, dob and address are required."
    };
    // Must be strings
    if (typeof req.body.firstName !== "string" 
    || typeof req.body.lastName !== "string" 
    || typeof req.body.address !== "string") throw {
      code: 400,
      message: "Request body invalid: firstName, lastName and address must be strings only."
    };
    try {
      // Must be valid date
      const dob = toDate(req.body.dob);
      return {
        email: req.params.email,
        authorization: req.authorization,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        dob: dob,
        address: req.body.address
      };
    }
    catch (err) {
      throw {
        code: 400,
        message: "Invalid input: dob must be a real date in format YYYY-MM-DD.",
      };
    }
  }),
  query(updateUserProfile),
  send
);

module.exports = router;
