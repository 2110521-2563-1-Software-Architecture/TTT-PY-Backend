const express = require("express");
const app = express();
const config = require("./config/config");
const port = config.appPort;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { responseError } = require("./utils/response");

const auth = require("./routes/auth");
const user = require("./routes/user");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

const authMiddleware = (req, res, next) => {
  try {
    var decoded = jwt.verify(req.headers.authorization, config.jwtSecret);
    req.user = {};
    req.user.username = decoded.username;
    next();
  } catch (error) {
    responseError(401, "Unauthorized", res);
  }
};

app.use("/auth", auth);
app.use("/user", authMiddleware, user);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
