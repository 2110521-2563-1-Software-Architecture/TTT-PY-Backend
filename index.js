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

const auth = require("./routes/auth");
const user = require("./routes/user");
const friendship = require("./routes/friendship");

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

app.use("/auth", auth);
app.use("/user", authMiddleware, user);
app.use("/friend", authMiddleware, friendship);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const server = require("http").Server(app);
const io = require("socket.io")(server);

const PORT = 4000;
const GET_THE_PAST_MESSAGES = "getThePastMessage";
const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";

const messages = [];

io.on("connection", (socket) => {
  // Join a conversation
  const { roomId } = socket.handshake.query;
  socket.join(roomId);
  console.log(`connected. room:${roomId}`);

  socket.on(GET_THE_PAST_MESSAGES, () => {
    io.in(roomId).emit(GET_THE_PAST_MESSAGES, messages);
  });

  // Listen for new messages
  socket.on(NEW_CHAT_MESSAGE_EVENT, (data) => {
    messages.push(data);
    io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, data);
  });

  // Leave the room if the user closes the socket
  socket.on("disconnect", () => {
    console.log("disconnected");
    socket.leave(roomId);
  });
});

server.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
