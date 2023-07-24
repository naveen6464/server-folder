/*
   controller Name : Project
*/

/** ******************  Import httpStatus ******************************************************** */

const httpStatus = require("http-status");
/** ******************  Import pick,ApiError and catchAsync ******************************************************** */
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

/** ******************  Import Services ******************************************************** */
const { projectService } = require("../services");

// create project controller
const createProject = catchAsync(async (req, res) => {
  const project = await projectService.createProject(req.body, req.user);
  res.status(httpStatus.CREATED).send(project);
});

// Get projects based on the query and also pagination
const getProjects = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    "title",
    "pillarId",
    "location",
    "type",
    "isClosed",
    "isActive",
    "goalId",
    "createdBy",
    "createdAt",
  ]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const join = "location"; // goalId pillarId'
  const joinOption = ""; // title
  const result = await projectService.queryProject(
    filter,
    options,
    join,
    joinOption,
    req
  );

  res.send(result);
});

// get projects by Id
const getProject = catchAsync(async (req, res) => {
  const project = await projectService.getProjectById(req.params.projectId);
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, "Project not found");
  }
  res.send(project);
});

// update the projects

const updateProject = catchAsync(async (req, res) => {
  const project = await projectService.updateProjectById(
    req.params.projectId,
    req.body,
    req.user
  );
  res.send(project);
});

// delete the projects based on id
const deleteProject = catchAsync(async (req, res) => {
  await projectService.deleteProjectById(req.params.projectId);
  res.status(200).send({ success: true });
});

// get project based on admin
const getAdminProjects = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["title", "_id"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const join = ""; // goalId pillarId'
  const joinOption = ""; // title
  const project = await projectService.getAdminProjects(
    filter,
    options,
    join,
    joinOption,
    req
  );
  res.send(project);
});
// get project based on approver
const getApproverProjects = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["title", "_id"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const join = ""; // goalId pillarId'
  const joinOption = ""; // title
  const project = await projectService.getApproverProjects(
    filter,
    options,
    join,
    joinOption,
    req
  );
  res.send(project);
});

// get projects based on resource
const getProjectByResourceId = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["title", "_id", "isClosed"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const join = ""; // goalId pillarId'
  const joinOption = ""; // title
  const project = await projectService.getProjectByResourceId(
    filter,
    options,
    join,
    joinOption,
    req.user._id,
    req
  );
  res.send(project);
});

// get project based on sponsor
const getProjectBySponsorID = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["isClosed"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const join = "location"; // goalId pillarId'
  const joinOption = ""; // title
  const project = await projectService.getProjectBySponsorID(
    filter,
    options,
    join,
    joinOption,
    req
  );
  res.send(project);
});

// get projects based on role(myProjects)
const getRoleProject = (req, res) => {
  const { role } = req.query;
  if (role === "admin") {
    getAdminProjects(req, res);
  } else if (role === "approver") {
    getApproverProjects(req, res);
  } else if (role === "resource" || role === "lead" || role === "user") {
    getProjectByResourceId(req, res);
  } else if (role === "sponsor") {
    getProjectBySponsorID(req, res);
  }
};

// get request based on query
const projectFilter = catchAsync(async (req, res) => {
  const filter = pick(req.body, [
    "type",
    "location",
    "isActive",
    "isClosed",
    "sponsor",
    "resource",
    "createdAt",
  ]);
  const options = pick(req.body, ["sortBy", "limit", "page"]);
  const join = "location";
  const joinOption = "";
  const result = await projectService.queryProjectFilter(
    filter,
    options,
    join,
    joinOption,
    req
  );
  res.send(result);
});

// export all the controller to use in project.route.js
module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getRoleProject,
  projectFilter,
};
