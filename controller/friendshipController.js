const Friendship = require("../model/friendship");
const User = require("../model/user");
const { Op } = require("sequelize");
const { responseError, responseSuccess } = require("../utils/response");
const { userController } = require("./userController");
const friendUtil = {
  checkFriend: async (username, friend) => {
    try {
      var isFriend = await Friendship.findOne({
        where: {
          [Op.or]: [
            { User_Username: username, Friend_Username: friend },
            { User_Username: friend, Friend_Username: username },
          ],
        },
      });
      return isFriend;
    } catch (err) {
      throw err;
    }
  },
};
const friendshipController = {
  getFriendshipListbyUsername: async (req, res) => {
    let username = req.user.username;
    try {
      var friends1 = await Friendship.findAll({
        attributes: {
          exclude: ["password", "User_Username", "Friend_Username"],
          include: [["Friend_Username", "username"]],
        },
        where: {
          User_Username: username,
        },
      });
      try {
        var friends2 = await Friendship.findAll({
          attributes: {
            exclude: ["password", "User_Username", "Friend_Username"],
            include: [["User_Username", "username"]],
          },
          where: {
            Friend_Username: username,
          },
        });
        var friends = friends1.concat(friends2);
        return responseSuccess(res, 200, friends);
      } catch (err) {
        console.log(err);
        return responseError(res, 500, "Internal Error");
      }
    } catch (err) {
      console.log(err);
      return responseError(res, 500, "Internal Error");
    }
  },
  addFriendbyUsername: async (req, res) => {
    let username = req.user.username;
    let friend = req.body.username;
    if (username === friend) {
      return responseError(res, 400, "You can't be friend with yourself");
    }
    try {
      if (!(await userController.userValid(friend))) {
        return responseError(res, 400, "Invalid friend username");
      }
      if (await friendUtil.checkFriend(username, friend)) {
        return responseError(res, 400, "You're already friend");
      }
      await Friendship.create({
        User_Username: username,
        Friend_Username: friend,
      });
      return responseSuccess(res, 201, {}, "Friendship is created");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, "Internal Error");
    }
  },
};

module.exports.friendshipController = {
  ...friendshipController,
  ...friendUtil,
};
