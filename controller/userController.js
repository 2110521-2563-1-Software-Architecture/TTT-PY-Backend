const { response } = require("express");
const userModel = require("../model/user");
const userController = {
  allUser: (req, res) => {
    userModel.allUser((err, data) => {
      res.json(data);
    });
  },
};

module.exports = userController;
