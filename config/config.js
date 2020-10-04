require("dotenv").config();

module.exports = {
  dbHost: process.env.DB_HOST || "",
  dbPort: process.env.DB_PORT || 0,
  appPort: process.env.APP_PORT || 0,
  dbUser: process.env.DB_ROOT_USER || "",
  dbPass: process.env.DB_ROOT_PASS || "",
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "30d",
  jwtCookieExpires: process.env.JWT_COOKIE_EXPIRES || 30,
};
