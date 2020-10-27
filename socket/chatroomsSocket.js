const logger = require("../utils/logger")(module);
require("colors");

// const GET_CHATROOMS = "getChatroom";
const REFRESH_CHATROOM = "refreshChatroom";
const ERROR_EVENT = "errorEvent";

const { jwtDecode } = require("../authUtil");

const chatroomSocketMiddleware = async (socket) => {
  const { token } = socket.handshake.query;

  try {
    var decoded = jwtDecode(token);
    socket.request.token = token;
    socket.request.username = decoded.username;
  } catch (error) {
    return socket.emit(ERROR_EVENT, error.message);
  }

  const userChatrooms = "chatroomsOf" + socket.request.username;
  socket.request.userChatrooms = userChatrooms;

  socket.join(userChatrooms);
  logger.info(userChatrooms.green);
};

const chatroomSocket = async (io) => {
  const chatroomsSpace = io.of("/chatrooms");

  chatroomsSpace.use((socket, next) => {
    chatroomSocketMiddleware(socket);
    next();
  });

  chatroomsSpace.on("connection", (socket) => {
    const userChatrooms = socket.request.userChatrooms;

    socket.on(REFRESH_CHATROOM, async ({ refresh }) => {
      logger.info(refresh);
      io.in(userChatrooms).emit(REFRESH_CHATROOM, chatroom);
    });

    socket.on("disconnect", () => {
      socket.leave(userChatrooms);
    });
  });
};

module.exports = chatroomSocket;
