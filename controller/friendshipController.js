const Friendship = require("../model/friendship");
const User = require("../model/user");
const { Op } = require("sequelize");
const { responseError, responseSuccess } = require("../utils/response");
const friendshipController = {
  getFriendshipListbyUsername: async (req, res) => {
    let username = req.user.username;
    if (!username) {
      return responseError(res, 400, "Please input required username");
    }
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
    if (!username || !friend) {
      return responseError(res, 400, "Please input username");
    }
    if (username === friend) {
      return responseError(res, 400, "You can't be friend with yourself");
    }
    try {
      var usernameValid = await User.findOne({
        where: {
          username: username,
        },
      });
      if (!usernameValid) {
        return responseError(res, 400, "Your username is invalid");
      }
      var friendValid = await User.findOne({
        where: {
          username: friend,
        },
      });
      if (!friendValid) {
        return responseError(res, 400, "Friend username is invalid");
      }
      var isFriend = await Friendship.findOne({
        where: {
          [Op.or]: [
            { User_Username: username, Friend_Username: friend },
            { User_Username: friend, Friend_Username: username },
          ],
        },
      });
      if (isFriend) {
        return responseError(res, 400, "You're already friend");
      }
      await Friendship.create({
        User_Username: username,
        Friend_Username: friend,
      });
      return responseSuccess(res, 201, {}, "Friendship is created");
    } catch (err) {
      return responseError(res, 500, "Internal Error");
    }
  },
};
module.exports = friendshipController;
