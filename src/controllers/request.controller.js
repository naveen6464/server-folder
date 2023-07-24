/*
   controller Name : requests
*/

/** ******************  Import httpStatus ******************************************************** */

const httpStatus = require("http-status");
/** ******************  Import pick,ApiError and catchAsync ******************************************************** */
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

/** ******************  Import Services ******************************************************** */
const { requestService } = require("../services");

// create request controller
const createRequest = catchAsync(async (req, res) => {
  const joint = await requestService.createRequest(req.body, req.user);
  res.status(httpStatus.CREATED).send(joint);
});

// get request based on query
const getRequest = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    "status",
    "inProject",
    "requestorEmail",
    "requestId",
    "userId",
    "projectId",
    "type",
    "isPaid",
    "createdAt",
  ]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const join = [
    {
      path: "projectId",
      model: "projects",
      populate: {
        path: "location",
        model: "locations",
        select: "location",
      },
    },
    {
      path: "userId",
      model: "users",
    },
  ];
  const joinOption = "";
  const result = await requestService.queryRequest(
    filter,
    options,
    join,
    joinOption,
    req
  );
  res.send(result);
});

// get request by id
const getRequestById = catchAsync(async (req, res) => {
  const signup = await requestService.getRequestById(req.params.requestId);
  if (!signup) {
    throw new ApiError(httpStatus.NOT_FOUND, "signupRequest not found");
  }
  res.send(signup);
});

// update request based on id
const updateRequest = catchAsync(async (req, res) => {
  const signup = await requestService.updateRequest(
    req.params.requestId,
    req.body,
    req.user
  );
  res.send(signup);
});

const deleteRequest = catchAsync(async (req, res) => {
  await requestService.deleteRequest(req.params.requestId);
  res.status(200).send({ success: true });
});

//
// getServicesByResourceId is gives the sponsor myProject and service
const getRequestsBySponsorId = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["type", "isPaid", "status", "createdAt"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const join = [
    {
      path: "projectId",
      model: "projects",
      populate: {
        path: "location",
        model: "locations",
        select: "location",
      },
    },
    {
      path: "userId",
      model: "users",
    },
  ];
  const joinOption = "";
  const result = await requestService.getRequestsBySponsorId(
    filter,
    options,
    join,
    joinOption,
    req
  );
  res.send(result);
});

// get request based on the role {admin/approver/resource}(myProjects)
const getRoleRequests = (req, res) => {
  getRequestsBySponsorId(req, res);
};

// admin payments

const getAdminPayments = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["requestorEmail", "createdAt"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const join = "";
  const joinOption = "";
  const result = await requestService.getAdminPayments(
    filter,
    options,
    join,
    joinOption,
    req
  );
  // result.results = result.results.filter(e=>e.isDeleted!==true)
  res.send(result);
});

// approver payments
const getApproverPayments = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["requestorEmail", "createdAt"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const join = "";
  const joinOption = "";
  const result = await requestService.getApproverPayments(
    filter,
    options,
    join,
    joinOption,
    req
  );
  res.send(result);
});

// resourceId payments
const getPaymentsByResourceId = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["requestorEmail", "createdAt"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const join = "";
  const joinOption = "";
  const result = await requestService.getPaymentsByResourceId(
    filter,
    options,
    join,
    joinOption,
    req
  );
  res.send(result);
});

// resourceId payments
const getPaymentsBySponsorId = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["requestorEmail", "createdAt"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const join = "";
  const joinOption = "";
  const result = await requestService.getPaymentsBySponsorId(
    filter,
    options,
    join,
    joinOption,
    req
  );
  res.send(result);
});

// to get the payment based on the role {myprojects}
const getRolePayments = (req, res) => {
  const { role } = req.user;
  if (role[0] === "admin") {
    getAdminPayments(req, res);
  } else if (role[0] === "approver") {
    getApproverPayments(req, res);
  } else if (
    role[0] === "resource" ||
    role[0] === "lead" ||
    role[0] === "user"
  ) {
    getPaymentsByResourceId(req, res);
  } else if (role[0] === "sponsor") {
    getPaymentsBySponsorId(req, res);
  }
};

const getBySearch = catchAsync(async (req, res) => {
  const filter = pick(req.body, [
    "status",
    "requestorEmail",
    "requestId",
    "userId",
    "projectId",
    "type",
    "createdAt",
  ]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const join = "";
  const joinOption = "";
  const result = await requestService.queryBySearch(
    filter,
    options,
    join,
    joinOption,
    req
  );
  res.send(result);
});

// get request based on query
const requestFilter = catchAsync(async (req, res) => {
  const filter = pick(req.body, [
    "type",
    "userId",
    "isPaid",
    "status",
    "createdAt",
  ]);
  const options = pick(req.body, ["sortBy", "limit", "page"]);
  const join = [
    {
      path: "projectId",
      model: "projects",
      populate: {
        path: "location",
        model: "locations",
        select: "location",
      },
    },
    {
      path: "userId",
      model: "users",
    },
  ];
  const joinOption = "";
  const result = await requestService.queryRequestFilter(
    filter,
    options,
    join,
    joinOption,
    req,
    res
  );
  res.status(200).send(result);
});

const getCsv = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["fileName", "type"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const join = "";
  const joinOption = "";
  const result = await requestService.getCsv(
    filter,
    options,
    join,
    joinOption,
    req,
    res
  );
  res.set("Content-Type", "application/json");
  res.send(JSON.stringify(result));
});

// export all the request controller to use Request.controller.js
module.exports = {
  createRequest,
  getRequest,
  requestFilter,
  getRequestById,
  updateRequest,
  deleteRequest,
  getRoleRequests,
  getRolePayments,
  getBySearch,
  getCsv,
};
