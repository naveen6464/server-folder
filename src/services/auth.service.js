/*
   Service Name : Auth
*/

/** ***************** Models Import ******************************************************** */
const httpStatus = require("http-status");

/** ***************** Import token and user service  from service ******************************************************** */
const tokenService = require("./token.service");
const userService = require("./user.service");

/** ***************** Import Token model from model ******************************************************** */
const Token = require("../models/token.model");
const User = require("../models/user.model");

/** ***************** ApiError from utils ******************************************************** */

const ApiError = require("../utils/ApiError");

/** ***************** tokenTypes from config/tokens ******************************************************** */

const { tokenTypes } = require("../config/tokens");
const logger = require("../config/logger");
const logsService = require("./logs.service");

/**
 * Login with corematicaName and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  try {
    const user = await userService.getUserByEmail(email);
    if (!user || !(await user.isPasswordMatch(password))) {
      throw new Error();
    }
    return user;
  } catch (error) {
    logger.error(error);
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  }
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  try {
    const refreshTokenDoc = await Token.findOne({
      token: refreshToken,
      type: tokenTypes.REFRESH,
      blacklisted: false,
    });
    if (!refreshTokenDoc) {
      throw new Error("not found");
    }
    await User.update(
      { _id: refreshTokenDoc.user },
      { isLoggedIn: false, lastSeen: Date.now() }
    );
    await refreshTokenDoc.remove();
  } catch (error) {
    logger.error(error);
    throw new ApiError(httpStatus.NOT_FOUND, "Not found");
  }
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(
      refreshToken,
      tokenTypes.REFRESH
    );
    const user = await User.findById(refreshTokenDoc.user);
    const logBodyData = {
      action: "refresh",
      userId: "",
      collectionName: "users",
      data: user,
    };
    await logsService.createlogs(logBodyData);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    logger.error(error);
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(
      resetPasswordToken,
      tokenTypes.RESET_PASSWORD
    );
    const user = await User.findById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
    await userService.updateUserById(user.id, { password: newPassword });
  } catch (error) {
    logger.error(error);
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password reset failed");
  }
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
};
