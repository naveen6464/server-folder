/*
   Service Name : Pillar
*/

/** ***************** Models Import ******************************************************** */

const httpStatus = require("http-status");
const logger = require("../config/logger");

/** ***************** Import Pillar model from model ******************************************************** */

const { Pillar } = require("../models");

/** ***************** ApiError from utils ******************************************************** */

const ApiError = require("../utils/ApiError");

/** ***************** counter from services ******************************************************** */

const counter = require("./counter.service");
const logsService = require("./logs.service");

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createPillar = async (userBodyData, user) => {
  const userBody = userBodyData;
  try {
    const check = await Pillar.exists({ title: userBody.title });
    if (!check) {
      const id = await counter.getCount("pillars"); // passing users id to get counter value to autoIncrement _id

      userBody._id = id.toString();
      userBody.createdBy = user._id;
      const pillar = await Pillar.create(userBody);
      const logBodyData = {
        action: "create",
        userId: userBody._id,
        collectionName: "pillars",
        data: userBody,
      };
      await logsService.createlogs(logBodyData);
      return pillar;
    }
    return { message: "title is already found" };
    // throw new ApiError(httpStatus.CONFLICT, "title is already found");
  } catch (e) {
    logger.error(e);
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
const queryPillars = async (filterData, options, req) => {
  const filter = filterData;
  try {
    const logBodyData = {
      action: "get",
      userId: req.user._id,
      collectionName: "pillars",
      data: filter,
    };
    await logsService.createlogs(logBodyData);
    if (filter.title)
      filter.title = { $regex: `${escapeRegExp(filter.title)}`, $options: "i" };

    const pillars = await Pillar.paginate(filter, options, {
      createdBy: 0,
      updatedBy: 0,
      isDeleted: 0,
    }); // This third argument is to remove the field from response
    return pillars;
  } catch (e) {
    logger.error(e);
  }
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getPillarById = async (id) => {
  try {
    const logBodyData = {
      action: "get",
      userId: id,
      collectionName: "pillars",
      data: { _id: id },
    };
    await logsService.createlogs(logBodyData);
    return Pillar.find({ _id: id, isDeleted: false }, { isDeleted: 0 }); // find by id and isDeleted is false
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
const updatePillarById = async (pillarId, updateBodyData, user) => {
  const updateBody = updateBodyData;
  try {
    const pillar = await Pillar.findById(pillarId);
    if (!pillar) {
      throw new ApiError(httpStatus.NOT_FOUND, "Pillar not found");
    }
    const logBodyData = {
      action: "update",
      userId: user._id,
      collectionName: "pillars",
      data: updateBody,
    };
    await logsService.createlogs(logBodyData);

    const check = await Pillar.exists({ title: updateBody.title });
    if (!check) {
      updateBody.updatedBy = user._id; // updatedBy is set to user id from token
      await Object.assign(pillar, updateBody);
      await pillar.save();
      return pillar;
    }
    if (updateBody.title === pillar.title) {
      updateBody.updatedBy = user._id; // updatedBy is set to user id from token
      await Object.assign(pillar, updateBody);
      await pillar.save();
      return pillar;
    }
    throw new ApiError(httpStatus.NOT_FOUND, "title already exist");
  } catch (e) {
    logger.error(e);
  }
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deletePillarById = async (pillarId) => {
  try {
    const pillar = await Pillar.findById(pillarId);
    const logBodyData = {
      action: "delete",
      userId: pillarId,
      collectionName: "pillars",
      data: { _id: pillarId },
    };
    await logsService.createlogs(logBodyData);
    if (!pillar) {
      throw new ApiError(httpStatus.NOT_FOUND, "Pilar not found");
    }
    pillar.isDeleted = true;
    pillar.save();
    return pillar;
  } catch (e) {
    logger.error(e);
  }
};

// export all the service to use in pillar.controller.js

module.exports = {
  createPillar,
  queryPillars,
  getPillarById,
  updatePillarById,
  deletePillarById,
};
