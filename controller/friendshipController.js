const friendshipModel = require("../model/friendship");
const userModel = require("../model/user");
const { responseError, responseSuccess } = require("../utils/response");
const friendshipController = {
  addFriendbyUsername: (req, res) => {
    let friend = req.body.username;
    let username = req.user.username;
    if (!username || !friend) {
      return responseError(res, 400, "Please input username");
    }
    if (username === friend) {
      return responseError(res, 400, "You can't be friend with yourself");
    } else {
      userModel.getFieldsByUsername(["username"], username, (err, results) => {
        if (results.length) {
          userModel.getFieldsByUsername(
            ["username"],
            friend,
            (err, results) => {
              console.log(results);
              if (results.length) {
                friendshipModel.getFriendshipbyUsername(
                  username,
                  friend,
                  (err, results) => {
                    if (results.length) {
                      return responseError(res, 400, "You're already friend");
                    } else {
                      friendshipModel.getFriendshipbyUsername(
                        username,
                        friend,
                        (err, results) => {
                          if (results.length) {
                            return responseError(
                              res,
                              400,
                              "You're already friend"
                            );
                          } else {
                            friendshipModel.addFriendshipbyUsername(
                              username,
                              friend,
                              (err, results) => {
                                if (err) {
                                  console.log(err);
                                  return responseError(
                                    res,
                                    500,
                                    "Internal Error"
                                  );
                                }
                                return responseSuccess(res, 201, null);
                              }
                            );
                          }
                        }
                      );
                    }
                  }
                );
              } else {
                return responseError(res, 400, "Friend username is invalid");
              }
            }
          );
        } else {
          return responseError(res, 400, "Your username is invalid");
        }
      });
    }
  },
  getFriendshipListbyUsername: (req, res) => {
    let username = req.user.username;
    if (!username) {
      return responseError(res, 400, "Please input required username");
    }
    friendshipModel.getFriendshipListbyUsername(username, (err, results) => {
      if (err) {
        console.log(err);
        return responseError(res, 500, "Internal Error");
      }
      return responseSuccess(res, 201, results);
    });
  },
};
module.exports = friendshipController;
