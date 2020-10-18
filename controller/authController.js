const User = require("../model/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { responseSuccess, responseError } = require("../utils/response");
const config = require("../config/config");

const authController = {
  register: async (req, res, next) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return responseError(
        res,
        400,
        "Please provide username, email and password"
      );
    }

    try {
      const usernameIsInUse = async () => {
        return await User.findByPk(username);
      };
      if (!usernameIsInUse)
        return responseError(res, 400, "This username is already in use");
      let hashedPassword = await bcrypt.hash(password, 8);
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
      });
      return responseSuccess(res, 201, user);
    } catch (err) {
      return responseError(res, 500, "Internal Error");
    }
  },
  login: async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return responseError(res, 400, "Please provide username and password");
    }

    try {
      const loggingInUser = await User.findByPk(username);
      if (!loggingInUser) {
        return responseError(res, 400, "Username or password is incorrect");
      }
      if (!(await bcrypt.compare(password, loggingInUser.password))) {
        return responseError(res, 400, "Username or password is incorrect");
      }
      const token = jwt.sign(
        { username: loggingInUser.username },
        config.jwtSecret,
        {
          expiresIn: config.jwtExpiresIn,
        }
      );
      const cookieOptions = {
        expires: new Date(
          Date.now() + config.jwtCookieExpires * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
      };
      res.cookie("jwt", token, cookieOptions);
      return responseSuccess(res, 201, { token });
    } catch (err) {
      return responseError(res, 500, "Internal Error");
    }
  },
};

module.exports = authController;
