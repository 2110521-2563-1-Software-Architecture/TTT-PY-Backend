const userModel = require("../model/user");
const userController = {
  allUser: (req, res, next) => {
    userModel.allUser((err, data) => {
      res.json(data);
      next();
    });
  },
  searchUserbyUsername: (req, res) => {
    let username = req.query.username;
    userModel.searchUserbyID(username, (err, data) => {
      res.json(data);
    });
  },
};

module.exports = userController;
