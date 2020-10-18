const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

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
    },
  },
  {
    tableName: "Friendship",
    createdAt: false,
    updatedAt: false,
  }
);

module.exports = Friendship;
