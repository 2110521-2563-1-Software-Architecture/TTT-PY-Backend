const User = require("../model/user");
const { responseError, responseSuccess } = require("../utils/response");
const userController = {
  getAllUserOld: (req, res) => {
    userModel.getAllUser(
      ["username", "email", "firstname", "lastname"],
      (err, results) => {
        if (err) {
          console.log(err);
          return responseError(res, 500, "Internal Error");
        }
        return responseSuccess(res, 200, results);
      }
    );
  },
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
};

module.exports = userController;
