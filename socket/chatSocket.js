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

  const userChat = "chatOf" + socket.request.username;
  socket.request.userChat = userChat;

  socket.join(userChat);
  logger.info(
    `${socket.request.username} connected to ${userChat}, room ${roomId}`.green
  );
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
  logger.info(`${socket.request.username} connected to ${userChatrooms}`.green);
};

const chatSocket = (io) => {
  let chatSpace = io.of("/chat");
  let chatroomsSpace = io.of("/chatrooms");

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

    socket.on(GET_THE_PAST_MESSAGES, async () => {
      if (roomId === "undefined") {
        return;
      }
      let messages = await chatController.getChatMessagesByRoomID(
        username,
        roomId
      );

      messages.forEach((message) => {
        // console.log(message);
        message.dateTime = message.dateTime.getTime().toString();
      });

      const userChat = "chatOf" + username;
      console.log(userChat);
      // console.log(messages);
      chatSpace.to(userChat).emit(GET_THE_PAST_MESSAGES, messages);
    });

    socket.on(NEW_CHAT_MESSAGE_EVENT, async ({ text, uuid }) => {
      const dateTime = Date.now();
      const chatroom = await chatController.getChatRoomByIDSocket(roomId);
      const usernameSender = username;
      const usernameReceiver =
        chatroom.username1 === usernameSender
          ? chatroom.username2
          : chatroom.username1;
      const userChat = "chatOf" + usernameSender;
      const friendChat = "chatOf" + usernameReceiver;

      const message = {
        usernameSender: usernameSender,
        messageText: text,
        dateTime: dateTime.toString(),
        uuid: uuid,
      };

      const isVisibleToFriend = await chatController.createChatMessage(
        usernameSender,
        roomId,
        text,
        dateTime,
        usernameReceiver
      );
      // console.log(isVisibleToFriend);

      chatSpace.to(userChat).emit(NEW_CHAT_MESSAGE_EVENT, message);
      if (isVisibleToFriend)
        chatSpace.to(friendChat).emit(NEW_CHAT_MESSAGE_EVENT, message);

      const user1Chatrooms = "chatroomsOf" + chatroom.username1;
      const user2Chatrooms = "chatroomsOf" + chatroom.username2;
      chatroomsSpace.to(user1Chatrooms).emit(REFRESH_CHATROOM, "refresh");
      chatroomsSpace.to(user2Chatrooms).emit(REFRESH_CHATROOM, "refresh");
    });

    socket.on("disconnect", () => {
      logger.info(`${username} disconnected from room ${roomId}`.red);
      socket.leave(roomId);
    });
  });

  chatroomsSpace.on("connection", (socket) => {
    const userChatrooms = socket.request.userChatrooms;

    socket.on("disconnect", () => {
      socket.leave(userChatrooms);
    });
  });
};

module.exports = chatSocket;
