/*
   controller Name : Dashboard
*/

/** ******************  Import httpStatus ******************************************************** */

const httpStatus = require("http-status");

/** ******************  Import pick,ApiError and catchAsync ******************************************************** */
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

/** ******************  Import Services ******************************************************** */
const { dashboardService } = require("../services");

// getAdminCount is to get the count of the document for admin
const getAdminCount = catchAsync(async (req, res, role) => {
  const project = await dashboardService.getAdminCount(req.user._id, role);
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  res.send(project);
});

// getUserCount is to get the count of the document for user
const getUserCount = catchAsync(async (req, res, role) => {
  const project = await dashboardService.getUserCount(req.user._id, role);
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  res.send(project);
});

// getResourceCount is to get the count of the documents for resource
const getResourceCount = catchAsync(async (req, res, next, role) => {
  const project = await dashboardService.getResourceCount(req.user._id, role);

  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  res.send(project);
});

// getSponsorCount is to get the count of the documents for sponsor
const getSponsorCount = catchAsync(async (req, res) => {
  const project = await dashboardService.getSponsorCount(req.user._id);
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  res.send(project);
});

// getApproverCount is to get the count of the documents for approver
const getApproverCount = catchAsync(async (req, res, role) => {
  const project = await dashboardService.getApproverCount(req.user._id, role);
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  res.send(project);
});

// get count based on the role in dashboard
const getCount = (req, res) => {
  const { role } = req.query;
  if (role === "admin") {
    getAdminCount(req, res, role);
  } else if (role === "sponsor") {
    getSponsorCount(req, res, role);
  } else if (role === "approver") {
    getApproverCount(req, res, role);
  } else if (role === "resource" || role === "lead" || role === "user") {
    getResourceCount(req, res, role);
  } else {
    getUserCount(req, res, role);
  }
};

// getPaymentAmount for user
const getPaymentAmount = catchAsync(async (req, res) => {
  if (req.params.userId === "{userId}") {
    const project = await dashboardService.getPaymentAmount(
      req.user._id,
      req.user.role
    );
    if (!project) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    res.send(project);
  } else {
    const project = await dashboardService.getPaymentAmountByUserId(
      req.params.userId,
      req.user.role
    );
    if (!project) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    res.send(project);
  }
});

// export all the function to use in routes
module.exports = {
  getCount,
  getPaymentAmount,
};
