const { Op } = require("sequelize");
const ChatRoom = require("../model/chatroom");
const { responseError, responseSuccess } = require("../utils/response");
const { friendshipController } = require("./friendshipController");
const { userController } = require("./userController");
const chatController = {
  getAllChatRooms: async (req, res) => {
    let username = req.user.username;
    try {
      const chatrooms = await ChatRoom.findAll({
        where: {
          [Op.or]: [{ username1: username }, { username2: username }],
        },
      });
      return responseSuccess(res, 200, chatrooms);
    } catch (err) {
      return responseError(res, 500, "Internal Error");
    }
  },
  getChatRoomByID: async (req, res) => {
    let chatRoomID = req.params.id;
    let username = req.user.username;
    try {
      const chatroom = await ChatRoom.findOne({
        where: {
          [Op.and]: [
            { chatRoomID: chatRoomID },
            { [Op.or]: [{ username1: username }, { username2: username }] },
          ],
        },
      });
      if (!chatroom) {
        return responseError(res, 400, "Invalid chatroom");
      }
      return responseSuccess(res, 200, chatroom);
    } catch (err) {
      return responseError(res, 500, "Internal Error");
    }
  },
};
module.exports.chatController = chatController;