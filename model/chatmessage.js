const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user");
const ChatRoom = require("./chatroom");

const ChatMessage = sequelize.define(
  "ChatMessage",
  {
    messageID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    usernameSender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    chatRoomID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    messageText: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isVisibleToFriend: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "ChatMessage",
    createdAt: false,
    updatedAt: false,
  }
);

ChatMessage.belongsTo(ChatRoom, {
  targetKey: "chatRoomID",
  foreignKey: "chatRoomID",
});
ChatMessage.belongsTo(User, {
  targetKey: "username",
  foreignKey: "usernameSender",
});

module.exports = ChatMessage;
