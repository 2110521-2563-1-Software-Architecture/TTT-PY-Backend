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
};
module.exports = userModel;
