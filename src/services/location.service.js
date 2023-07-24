/*
   Service Name : Location
*/

/** ***************** Models Import ******************************************************** */

const httpStatus = require("http-status");
const logger = require("../config/logger");

/** ***************** Import Location model from model ******************************************************** */

const { Location } = require("../models");

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
const createLocation = async (userBodyData) => {
  const userBody = userBodyData;
  try {
    const id = await counter.getCount("locations"); // passing users id to get counter value to autoIncrement _id

    userBody._id = id.toString();
    const location = await Location.create(userBody);
    const logBodyData = {
      action: "create",
      userId: userBody._id,
      collectionName: "locations",
      data: userBody,
    };
    await logsService.createlogs(logBodyData);
    return location;
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
const queryLocations = async (filterData, options, req) => {
  const filter = filterData;
  const logBodyData = {
    action: "get",
    userId: req.user._id,
    collectionName: "locations",
    data: filter,
  };
  await logsService.createlogs(logBodyData);
  try {
    if (filter.location)
      filter.location = { $regex: filter.location, $options: "i" };

    const locations = await Location.paginate(filter, options, {
      createdBy: 0,
      updatedBy: 0,
      isDeleted: 0,
    }); // This third argument is to remove the field from response
    return locations;
  } catch (e) {
    logger.error(e);
  }
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getLocationById = async (id) => {
  try {
    const logBodyData = {
      action: "get",
      userId: id,
      collectionName: "locations",
      data: { _id: id },
    };
    await logsService.createlogs(logBodyData);
    return Location.find({ _id: id, isDeleted: false }, { isDeleted: 0 }); // find by id and isDeleted is false
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
const updateLocationById = async (locationId, updateBodyData, user) => {
  const updateBody = updateBodyData;
  try {
    const location = await Location.findById(locationId);
    if (!location) {
      throw new ApiError(httpStatus.NOT_FOUND, "Location not found");
    }

    updateBody.updatedBy = user._id; // updatedBy is set to user id from token
    await Object.assign(location, updateBody);
    await location.save();
    const logBodyData = {
      action: "update",
      userId: location._id,
      collectionName: "locations",
      data: updateBody,
    };
    await logsService.createlogs(logBodyData);
    return location;
  } catch (e) {
    logger.error(e);
  }
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteLocationById = async (locationId) => {
  try {
    const location = await Location.findById(locationId);
    if (!location) {
      throw new ApiError(httpStatus.NOT_FOUND, "Pilar not found");
    }
    location.isDeleted = true;
    location.save();
    const logBodyData = {
      action: "delete",
      userId: locationId,
      collectionName: "locations",
      data: { _id: locationId },
    };
    await logsService.createlogs(logBodyData);
    return location;
  } catch (e) {
    logger.error(e);
  }
};

// export all the service to use in location.controller.js

module.exports = {
  createLocation,
  queryLocations,
  getLocationById,
  updateLocationById,
  deleteLocationById,
};
