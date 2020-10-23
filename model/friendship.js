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
    IsBlocked: {
      type: DataTypes.INTEGER,
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
  targetKey: "username",
  foreignKey: "User_Username_username",
});
Friendship.belongsTo(User, {
  targetKey: "username",
  foreignKey: "Friend_Username_username",
});

module.exports = Friendship;
