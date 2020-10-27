const { Op } = require("sequelize");
const sequelize = require("../config/db");
const ChatRoom = require("../model/chatroom");
const ChatMessage = require("../model/chatmessage");
const { responseError, responseSuccess } = require("../utils/response");
const { friendshipController } = require("./friendshipController");
const { userController } = require("./userController");

const chatUtil = {
  isInRoom: async (username, chatRoomID) => {
    try {
      const chatroom = await ChatRoom.findOne({
        where: { chatRoomID: chatRoomID },
      });
      return chatroom.username1 === username || chatroom.username2 === username;
    } catch (error) {
      return false;
    }
  },
};
const chatController = {
  getAllChatRooms: async (req, res) => {
    let username = req.user.username;
    try {
      const chatrooms = await ChatRoom.findAll({
        where: {
          [Op.or]: [{ username1: username }, { username2: username }],
        },
      });
      chatrooms.sort((a, b) => {
        let c = !a.latestMessage ? a.createdAt : a.latestMessage;
        let d = !b.latestMessage ? b.createdAt : b.latestMessage;
        return d - c;
      });
      let chatroomsOut = chatrooms.map(
        ({ chatRoomID, username1, username2 }) => {
          return { chatRoomID, username1, username2 };
        }
      );
      return responseSuccess(res, 200, chatroomsOut);
    } catch (err) {
      return responseError(res, 500, "Internal Error");
    }
  },
  getAllChatRoomsSocket: async (username) => {
    try {
      const chatrooms = await ChatRoom.findAll({
        where: {
          [Op.or]: [{ username1: username }, { username2: username }],
        },
      });
      chatrooms.sort((a, b) => {
        let c = !a.latestMessage ? a.createdAt : a.latestMessage;
        let d = !b.latestMessage ? b.createdAt : b.latestMessage;
        return d - c;
      });
      let chatroomsOut = chatrooms.map(
        ({ chatRoomID, username1, username2 }) => {
          return { chatRoomID, username1, username2 };
        }
      );
      return chatroomsOut;
    } catch (err) {
      throw err;
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
  createChatRoom: async (req, res) => {
    let username = req.user.username;
    let friend = req.body.username;
    try {
      if (!(await userController.userValid(friend))) {
        return responseError(res, 400, "Invalid friend username");
      }
      if (!(await friendshipController.checkFriend(username, friend))) {
        return responseError(res, 400, "You're not friends");
      }
      const chatroomIsCreated = async () => {
        return await ChatRoom.findOne({
          where: {
            [Op.or]: [
              { [Op.and]: [{ username1: username }, { username2: friend }] },
              { [Op.and]: [{ username1: friend }, { username2: username }] },
            ],
          },
        });
      };
      if (await chatroomIsCreated()) {
        return responseError(res, 400, "Chatroom has been already created");
      }
      const chatroom = await ChatRoom.create({
        username1: username,
        username2: friend,
      });
      return responseSuccess(res, 201, chatroom, "Chatroom is created");
    } catch (err) {
      return responseError(res, 500, "Internal Error");
    }
  },
  getChatMessagesByRoomID: async (username, chatRoomID) => {
    try {
      if (!(await chatUtil.isInRoom(username, chatRoomID))) {
        throw new Error("You do not have permission to access this chatroom");
      }
      const messages = await ChatMessage.findAll({
        where: {
          chatRoomID: chatRoomID,
        },
        attributes: { exclude: ["messageID", "chatRoomID"] },
      });
      return messages;
    } catch (error) {
      throw error;
    }
  },
  createChatMessage: async (
    usernameSender,
    chatRoomID,
    messageText,
    dateTime
  ) => {
    try {
      if (!(await chatUtil.isInRoom(usernameSender, chatRoomID))) {
        throw new Error("You do not have permission to access this chatroom");
      }

      await sequelize.transaction(async (t) => {
        const chatMessage = await ChatMessage.create(
          {
            usernameSender: usernameSender,
            chatRoomID: chatRoomID,
            messageText: messageText,
            dateTime: dateTime,
          },
          { transaction: t }
        );
        await ChatRoom.update(
          { latestMessage: dateTime },
          { where: { chatRoomID: chatRoomID }, transaction: t }
        );
        return chatMessage;
      });
    } catch (error) {
      throw error;
    }
  },
};
module.exports.chatController = { ...chatController, ...chatUtil };
