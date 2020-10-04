const userModel = require("../model/user");
const userController = {
  allUser: (req, res, next) => {
    userModel.allUser((err, data) => {
      res.json(data);
      next();
    });
  },
};

module.exports = userController;
