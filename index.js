const express = require("express");
const app = express();
const cors = require("cors");
const config = require("./config/config");
const port = config.appPort;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { responseError } = require("./utils/response");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

// const auth = require("./routes/auth");
const user = require("./routes/user");
const friendship = require("./routes/friendship");
const sequelize = require("./config/db");
const { DataTypes } = require("sequelize");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

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

// app.use("/auth", auth);
// app.use("/user", authMiddleware, user);
app.use("/user", authMiddleware, user);
app.use("/friend", authMiddleware, friendship);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
