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
    next(error);
  }
};

let demoLogger = (req, res, next) => {
  //middleware function
  let current_datetime = new Date();
  let formatted_date =
    current_datetime.getFullYear() +
    "-" +
    (current_datetime.getMonth() + 1) +
    "-" +
    current_datetime.getDate() +
    " " +
    current_datetime.getHours() +
    ":" +
    current_datetime.getMinutes() +
    ":" +
    current_datetime.getSeconds();
  let method = req.method;
  let url = req.url;
  let status = res.statusCode;
  const start = process.hrtime();
  const getActualRequestDurationInMilliseconds = (start) => {
    const NS_PER_SEC = 1e9; //  convert to nanoseconds
    const NS_TO_MS = 1e6; // convert to milliseconds
    const diff = process.hrtime(start);
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
  };
  const durationInMilliseconds = getActualRequestDurationInMilliseconds(start);
  let log = `[${formatted_date}] ${method}:${url} ${status} ${durationInMilliseconds.toLocaleString()} ms`;
  console.log(log);
  next();
};

app.use("/auth", auth);
app.use("/user", authMiddleware, user);

app.use(demoLogger);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
