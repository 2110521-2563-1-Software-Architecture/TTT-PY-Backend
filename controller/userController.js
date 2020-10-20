const User = require("../model/user");
const { responseError, responseSuccess } = require("../utils/response");
const userController = {
  getAllUser: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ["password"] },
      });
      return responseSuccess(res, 200, users);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, "Internal Error");
    }
  },
  getMyProfile: async (req, res) => {
    let username = req.user.username;
    try {
      const user = await User.findOne({
        attributes: { exclude: ["password"] },
        where: { username: username },
      });
      return responseSuccess(res, 200, user);
    } catch (err) {
      return responseError(res, 500, "Internal Error");
    }
  },
  searchUserbyUsername: async (req, res) => {
    let username = req.query.username;
    if (!username) {
      return responseError(res, 400, "Please input username");
    }
    try {
      const user = await User.findOne({
        attributes: { exclude: ["password"] },
        where: { username: username },
      });
      return responseSuccess(res, 200, user);
    } catch (err) {
      console.log(err);
      return responseError(res, 500, "Internal Error");
    }
  },
};

module.exports = userController;
