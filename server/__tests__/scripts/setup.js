const axios = require("axios");
const https = require("https");
// Load from ../test.config.json
const { REMOTE_API_URL } = require("../jest.config");

https.globalAgent.options.rejectUnauthorized = false;

const instance = axios.create({
  baseURL: REMOTE_API_URL,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

module.exports = instance;