const app = require("../backend/server");
const serverless = require("serverless-http");

module.exports = app;
module.exports.handler = serverless(app);
