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
    latestMessage: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "ChatRoom",
    createdAt: true,
    updatedAt: false,
  }
);

ChatRoom.belongsTo(User, {
  targetKey: "username",
  foreignKey: "username1",
});
ChatRoom.belongsTo(User, {
  targetKey: "username",
  foreignKey: "username2",
});

module.exports = ChatRoom;
