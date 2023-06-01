var express = require("express");
var jwt = require("jsonwebtoken");
var router = express.Router();
const query = require("../middleware/query");
const parse = require("../middleware/parse");
const send = require("../middleware/send");
const bcrypt = require("bcrypt");

/**
 * Hashes a password using bcrypt
 * @param {*} password
 */
function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hashSync(password, saltRounds);
}

async function tryGetUserByToken(knex, refreshToken) {
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
  const decoded = jwt.decode(refreshToken);
  // Check if token is in the database
  const user = await knex("users")
    .where("email", decoded.email)
    .where("refresh_iat", decoded.iat)
    .where("refresh_exp", decoded.exp)
    .first();
  return user;
}

async function createUserTableIfNotExist(knex) {
  const hasTable = await knex.schema.hasTable("users");
  if (!hasTable) {
    return knex.schema.createTable("users", (table) => {
      table.increments("id").primary();
      table.string("email").notNullable();
      table.string("password").notNullable();
      table.string("refresh_iat");
      table.string("refresh_exp");
    });
  }
}

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

async function loginUser({
  knex,
  email,
  password,
  longExpiry = false,
  bearerExpire = 600,
  refreshExpire = 86400,
}) {
  if (!email || !password)
    throw {
      code: 400,
      message: "Request body incomplete, both email and password are required",
    };
  // Check if correct credentials. Throw error if not correct
  const user = await knex("users").where("email", email).first();
  if (!user)
    throw {
      code: 401,
      message: "Incorrect email or password",
    };
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch)
    throw {
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

// JSON-WEB-TOKEN
function createBearerToken(email, longExpiry, expiry = null) {
  expiry = expiry ? expiry + "s" : longExpiry ? "365d" : "10m";
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

/* --- POST register a new user. --- */
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

/* --- POST login a user. --- */
router.post(
  "/login",
  parse((req) => {
    console.log("login", req.body);
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

/* --- POST refresh a user's token. --- */
router.post(
  "/refresh",
  parse((req) => {
    console.log("refresh", req.body);
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

/* --- POST logout a user. --- */
router.post(
  "/logout",
  parse((req) => {
    console.log("logout", req.body);
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

module.exports = router;
