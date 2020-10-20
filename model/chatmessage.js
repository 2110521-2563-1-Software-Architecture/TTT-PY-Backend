const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ChatMessage = sequelize.define(
  "ChatMessage",
  {
    MessageID: {
      type: DataTypes.INT,
      primaryKey: true,
      autoIncrement: true,
    },
    UsernameSender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ChatRoomID: {
      type: DataTypes.INT,
      allowNull: false,
    },
    MessageText: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    DateTime: {
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
