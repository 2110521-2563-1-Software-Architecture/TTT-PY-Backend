const express = require("express");
const router = express.Router();
const { friendshipController } = require("../controller/friendshipController");
// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log("Time: ", Date.now());
  next();
});
// define the home page route
router.get("/", friendshipController.getFriendshipListbyUsername);
router.post("/add", friendshipController.addFriendbyUsername);

module.exports = router;
