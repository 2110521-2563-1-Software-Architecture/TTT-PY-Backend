const config = require("./config");
const mysql = require("mysql");

const port = config.appPort;

const db = mysql.createConnection({
  host: config.dbHost,
  user: config.dbUser,
  password: config.dbPass,
  database: "mydb",
});

db.connect((err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log("conected as id " + db.threadId);
});

module.exports = db;
