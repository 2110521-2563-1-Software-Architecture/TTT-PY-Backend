const db = require("../config/db");
const userModel = {
  getAllUser: (fields, callback) => {
    let sql = "SELECT ?? FROM User";
    db.query(sql, [fields], (err, results) => {
      if (err) throw callback(err, null);
      callback(null, results);
    });
  },
  getFieldsByUsername: (fields, username, callback) => {
    let sql = "SELECT ?? FROM User WHERE username = ?";
    db.query(sql, [fields, username], (err, results) => {
      if (err) throw callback(err, null);
      callback(null, results);
    });
  },
  insertUser: (set, callback) => {
    let sql = "INSERT INTO User SET ?";
    db.query(sql, set, (err, results) => {
      if (err) throw callback(err, null);
      callback(null, results);
    });
  },
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
      "SELECT Friend_Username as Username FROM Friendship WHERE User_Username = ?";
    db.query(sql1, username, (err, results) => {
      if (err) throw callback(err, null);
      var myfriend = results;
      let sql2 =
        "SELECT User_Username as Username FROM Friendship WHERE Friend_Username = ?";
      db.query(sql2, username, (err, results) => {
        if (err) throw callback(err, null);
        myfriend = myfriend.concat(results);
        callback(null, myfriend);
      });
    });
  },
};
module.exports = userModel;
