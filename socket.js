const GET_THE_PAST_MESSAGES = "getThePastMessage";
const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";

const messages = [];

module.exports = (io, socket) => {
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
};
