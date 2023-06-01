var express = require("express");
var jwt = require("jsonwebtoken");
var router = express.Router();
const query = require("../middleware/query");
const parse = require("../middleware/parse");
const send = require("../middleware/send");

/**
 * Hashes a password using bcrypt
 * @param {*} password
 */
function hashPassword(password) {}

async function createUserTableIfNotExist(knex) {
  const hasTable = await knex.schema.hasTable("users");
  if (!hasTable) {
    return knex.schema.createTable("users", (table) => {
      table.increments("id").primary();
      table.string("email").notNullable();
      table.string("password").notNullable();
      table.string("bearer_token");
      table.string("bearer_exp");
      table.string("refresh_token");
      table.string("refresh_exp");
    });
  }
}

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

async function registerUser({ knex, email, password }) {
  // TODO: Hash password

  if (!email || !password) {
    throw {
      code: 400,
      message: "Request body incomplete, both email and password are required",
    };
  }
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
      password: password,
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
  // TODO: Hash password
  console.log(
    "loginUser",
    email,
    password,
    longExpiry,
    bearerExpire,
    refreshExpire
  );

  if (!email || !password) {
    throw {
      code: 400,
      message: "Request body incomplete, both email and password are required",
    };
  }
  // Check if correct credentials. Throw error if not correct
  const user = await knex("users")
    .where("email", email)
    .where("password", password)
    .first();
  if (!user) {
    throw {
      code: 401,
      message: "Incorrect email or password",
    };
  }
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

  // Find the user's session in the database
  const session = await knex("users").where("email", email).first();

  // If the session exists, update the tokens
  if (session) {
    await knex("users").where("email", email).update({
      bearer_exp: bearerExp,
      refresh_exp: refreshExp,
    });
  } else {
    // If the session does not exist, create it
    await knex("users").insert({
      email: email,
      bearer_exp: bearerExp,
      refresh_exp: refreshExp,
    });
  }

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
  // Decode the email from the refresh token
  const { email } = jwt.decode(token);
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

module.exports = router;
