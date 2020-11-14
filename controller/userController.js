const User = require("../model/user");
const { responseError, responseSuccess } = require("../utils/response");
const userUtil = {
  userValid: async (username) => {
    try {
      const user = await User.findOne({
        attributes: { exclude: ["password"] },
        where: { username: username },
      });
      return user;
    } catch (err) {
      throw err;
    }
  },
};
const userController = {
  getAllUser: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ["password"] },
      });
      return responseSuccess(res, 200, users);
    } catch (err) {
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
  editMyProfile: async (req, res) => {
    let username = req.user.username;
    let { email, firstName, lastName, img } = req.body;
    try {
      await User.update(
        { email, firstName, lastName, img },
        {
          where: { username: username },
        }
      );
      return responseSuccess(res, 200, {}, "Profile is updated");
    } catch (err) {
      return responseError(res, 500, "Internal Error");
    }
  },
};

module.exports.userController = { ...userController, ...userUtil };
