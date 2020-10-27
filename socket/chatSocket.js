const logger = require("../utils/logger")(module);
require("colors");

const GET_THE_PAST_MESSAGES = "getThePastMessage";
const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";
const REFRESH_CHATROOM = "refreshChatroom";
const ERROR_EVENT = "errorEvent";

const { jwtDecode } = require("../authUtil");

const { chatController } = require("../controller/chatController");

const chatSocketMiddleware = async (socket) => {
  const { roomId, token, friend } = socket.handshake.query;

  if (!roomId) {
    const message = "Enter chatroom id";
    return socket.emit(ERROR_EVENT, message);
  }

  try {
    var decoded = jwtDecode(token);
    socket.request.token = token;
    socket.request.username = decoded.username;
    socket.request.roomId = roomId;
    socket.request.friend = friend;
  } catch (error) {
    return socket.emit(ERROR_EVENT, error.message);
  }

  if (!(await chatController.isInRoom(decoded.username, roomId))) {
    const message = "You do not have permission to access this chatroom";
    return socket.emit(ERROR_EVENT, message);
  }

  socket.join(roomId);
  logger.info(`${socket.request.username} connected to room:${roomId}`.green);
};

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

const chatSocket = async (io) => {
  const chatSpace = io.of("/chat");
  const chatroomsSpace = io.of("/chatrooms");

  chatSpace.use((socket, next) => {
    chatSocketMiddleware(socket);
    next();
  });

  chatroomsSpace.use((socket, next) => {
    chatroomSocketMiddleware(socket);
    next();
  });

  chatSpace.on("connection", (socket) => {
    const roomId = socket.request.roomId;
    const username = socket.request.username;
    const usernameReceiver = socket.request.friend;

    socket.on(GET_THE_PAST_MESSAGES, async () => {
      if (roomId === "undefined") {
        return;
      }
      const messages = await chatController.getChatMessagesByRoomID(
        username,
        roomId
      );
      chatSpace.in(roomId).emit(GET_THE_PAST_MESSAGES, messages);
    });

    socket.on(NEW_CHAT_MESSAGE_EVENT, async ({ text }) => {
      const usernameSender = username;
      const dateTime = Date.now();
      const message = {
        usernameSender: usernameSender,
        messageText: text,
        dateTime: dateTime,
      };
      await chatController.createChatMessage(
        usernameSender,
        roomId,
        text,
        dateTime
      );

      chatSpace.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, message);
      const userChatrooms = "chatroomsOf" + username;
      chatroomsSpace.to(userChatrooms).emit(REFRESH_CHATROOM, "refresh");
    });

    socket.on("disconnect", () => {
      logger.info(`${username} disconnected from room:${roomId}`.red);
      socket.leave(roomId);
    });
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

module.exports = chatSocket;
