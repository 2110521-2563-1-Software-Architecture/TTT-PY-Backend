const config = require("./config");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(config.dbName, config.dbUser, config.dbPass, {
  host: config.dbHost,
  port: config.port,
  dialect: "mysql",
  logging: false,
});

module.exports = sequelize;
