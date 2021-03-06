const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user");

const Friendship = sequelize.define(
  "Friendship",
  {
    User_Username: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    Friend_Username: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    StartDate: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    isBlocked1: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
    },
    isBlocked2: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "Friendship",
    createdAt: false,
    updatedAt: false,
  }
);

Friendship.belongsTo(User, {
  as: "user_username",
  foreignKey: "User_Username",
});
Friendship.belongsTo(User, {
  as: "friend_username",
  foreignKey: "Friend_Username",
});

module.exports = Friendship;
