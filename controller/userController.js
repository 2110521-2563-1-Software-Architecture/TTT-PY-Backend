const { response } = require("express");
const userModel = require("../model/user");
const { responseError } = require("../util/response");
const userController = {
  getAllUser: (req, res) => {
    userModel.getAllUser(
      ["username", "email", "firstname", "lastname"],
      (err, data) => {
        res.json(data);
      }
    );
  },
  getUserbyUsername: (req, res) => {
    let username = req.query.username;
    userModel.getFieldsByUsername(
      ["username", "email", "firstname", "lastname"],
      username,
      (err, data) => {
        res.json(data);
      }
    );
  },
  addFriendbyUsername: (req, res) => {
    let friend = req.body.friend;
    // let username = req.user.username;
    let username = req.body.username;
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
                userModel.getFriendshipbyUsername(
                  username,
                  friend,
                  (err, results) => {
                    if (results.length) {
                      return responseError(400, "You're already friend", res);
                    } else {
                      userModel.getFriendshipbyUsername(
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
                            userModel.addFriendshipbyUsername(
                              username,
                              friend,
                              (err, results) => {
                                res.json(results);
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
    // let username = req.user.username;
    let username = req.body.username;
    userModel.getFriendshipListbyUsername(username, (err, results) => {
      res.json(results);
    });
  },
};

module.exports = userController;
