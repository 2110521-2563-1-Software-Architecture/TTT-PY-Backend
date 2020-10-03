const express = require("express");
const app = express();
const config = require("./config/config");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const db = require("./config/db");

const port = config.appPort;

app.get("/user", (req, res) => {
  let sql = "SELECT * FROM User";

  db.query(sql, (err, results) => {
    if (err) throw err;
    console.log(results);
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
