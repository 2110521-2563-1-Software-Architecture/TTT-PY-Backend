const express = require("express");
const app = express();
const config = require("./config/config");
const port = config.appPort;
const bodyParser = require("body-parser");
const user = require("./routes/user");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/user", user);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
