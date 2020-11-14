const jwt = require("jsonwebtoken");
const config = require("./config/config");
const { responseError } = require("./utils/response");

const jwtDecode = (token) => {
  try {
    let decoded = jwt.verify(token, config.jwtSecret);
    return decoded;
  } catch (error) {
    throw new Error("Unauthorized");
  }
};

const authMiddleware = (req, res, next) => {
  try {
    var decoded = jwtDecode(req.headers.authorization);
    req.user = {};
    req.user.username = decoded.username;
    next();
  } catch (error) {
    responseError(res, 401, error.message);
  }
};

module.exports = {
  jwtDecode: jwtDecode,
  authMiddleware: authMiddleware,
};
