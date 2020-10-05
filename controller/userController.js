const userModel = require("../model/user");
const { responseError, responseSuccess } = require("../utils/response");
const userController = {
  getAllUser: (req, res) => {
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
  searchUserbyUsername: (req, res) => {
    let username = req.query.username;
    if (!username) {
      return responseError(res, 400, "Please input username");
    }
    userModel.getFieldsByUsername(
      ["username", "email", "firstname", "lastname"],
      username,
      (err, results) => {
        if (err) {
          console.log(err);
          return responseError(res, 500, "Internal Error");
        }
        return responseSuccess(res, 200, results[0]);
      }
    );
  },
};

module.exports = userController;
