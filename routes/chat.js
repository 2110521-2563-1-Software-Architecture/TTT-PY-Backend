const express = require("express");
const router = express.Router();
const { chatController } = require("../controller/chatController");

//getAllChatRooms
router.get("/rooms", chatController.getAllChatRooms);
//getChatRoomByID
router.get("/room/:id", chatController.getChatRoomByID);
//createChatRooms
router.post("/room", chatController.createChatRoom);
//deleteChatRoom
router.delete("/room/:id", chatController.deleteChatRoom);

module.exports = router;
