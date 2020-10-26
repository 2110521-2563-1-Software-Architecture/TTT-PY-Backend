const GET_THE_PAST_MESSAGES = "getThePastMessage";
const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";
const ERROR_EVENT = "errorEvent";

const { jwtDecode } = require("./authUtil");

const { chatController } = require("./controller/chatController");

const socketMiddleware = async (socket) => {
  const { roomId, token } = socket.handshake.query;
  if (!roomId) {
    const message = "Enter chatroom id";
    return socket.emit(ERROR_EVENT, message);
  }

  try {
    var decoded = jwtDecode(token);
    socket.request.token = token;
    socket.request.username = decoded.username;
    socket.request.roomId = roomId;
  } catch (error) {
    return socket.emit(ERROR_EVENT, error.message);
  }

  if (!(await chatController.isInRoom(decoded.username, roomId))) {
    const message = "You do not have permission to access this chatroom";
    return socket.emit(ERROR_EVENT, message);
  }

  socket.join(roomId);
  console.log(`connected. room:${roomId}`);
};

const socketController = async (io, socket) => {
  socketMiddleware(socket);

  const roomId = socket.request.roomId;
  const username = socket.request.username;

  socket.on(GET_THE_PAST_MESSAGES, async () => {
    if (!roomId) {
      return;
    }
    const messages = await chatController.getChatMessagesByRoomID(
      username,
      roomId
    );
    io.in(roomId).emit(GET_THE_PAST_MESSAGES, messages);
  });

  // Listen for new messages
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
    io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, message);
  });

  // Leave the room if the user closes the socket
  socket.on("disconnect", () => {
    console.log("disconnected. room:" + roomId);
    socket.leave(roomId);
  });
};

module.exports = {
  socketController: socketController,
  socketMiddleware: socketMiddleware,
};
