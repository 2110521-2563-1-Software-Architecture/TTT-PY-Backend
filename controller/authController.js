const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { responseSuccess, responseError } = require("../utils/response");
const config = require("../config/config");
const { getFieldsByUsername, insertUser } = require("../model/user");

const authController = {
  register: (req, res, next) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return responseError(400, "Incomplete input", res);
    }

    getFieldsByUsername(
      ["username", "email"],
      username,
      async (err, results) => {
        if (err) {
          console.log(err);
          return responseError(500, "Internal Error", res);
        }

        if (results.length) {
          return responseError(400, "This username is already in use", res);
        }

        let hashedPassword = await bcrypt.hash(password, 8);

        insertUser(
          {
            Username: username,
            Email: email,
            Password: hashedPassword,
          },
          async (err, results) => {
            if (err) {
              console.log(err);
              return responseError(500, "Internal Error", res);
            }
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
    const { username, password } = req.body;
    if (!username || !password) {
      return responseError(400, "Incomplete input", res);
    }

    if (!username || !password) {
      return responseError(400, "Please provide an username and password", res);
    }

    getFieldsByUsername("*", username, async (err, results) => {
      if (err) {
        console.log(err);
        return responseError(500, "Internal Error", res);
      }

      if (!results.length) {
        return responseError(400, "Username or password is incorrect", res);
      }

      if (!(await bcrypt.compare(password, results[0].Password))) {
        return responseError(400, "Username or password is incorrect", res);
      }

      const username = results[0].Username;

      const token = jwt.sign({ username }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn,
      });

      const cookieOptions = {
        expires: new Date(
          Date.now() + config.jwtCookieExpires * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
      };

      res.cookie("jwt", token, cookieOptions);
      return responseSuccess(200, { token }, res);
    });
  },
};

module.exports = authController;
