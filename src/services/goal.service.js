/*
   Service Name : goal
*/

/** ***************** Models Import ******************************************************** */
const httpStatus = require("http-status");
const logger = require("../config/logger");

/** ***************** Import Goal model from model ******************************************************** */
const { Goal } = require("../models");
/** ***************** ApiError from utils ******************************************************** */

const ApiError = require("../utils/ApiError");

/** ***************** counter from services ******************************************************** */

const counter = require("./counter.service");
const logsService = require("./logs.service");

/**
 * Create a goal
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createGoal = async (userBodyData, user) => {
  const userBody = userBodyData;

  try {
    const check = await Goal.find({ title: userBody.title, isDeleted: false });
    if (!check.length) {
      const id = await counter.getCount("goals"); // passing users id to get counter value to autoIncrement _id
      userBody._id = id.toString();
      userBody.createdBy = await user._id;
      const goal = await Goal.create(userBody);
      if (!goal) throw new Error("goal not created");
      const logBodyData = {
        action: "create",
        userId: userBody._id,
        collectionName: "goals",
        data: userBody,
      };
      await logsService.createlogs(logBodyData);
      return await goal;
    }
    throw new Error(" goal already exist");
  } catch (e) {
    logger.error(e);
    throw new ApiError(httpStatus.CONFLICT, e);
  }
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"); // To remove the mongo search paranthesis
}
const queryGoals = async (filterData, options, req) => {
  const filter = filterData;
  try {
    const logBodyData = {
      action: "get",
      userId: req.user._id,
      collectionName: "goals",
      data: filter,
    };
    await logsService.createlogs(logBodyData);
    // 3rd and 4th argment for population , join, joinOption
    if (filter.title)
      filter.title = { $regex: `${escapeRegExp(filter.title)}`, $options: "i" };
    const Goals = await Goal.paginate(filter, options, {
      createdBy: 0,
      updatedBy: 0,
      isDeleted: 0,
    }); // This third argument is to remove the field from response

    return Goals;
  } catch (e) {
    logger.error(e);
  }
};

/**
 * Get user by id
 * @param {ObjectId} ide
 * @returns {Promise<User>}
 */
const getGoalById = async (id) => {
  try {
    const logBodyData = {
      action: "get",
      userId: id,
      collectionName: "goals",
      data: { _id: id },
    };
    await logsService.createlogs(logBodyData);
    return Goal.find({ _id: id, isDeleted: false }, { isDeleted: 0 }).populate(
      "pillarId",
      `id title`
    );
  } catch (e) {
    logger.error(e);
  }
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateGoalById = async (goalId, updateBodyData, user) => {
  const updateBody = updateBodyData;

  const goal = await Goal.findById(goalId);
  const logBodyData = {
    action: "update",
    userId: goal._id,
    collectionName: "goals",
    data: updateBody,
  };
  await logsService.createlogs(logBodyData);
  if (!goal) {
    throw new ApiError(httpStatus.NOT_FOUND, "Goal not found");
  }

  const check = await Goal.exists({
    title: updateBody.title,
    isDeleted: false,
  });
  if (!check) {
    updateBody.updatedBy = user._id;
    Object.assign(goal, updateBody);
    await goal.save();
    return goal;
  }
  if (updateBody.title === goal.title) {
    updateBody.updatedBy = user._id;
    Object.assign(goal, updateBody);
    await goal.save();
    return goal;
  }
  throw new ApiError(httpStatus.NOT_FOUND, "title already exist");
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteGoalById = async (goalId) => {
  try {
    const goal = await Goal.findById(goalId);
    const logBodyData = {
      action: "delete",
      userId: goal._id,
      collectionName: "goals",
      data: { _id: goalId },
    };
    await logsService.createlogs(logBodyData);
    if (!goal) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    } else {
      goal.isDeleted = true;
      await goal.save();

      return goal;
    }
  } catch (e) {
    logger.error(e);
  }
};

// export all the service to use in goal.controller.js
module.exports = {
  createGoal,
  queryGoals,
  getGoalById,
  updateGoalById,
  deleteGoalById,
};
