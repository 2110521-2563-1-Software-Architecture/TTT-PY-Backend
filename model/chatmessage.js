const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

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
      type: DataTypes.INT,
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
  },
  {
    tableName: "ChatMessage",
    createdAt: false,
    updatedAt: false,
  }
);

module.exports = ChatMessage;
