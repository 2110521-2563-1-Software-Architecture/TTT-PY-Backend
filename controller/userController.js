const userModel = require("../model/user");
const { responseError, responseSuccess } = require("../utils/response");
const userController = {
  getAllUser: (req, res) => {
    userModel.getAllUser(
      ["username", "email", "firstname", "lastname"],
      (err, results) => {
        if (err) {
          console.log(err);
          return responseError(500, "Internal Error", res);
        }
        return responseSuccess(200, results, res);
      }
    );
  },
  searchUserbyUsername: (req, res) => {
    let username = req.query.username;
    userModel.getFieldsByUsername(
      ["username", "email", "firstname", "lastname"],
      username,
      (err, results) => {
        if (err) {
          console.log(err);
          return responseError(500, "Internal Error", res);
        }
        return responseSuccess(200, results, res);
      }
    );
  },
};

module.exports = userController;
