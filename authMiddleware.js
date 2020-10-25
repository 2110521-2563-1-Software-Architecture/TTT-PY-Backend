const jwt = require("jsonwebtoken");
const config = require("./config/config");
const { responseError } = require("./utils/response");

const authMiddleware = (req, res, next) => {
  try {
    var decoded = jwt.verify(req.headers.authorization, config.jwtSecret);
    req.user = {};
    req.user.username = decoded.username;
    next();
  } catch (error) {
    responseError(res, 401, "Unauthorized");
  }
};

module.exports = authMiddleware;
