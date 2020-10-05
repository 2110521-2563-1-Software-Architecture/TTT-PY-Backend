const db = require("../config/db");
const friendshipModel = {
  getFriendshipbyUsername: (username, friend, callback) => {
    let sql =
      "SELECT * FROM Friendship WHERE Friend_Username = ? and User_Username = ?";
    db.query(sql, [friend, username], (err, results) => {
      if (err) throw callback(err, null);
      callback(null, results);
    });
  },
  addFriendshipbyUsername: (username, friend, callback) => {
    let sql = "INSERT INTO Friendship SET ?";
    db.query(
      sql,
      { User_Username: username, Friend_Username: friend },
      (err, results) => {
        if (err) throw callback(err, null);
        callback(null, results);
      }
    );
  },
  getFriendshipListbyUsername: (username, callback) => {
    let sql1 =
      "SELECT username, email, firstname, lastname FROM Friendship JOIN User ON Friendship.User_Username = User.Username WHERE User_Username = ?";
    db.query(sql1, username, (err, results) => {
      if (err) throw callback(err, null);
      var myfriend = results;
      let sql2 =
        "SELECT username, email, firstname, lastname FROM Friendship JOIN  User ON Friendship.Friend_Username = User.Username WHERE Friend_Username = ? ";
      db.query(sql2, username, (err, results) => {
        if (err) throw callback(err, null);
        myfriend = myfriend.concat(results);
        callback(null, myfriend);
      });
    });
  },
};
module.exports = friendshipModel;
