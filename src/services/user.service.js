/*
   Service Name : Users
*/

/** ***************** Models Import ******************************************************** */
const httpStatus = require("http-status");
const logger = require("../config/logger");
const { User, ApprovedRequest, SponsorDetails } = require("../models");

/** ***************** package Import ******************************************************** */

/** ***************** ApiError Import ******************************************************** */
const ApiError = require("../utils/ApiError");

/** ***************** Counter services Import ******************************************************** */
const counter = require("./counter.service");
const logsService = require("./logs.service");

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */

const createUser = async (userBodyData) => {
  const userBody = userBodyData;

  // const { corematicaName } = userBody;
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }

  const id = await counter.getCount("users"); // passing users id to get counter value to autoIncrement _id

  userBody._id = id.toString();
  userBody.createdBy = userBody.userId;
  try {
    const user = await User.create(userBody);
    const logBodyData = {
      action: "create",
      userId: userBody._id,
      collectionName: "users",
      data: userBody,
    };
    await logsService.createlogs(logBodyData);
    return user;
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
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\#\|\|]/g, "\\$&"); // To remove the mongo search paranthesis
}
const queryUsers = async (filterData, options, req) => {
  const filter = filterData;
  const logBodyData = {
    action: "get",
    userId: req.user._id,
    collectionName: "users",
    data: filter,
  };
  await logsService.createlogs(logBodyData);
  if (filter.corematicaName) {
    filter.$or = [
      {
        lastName: {
          $regex: `${escapeRegExp(filter.corematicaName)}`,
          $options: "i",
        },
      },
      {
        firstName: {
          $regex: `${escapeRegExp(filter.corematicaName)}`,
          $options: "i",
        },
      },
    ];
  }
  delete filter.corematicaName;
  try {
    const users = await User.paginate(filter, options, {
      createdBy: 0,
      updatedBy: 0,
      isDeleted: 0,
    }); // This third argument is to remove the field from response

    return users;
  } catch (e) {
    logger.error(e);
  }
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  try {
    const logBodyData = {
      action: "get",
      userId: id,
      collectionName: "users",
      data: { _id: id },
    };
    await logsService.createlogs(logBodyData);
    return User.find({ _id: id, isDeleted: false }, { isDeleted: 0 });
  } catch (e) {
    logger.error(e);
  }
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email, isDeleted: false, isActive: true });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBodyData) => {
  const updateBody = updateBodyData;

  const user = await User.findById(userId);
  const logBodyData = {
    action: "update",
    userId: user._id,
    collectionName: "users",
    data: updateBody,
  };
  await logsService.createlogs(logBodyData);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (updateBody.role) {
    const { role } = updateBody;
    if (!role.includes("sponsor")) {
      await SponsorDetails.findOneAndUpdate(
        { sponsorId: user._id },
        { isActive: false }
      );
    }
    if (!role.includes("resource")) {
      await ApprovedRequest.findOneAndUpdate(
        { userId: user._id },
        { isActive: false }
      );
    }
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  updateBody.updatedBy = updateBody.userId;
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await User.findById(userId);
  const logBodyData = {
    action: "delete",
    userId,
    collectionName: "users",
    data: userId,
  };
  await logsService.createlogs(logBodyData);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  // await user.remove();
  user.isDeleted = true;
  await user.save();
  return user;
};
// get user based on resource
const getResourceByRole = async (role) => {
  try {
    return await User.find({ role: { $in: [role] }, isDeleted: false })
      .populate({
        path: "location",
        model: "locations",
        select: "location",
      })
      .sort({
        lastName: 1,
      });
  } catch (e) {
    logger.error(e);
  }
};
// get user based on sponsor
const getSponsorByRole = async (role) => {
  try {
    return await User.find({ role: { $in: [role] }, isDeleted: false })
      .populate({
        path: "location",
        model: "locations",
        select: "location",
      })
      .sort({
        lastName: 1,
      });
  } catch (e) {
    logger.error(e);
  }
};

const createSponsorDetails = async (userBodyData) => {
  const userBody = userBodyData;
  try {
    const check = await SponsorDetails.find({
      projectId: userBody.projectId,
      sponsorId: userBody.sponsorId,
      isActive: true,
    });
    if (check.length === 0) {
      const id = await counter.getCount("sponsorsDetails"); // passing users id to get counter value to autoIncrement _id
      userBody._id = id.toString();
      const sponsorDetails = await SponsorDetails.create(userBody);
      const logBodyData = {
        action: "create",
        userId: userBody._id,
        collectionName: "sponsorsDetails",
        data: userBody,
      };
      await logsService.createlogs(logBodyData);
      return sponsorDetails;
    }
    const error = { error: "already exist" };
    return error;
  } catch (e) {
    logger.error(e);
  }
};

const getSponsorDetails = async (id) => {
  try {
    const sponsorDetails = await SponsorDetails.find({ projectId: id })
      .populate(`sponsorId projectId`)
      .sort({ _id: -1 });
    return sponsorDetails;
  } catch (e) {
    logger.error(e);
  }
};

const getSponsoredUser = async (
  filterData,
  options,
  join,
  joinOptions,
  req
) => {
  try {
    const filter = filterData;
    delete filter.isDeleted;
    const projectId = [];
    await SponsorDetails.find({ sponsorId: req.user._id }).then((e) => {
      e.forEach((data) => {
        projectId.push(data.projectId);
      });
    });
    filter.projectId = { $in: projectId };
    filter.isActive = true;

    const sponsorDetails = await ApprovedRequest.paginate(
      filter,
      options,
      { createdBy: 0, updatedBy: 0, isDeleted: 0 },
      join,
      joinOptions
    ); // This third argument is to
    return sponsorDetails;
  } catch (e) {
    logger.error(e);
  }
};

const createResourceDetails = async (userBodyData) => {
  const userBody = userBodyData;
  try {
    const id = await counter.getCount("approvedRequests"); // passing users id to get counter value to autoIncrement _id

    userBody._id = id.toString();
    const approvedService = await ApprovedRequest.create(userBody);

    return approvedService;
  } catch (e) {
    logger.error(e);
  }
};
const getResourceDetails = async (id) => {
  try {
    const approvedService = await ApprovedRequest.find({
      projectId: id,
      isActive: true,
    })
      .populate(`userId`)
      .sort({ _id: -1 });
    return approvedService;
  } catch (e) {
    logger.error(e);
  }
};
const updateResource = async (projectId, updateBodyData) => {
  const updateBody = updateBodyData;
  try {
    const approvedService = await ApprovedRequest.findOneAndUpdate(
      { projectId, userId: updateBody.userId },
      updateBody
    );
    if (!approvedService) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    return approvedService;
  } catch (e) {
    logger.error(e);
  }
};

const activeStatus = async (filterData, options, req) => {
  // const filter = filterData;
  try {
    const updated = new Date();
    await User.update(
      { _id: req.user._id },
      { lastSeen: updated, isLoggedIn: true }
    );
    // await User.update({}, { isLoggedIn: false }, { multi: true });
    return {
      status: "session updated successfully",
    };
  } catch (e) {
    logger.error(e);
  }
};

// exporting all the methods
module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  getResourceByRole,
  getSponsorByRole,
  createSponsorDetails,
  getSponsorDetails,
  createResourceDetails,
  getResourceDetails,
  getSponsoredUser,
  updateResource,
  activeStatus,
};
