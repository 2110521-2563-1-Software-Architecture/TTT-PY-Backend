const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user");

const ChatRoom = sequelize.define(
  "ChatRoom",
  {
    chatRoomID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username2: {
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

ChatRoom.belongsTo(User, { as: "username1" });
ChatRoom.belongsTo(User, { as: "username2" });

module.exports = ChatRoom;
