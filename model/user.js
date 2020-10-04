const db = require("../config/db");
const userModel = {
  allUser: (callback) => {
    let sql = "SELECT * FROM User";
    db.query(sql, (err, results) => {
      if (err) throw callback(err, null);
      callback(null, results);
    });
  },
  searchUserbyUsername: (username, callback) => {
    let sql =
      "SELECT Username, FirstName, LastName FROM User WHERE Username = ?";
    db.query(sql, [username], (err, results) => {
      if (err) throw callback(err, null);
      callback(null, results);
    });
  },
};
module.exports = userModel;
