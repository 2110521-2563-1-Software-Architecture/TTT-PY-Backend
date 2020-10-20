const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ChatRoom = sequelize.define(
  "ChatRoom",
  {
    ChatRoomID: {
      type: DataTypes.INT,
      primaryKey: true,
      autoIncrement: true,
    },
    Username1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Username2: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "ChatRoom",
    createdAt: false,
    updatedAt: false,
  }
);

module.exports = ChatRoom;
