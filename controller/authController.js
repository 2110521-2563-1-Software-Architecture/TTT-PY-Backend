const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { responseSuccess, responseError } = require("../utils/response");
const config = require("../config/config");

const authController = {
  register: (req, res, next) => {
    console.log(req.body);
    const { username, email, password } = req.body;
    db.query(
      "SELECT username FROM User WHERE username = ?",
      [username],
      async (error, results) => {
        if (error) {
          console.log(error);
          return responseError(500, "Internal Error", res);
        }

        if (results.length) {
          return responseError(400, "This username is already in use", res);
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        db.query(
          "INSERT INTO User SET ?",
          {
            Username: username,
            Email: email,
            Password: hashedPassword,
          },
          (error, results) => {
            if (error) {
              console.log(error);
              return responseError(500, "Internal Error", res);
            }
            console.log(results);
            return responseSuccess(
              201,
              { username: username, email: email },
              res
            );
          }
        );
      }
    );
  },
  login: async (req, res, next) => {
    try {
      console.log(req.body);
      const { username, password } = req.body;

      if (!username || !password) {
        return responseError(
          400,
          "Please provide an username and password",
          res
        );
      }

      db.query(
        "SELECT * FROM User WHERE username = ?",
        [username],
        async (error, results) => {
          if (error) {
            console.log(error);
            return responseError(500, "Internal Error", res);
          }

          console.log(results);
          if (
            !results ||
            !(await bcrypt.compare(password, results[0].Password))
          ) {
            return responseError(400, "Username or password is incorrect", res);
          }

          const username = results[0].Username;

          const token = jwt.sign({ username }, config.jwtSecret, {
            expiresIn: config.jwtExpiresIn,
          });

          console.log("The token is: " + token);

          const cookieOptions = {
            expires: new Date(
              Date.now() + config.jwtCookieExpires * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
          };

          res.cookie("jwt", token, cookieOptions);
          return responseSuccess(200, null, res);
        }
      );
    } catch (error) {
      console.log(error);
    }
  },
};

module.exports = authController;
