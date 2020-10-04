const friendshipModel = require("../model/friendship");
const userModel = require("../model/user");
const { responseError, responseSuccess } = require("../util/response");
const friendshipController = {
  addFriendbyUsername: (req, res) => {
    let friend = req.body.username;
    let username = req.user.username;
    if (username === friend) {
      return responseError(400, "You can't be friend with yourself", res);
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
                      return responseError(400, "You're already friend", res);
                    } else {
                      friendshipModel.getFriendshipbyUsername(
                        username,
                        friend,
                        (err, results) => {
                          if (results.length) {
                            return responseError(
                              400,
                              "You're already friend",
                              res
                            );
                          } else {
                            friendshipModel.addFriendshipbyUsername(
                              username,
                              friend,
                              (err, results) => {
                                if (err) {
                                  console.log(err);
                                  return responseError(
                                    500,
                                    "Internal Error",
                                    res
                                  );
                                }
                                return responseSuccess(201, results, res);
                              }
                            );
                          }
                        }
                      );
                    }
                  }
                );
              } else {
                return responseError(400, "Friend username is invalid", res);
              }
            }
          );
        } else {
          return responseError(400, "Your username is invalid", res);
        }
      });
    }
  },
  getFriendshipListbyUsername: (req, res) => {
    let username = req.user.username;
    friendshipModel.getFriendshipListbyUsername(username, (err, results) => {
      if (err) {
        console.log(err);
        return responseError(500, "Internal Error", res);
      }
      return responseSuccess(201, results, res);
    });
  },
};
module.exports = friendshipController;
