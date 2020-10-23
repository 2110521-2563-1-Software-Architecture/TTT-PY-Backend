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

ChatRoom.belongsTo(User, {
  targetKey: "username",
  foreignKey: "username1_chatroom",
});
ChatRoom.belongsTo(User, {
  targetKey: "username",
  foreignKey: "username2_chatroom",
});

module.exports = ChatRoom;
