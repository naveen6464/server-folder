/*
   Service Name : ProposedProject
*/

/** ***************** Models Import ******************************************************** */

const httpStatus = require("http-status");

/** ***************** Import ProposedProject model from model ******************************************************** */

const { ProposedProjectRequest, User } = require("../models");

/** ***************** ApiError from utils ******************************************************** */

const ApiError = require("../utils/ApiError");

/** ***************** counter from services ******************************************************** */

const counter = require("./counter.service");
const emailService = require("./email.service");
const logsService = require("./logs.service");

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createProposedProject = async (userBodyData, user) => {
  const userBody = userBodyData;

  const id = await counter.getCount("proposedProjects"); // passing users id to get counter value to autoIncrement _id

  userBody._id = id.toString();
  userBody.createdBy = user._id;
  userBody.userId = user._id;

  const proposedproject = await ProposedProjectRequest.create(userBody);
  const userEmail = await User.find({ _id: proposedproject.userId });
  const admin = await User.find({
    role: { $in: ["admin"] },
    isDeleted: false,
  });
  const emailData = {
    corematicaName: userEmail[0].corematicaName,
    lastName: userEmail[0].lastName,
    firstName: userEmail[0].firstName,
    adminName: admin,
    proposedProject: proposedproject.proposedProject,
    userId: userEmail[0]._id,
    type: "proposedProject",
  };
  emailService.sendProposedProjectCreatedEmail(userEmail[0].email, emailData);
  const logBodyData = {
    action: "create",
    userId: user._id,
    collectionName: "proposedProject",
    data: userBody,
  };
  await logsService.createlogs(logBodyData);
  return proposedproject;
  // }
  // throw new ApiError(httpStatus.CONFLICT, "title is already found");
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
const queryProposedProjects = async (
  filterData,
  options,
  join,
  joinOption,
  req
) => {
  const filter = filterData;

  const logBodyData = {
    action: "get",
    userId: req.user._id,
    collectionName: "proposedProject",
    data: filter,
  };
  await logsService.createlogs(logBodyData);
  if (filter.proposedProject)
    filter.proposedProject = {
      $regex: `${escapeRegExp(filter.proposedProject)}`,
      $options: "i",
    };

  const proposedprojects = await ProposedProjectRequest.paginate(
    filter,
    options,
    {
      createdBy: 0,
      updatedBy: 0,
      isDeleted: 0,
    },
    join,
    joinOption
  ); // This third argument is to remove the field from response
  return proposedprojects;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */

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
const updateProposedProjectById = async (
  proposedprojectId,
  updateBodyData,
  user
) => {
  const updateBody = updateBodyData;
  const proposedproject = await ProposedProjectRequest.findById(
    proposedprojectId
  );
  if (!proposedproject) {
    throw new ApiError(httpStatus.NOT_FOUND, "ProposedProject not found");
  }
  updateBody.updatedBy = user._id; // updatedBy is set to user id from token
  await Object.assign(proposedproject, updateBody);
  await proposedproject.save();
  const logBodyData = {
    action: "update",
    userId: proposedproject._id,
    collectionName: "proposedProject",
    data: updateBody,
  };
  await logsService.createlogs(logBodyData);
  return proposedproject;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */

module.exports = {
  createProposedProject,
  queryProposedProjects,
  updateProposedProjectById,
};
