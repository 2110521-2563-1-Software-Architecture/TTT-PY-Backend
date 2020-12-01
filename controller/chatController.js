const { Op } = require("sequelize");
const sequelize = require("../config/db");
const ChatRoom = require("../model/chatroom");
const ChatMessage = require("../model/chatmessage");
const { responseError, responseSuccess } = require("../utils/response");
const { friendshipController } = require("./friendshipController");
const { userController } = require("./userController");
const logger = require("../utils/logger");
const { log } = require("winston");

const chatUtil = {
  isInRoom: async (username, chatRoomID) => {
    try {
      const chatroom = await ChatRoom.findOne({
        where: { chatRoomID: chatRoomID },
      });
      if (chatroom.username1 === username || chatroom.username2 === username)
        return chatroom;
      else return false;
    } catch (error) {
      return false;
    }
  },
};

const chatController = {
  getAllChatRooms: async (req, res) => {
    let username = req.user.username;
    try {
      let chatrooms = await ChatRoom.findAll({
        where: {
          [Op.or]: [{ username1: username }, { username2: username }],
        },
        raw: true,
      });

      let haveAnyNewerMessage = async (chatRoomID, deletedTimeMessage) => {
        let aMessage = await ChatMessage.findOne({
          where: {
            chatRoomID: chatRoomID,
            dateTime: {
              [Op.gt]: deletedTimeMessage,
            },
          },
        });
        if (aMessage) return true;
        else return false;
      };

      let filteredChatrooms = [];
      for (chatroom of chatrooms) {
        if (chatroom.username1 === username && chatroom.deletedTimeMessage1) {
          if (
            !(await haveAnyNewerMessage(
              chatroom.chatRoomID,
              chatroom.deletedTimeMessage1
            ))
          ) {
            continue;
          }
        } else if (
          chatroom.username2 === username &&
          chatroom.deletedTimeMessage2
        ) {
          if (
            !(await haveAnyNewerMessage(
              chatroom.chatRoomID,
              chatroom.deletedTimeMessage2
            ))
          ) {
            continue;
          }
        }

        const friendShip = await friendshipController.checkFriend(
          chatroom.username1,
          chatroom.username2
        );

        if (friendShip.User_Username === username && friendShip.isBlocked2)
          continue;
        if (friendShip.Friend_Username === username && friendShip.isBlocked1)
          continue;

        filteredChatrooms.push(chatroom);
      }

      filteredChatrooms.sort((a, b) => {
        let c = !a.latestMessage ? a.createdAt : a.latestMessage;
        let d = !b.latestMessage ? b.createdAt : b.latestMessage;
        return d - c;
      });
      let chatroomsOut = filteredChatrooms.map(
        ({ chatRoomID, username1, username2 }) => {
          return { chatRoomID, username1, username2 };
        }
      );
      return responseSuccess(res, 200, chatroomsOut);
    } catch (err) {
      console.log(err);
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
  getChatRoomByIDSocket: async (chatRoomID) => {
    try {
      const chatroom = await ChatRoom.findOne({
        where: {
          chatRoomID: chatRoomID,
        },
      });
      if (!chatroom) {
        return "Invalid chatroom";
      }
      return chatroom;
    } catch (err) {
      console.log(err);
      return "Internal Error";
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
      const findChatroom = async () => {
        return await ChatRoom.findOne({
          where: {
            [Op.or]: [
              { [Op.and]: [{ username1: username }, { username2: friend }] },
              { [Op.and]: [{ username1: friend }, { username2: username }] },
            ],
          },
        });
      };
      const foundChatroom = await findChatroom();
      const hasDeleteThisRoom = () => {
        if (
          username === foundChatroom.username1 &&
          foundChatroom.deletedTimeMessage1
        ) {
          return true;
        } else if (
          username === foundChatroom.username2 &&
          foundChatroom.deletedTimeMessage2
        ) {
          return true;
        } else {
          return false;
        }
      };

      if (foundChatroom && !hasDeleteThisRoom) {
        return responseError(res, 400, "Chatroom has been already created");
      } else {
        const chatroom = await ChatRoom.create({
          username1: username,
          username2: friend,
        });
        return responseSuccess(res, 201, chatroom, "Chatroom is created");
      }
    } catch (err) {
      return responseError(res, 500, "Internal Error");
    }
  },
  deleteChatRoom: async (req, res) => {
    try {
      let username = req.user.username;
      let chatRoomID = req.params.id;
      const chatRoom = await chatUtil.isInRoom(username, chatRoomID);
      if (!chatRoom) {
        responseError(
          res,
          401,
          "You do not have permission to access this chatroom"
        );
      } else if (chatRoom.username1 === username) {
        await ChatRoom.update(
          { deletedTimeMessage1: Date.now() },
          { where: { chatRoomID: chatRoomID } }
        );
      } else if (chatRoom.username2 === username) {
        await ChatRoom.update(
          { deletedTimeMessage2: Date.now() },
          { where: { chatRoomID: chatRoomID } }
        );
      } else {
        responseError(res, 500, "Internal Error");
      }
      responseSuccess(res, 201, null, "Delete chatroom successful");
    } catch (error) {
      responseError(res, 500, "Internal Error");
    }
  },
  getChatMessagesByRoomID: async (username, chatRoomID) => {
    try {
      const chatRoom = await chatUtil.isInRoom(username, chatRoomID);
      if (!chatRoom) {
        throw new Error("You do not have permission to access this chatroom");
      } else {
        let deletedTimeMessage =
          chatRoom.username1 === username
            ? chatRoom.deletedTimeMessage1
            : chatRoom.deletedTimeMessage2;

        const messages = await ChatMessage.findAll({
          where: {
            [Op.or]: [
              { isVisibleToFriend: true },
              { usernameSender: username },
            ],
            chatRoomID: chatRoomID,
            dateTime: {
              [Op.gt]: deletedTimeMessage ? deletedTimeMessage : 0,
            },
          },
          attributes: { exclude: ["messageID", "chatRoomID"] },
        });
        return messages;
      }
    } catch (error) {
      responseError(res, 401, error.message);
    }
  },
  createChatMessage: async (
    usernameSender,
    chatRoomID,
    messageText,
    dateTime,
    usernameReceiver
  ) => {
    try {
      const friendShip = await friendshipController.checkFriend(
        usernameSender,
        usernameReceiver
      );

      let isVisibleToFriend = true;
      if (
        usernameSender === friendShip.User_Username &&
        friendShip.isBlocked1
      ) {
        isVisibleToFriend = false;
      } else if (
        usernameSender === friendShip.Friend_Username &&
        friendShip.isBlocked2
      ) {
        isVisibleToFriend = false;
      }

      await sequelize.transaction(async (t) => {
        const chatMessage = await ChatMessage.create(
          {
            usernameSender: usernameSender,
            chatRoomID: chatRoomID,
            messageText: messageText,
            dateTime: dateTime,
            isVisibleToFriend: isVisibleToFriend,
          },
          {
            transaction: t,
          }
        );
        await ChatRoom.update(
          { latestMessage: dateTime },
          { where: { chatRoomID: chatRoomID }, transaction: t }
        );
        return chatMessage;
      });

      return isVisibleToFriend;
    } catch (error) {
      throw error;
    }
  },
};
module.exports.chatController = { ...chatController, ...chatUtil };
