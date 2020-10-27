const express = require("express");
const app = express();
const server = require("http").Server(app);

const io = require("socket.io")(server);
require("./socket/chatSocket")(io);
// require("./socket/chatroomsSocket")(io);

const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const config = require("./config/config");
const port = config.appPort;

const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");

const { authMiddleware } = require("./authUtil");

const auth = require("./routes/auth");
const user = require("./routes/user");
const chat = require("./routes/chat");
const friendship = require("./routes/friendship");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

app.use("/auth", auth);
app.use("/user", authMiddleware, user);
app.use("/friend", authMiddleware, friendship);
app.use("/chat", authMiddleware, chat);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

server.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
