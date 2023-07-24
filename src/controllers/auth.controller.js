/*
   controller Name : Auth
*/

/** ******************  Import httpStatus and catchAsync(from utils) ******************************************************** */

const httpStatus = require("http-status");
const cron = require("node-cron");
const catchAsync = require("../utils/catchAsync");
const config = require("../config");
/** *****************  Import Services required for Auth api ******************************************************** */
const {
  authService,
  userService,
  tokenService,
  emailService,
} = require("../services");

const User = require("../models/user.model");
const logsService = require("../services/logs.service");

// Register function is used to register the new user
const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

// Login function is used to logIn the registered user

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

// Logout is to logout the logged user
const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken, req);
  req.logout();
  res.status(httpStatus.OK).send({ message: "logged out" });
});

// RefreshTokens is to create the auth token if token expires
const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

// forgot password is used to change the password with resetPasswordTokens
const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(
    req.body.email
  );
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

// resetPassword with resetPasswordToken
const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const googleAuth = catchAsync(async (req, res) => {
  try {
    if (req.user.id !== "error") {
      const { user } = req;
      const logBodyData = {
        action: "login",
        userId: user._id,
        collectionName: "users",
        data: {
          email: user.email,
          ip: req.ipInfo,
        },
      };
      await logsService.createlogs(logBodyData);

      Date.prototype.addMinutes = function (minutes) {
        this.setMinutes(this.getMinutes() + minutes);
        return this;
      };
      await User.update(
        { _id: user._id },
        { isLoggedIn: true, lastSeen: Date.now() }
      ).then(() => {
        cron.schedule("*/15 * * * *", async () => {
          const nonActiveId = [];
          await User.find({ isLoggedIn: true, isDeleted: false }).then(
            (res) => {
              res.forEach((e) => {
                const lastSeenAfter15minutes = new Date(e.lastSeen);
                const currentTime = new Date();
                lastSeenAfter15minutes.addMinutes(15);
                if (currentTime > lastSeenAfter15minutes) {
                  nonActiveId.push(e._id);
                }
              });
            }
          );
          if (nonActiveId.length)
            await User.update(
              { _id: { $in: nonActiveId } },
              { isLoggedIn: false },
              { multi: true }
            );
          // console.log("running every minute 3 seconds", data);
        });
      });
      const tokens = await tokenService.generateAuthTokens(user);
      res.redirect(
        `${config.url}/google/auth?access=${tokens.access.token}&refresh=${tokens.refresh.token}&userId=${user._id}`
      );
    } else {
      res.redirect(`${config.url}/unauthorized?email=${req.user.email}`);
    }
  } catch (e) {
    console.log(e);
  }
});

// export all the controller to use in routes
module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  googleAuth,
};
