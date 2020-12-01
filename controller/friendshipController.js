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
          exclude: [
            "password",
            "User_Username",
            "Friend_Username",
            "isBlocked1",
            "isBlocked2",
          ],
          include: [
            ["Friend_Username", "username"],
            ["isBlocked2", "isBlocked"],
          ],
        },
        where: {
          User_Username: username,
        },
        include: {
          model: User,
          as: "friend_username",
          attributes: {
            exclude: ["password"],
          },
        },
      });
      try {
        var friends2 = await Friendship.findAll({
          attributes: {
            exclude: [
              "password",
              "User_Username",
              "Friend_Username",
              "isBlocked1",
              "isBlocked2",
            ],
            include: [
              ["User_Username", "username"],
              ["isBlocked1", "isBlocked"],
            ],
          },
          where: {
            Friend_Username: username,
          },
          include: {
            model: User,
            as: "user_username",
            attributes: {
              exclude: ["password"],
            },
          },
        });
        var friends = friends1.concat(friends2);
        // console.log(friends);
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
  blockFrinedByUsername: async (req, res) => {
    try {
      let username = req.user.username;
      let friend = req.body.username;
      if (!friend) {
        return responseError(res, 400, "No input username");
      }
      if (username === friend) {
        return responseError(res, 400, "You can't block yourself");
      }

      if (!(await userController.userValid(friend))) {
        return responseError(res, 400, "Invalid friend username");
      }
      const friendShip = await friendUtil.checkFriend(username, friend);
      if (!friendShip) {
        return responseError(res, 400, "You're not friend to each other");
      }

      let updateObject;
      if (username === friendShip.User_Username) {
        updateObject = { isBlocked2: true };
      } else {
        updateObject = { isBlocked1: true };
      }

      await Friendship.update(updateObject, {
        where: {
          User_Username: friendShip.User_Username,
          Friend_Username: friendShip.Friend_Username,
        },
      });
      return responseSuccess(res, 201, {}, "Block friend successful");
    } catch (err) {
      console.log(err);
      return responseError(res, 500, "Internal Error");
    }
  },
  unblockFriendByUsername: async (req, res) => {
    try {
      let username = req.user.username;
      let friend = req.body.username;
      if (!friend) {
        return responseError(res, 400, "No input username");
      }
      if (username === friend) {
        return responseError(res, 400, "You can't unblock yourself");
      }

      if (!(await userController.userValid(friend))) {
        return responseError(res, 400, "Invalid friend username");
      }
      const friendShip = await friendUtil.checkFriend(username, friend);
      if (!friendShip) {
        return responseError(res, 400, "You're not friend to each other");
      }

      let updateObject;
      if (username === friendShip.User_Username) {
        updateObject = { isBlocked2: false };
      } else {
        updateObject = { isBlocked1: false };
      }

      await Friendship.update(updateObject, {
        where: {
          User_Username: friendShip.User_Username,
          Friend_Username: friendShip.Friend_Username,
        },
      });
      return responseSuccess(res, 201, {}, "Unblock friend successful");
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
