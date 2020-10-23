const jwt = require("jsonwebtoken");
const config = require("./config/config");

const GET_THE_PAST_MESSAGES = "getThePastMessage";
const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";
const ERROR_EVENT = "errorEvent";

const { chatController } = require("./controller/chatController");

const jwtCheck = (token) => {
  try {
    let decoded = jwt.verify(token, config.jwtSecret);
    return decoded;
  } catch (error) {
    throw new Error("You do not have permission to access this chatroom");
  }
};

module.exports = (io, socket) => {
  // Join a conversation
  const { roomId } = socket.handshake.query;
  socket.join(roomId);
  console.log(`connected. room:${roomId}`);

  socket.on(GET_THE_PAST_MESSAGES, async ({ token }) => {
    try {
      if (!roomId) {
        return io.in(roomId).emit(GET_THE_PAST_MESSAGES, []);
      }
      const decoded = jwtCheck(token);
      const username = decoded.username;
      const messages = await chatController.getChatMessagesByRoomID(
        username,
        roomId
      );
      io.in(roomId).emit(GET_THE_PAST_MESSAGES, messages);
    } catch (error) {
      io.emit(ERROR_EVENT, { message: error.message, token: token });
    }
  });

  // Listen for new messages
  socket.on(NEW_CHAT_MESSAGE_EVENT, async ({ text, token }) => {
    try {
      const decoded = jwtCheck(token);
      const usernameSender = decoded.username;
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
      io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, message);
    } catch (error) {
      io.emit(ERROR_EVENT, {
        message: error.message,
        token: token,
      });
    }
  });

  // Leave the room if the user closes the socket
  socket.on("disconnect", () => {
    console.log("disconnected");
    socket.leave(roomId);
  });
};
