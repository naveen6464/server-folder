/*
   controller Name : ProposedProject
*/

/** ******************  Import httpStatus ******************************************************** */

const httpStatus = require("http-status");
/** ******************  Import pick,ApiError and catchAsync ******************************************************** */
const pick = require("../utils/pick");
// const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

/** ******************  Import Services ******************************************************** */
const { proposedProjectService } = require("../services");

// create proposedproject controller
const createProposedProject = catchAsync(async (req, res) => {
  const proposedproject = await proposedProjectService.createProposedProject(
    req.body,
    req.user
  );
  res.status(httpStatus.CREATED).send(proposedproject);
});

// get proposedproject based on query
const getProposedProjects = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["userId", "status", "proposedProject"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const join = "userId"; // goalId pillarId'
  const joinOption = ""; // title
  const result = await proposedProjectService.queryProposedProjects(
    filter,
    options,
    join,
    joinOption,
    req
  );
  res.send(result);
});

// get proposedproject based on proposedprojectId
// const getProposedProject = catchAsync(async (req, res) => {
//   const proposedproject = await proposedProjectService.getProposedProjectById(req.params.proposedprojectId);
//   if (!proposedproject) {
//     throw new ApiError(httpStatus.NOT_FOUND, "ProposedProject not found");
//   }
//   res.send(proposedproject);
// });

// update proposedproject based on proposedprojectId
const updateProposedProject = catchAsync(async (req, res) => {
  const proposedproject = await proposedProjectService.updateProposedProjectById(
    req.params.proposedId,
    req.body,
    req.user
  );
  res.send(proposedproject);
});

// // delete proposedproject based on the proposedprojectId
// const deleteProposedProject = catchAsync(async (req, res) => {
//   await proposedprojectService.deleteProposedProjectById(req.params.proposedprojectId);
//   res.status(200).send({ success: true });
// });

// exports all the controller to use in proposedproject.route.js
module.exports = {
  createProposedProject,
  getProposedProjects,
  //   getProposedProject,
  updateProposedProject,
  //   deleteProposedProject,
};
