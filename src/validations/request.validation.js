/*
   validation Name : request
*/

/** ***************** package  Import ******************************************************** */

const Joi = require("@hapi/joi");

/*
function createRequest - This function is used to validate request inputs

*/
const createRequest = {
  body: Joi.object().keys({
    _id: Joi.string(),
    type: Joi.string(),
    userId: Joi.string(),
    projectId: Joi.string(),
    requestId: Joi.string(),
    status: Joi.string(),
    grantedHours: Joi.number(),
    requestedHours: Joi.number(),
    usedHours: Joi.number(),
    pendingAmount: Joi.number(),
    approvedAmount: Joi.number(),
    paidAmount: Joi.number(),
    remainingHours: Joi.number(),
    requestorEmail: Joi.string(),
    amountToPay: Joi.number(),
    hoursToPay: Joi.string(),
    bodyOfWork: Joi.string(),
    isPaid: Joi.boolean(),
    payId: Joi.string(),
    hoursToAdd: Joi.string(),
    description: Joi.string().allow(""),
    duration: Joi.string(),
    isActive: Joi.boolean(),
  }),
};

/*
function getRequest - This function is used to validate request inputs

*/
const getRequest = {
  query: Joi.object().keys({
    type: Joi.string(),
    search: Joi.string().allow("").trim(),
    userId: Joi.string(),
    requestId: Joi.string(),
    projectId: Joi.string(),
    inProject: Joi.boolean(),
    isPaid: Joi.boolean(),
    status: Joi.string(),
    requestorEmail: Joi.string(),
    from: Joi.date(),
    to: Joi.date(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

/*
function getRequestBySearch - This function is used to validate request inputs
*/
const getRequestBySearch = {
  body: Joi.object().keys({
    type: Joi.array(),
    search: Joi.string().allow(""),
    userId: Joi.string(),
    requestId: Joi.string(),
    projectId: Joi.string(),
    inProject: Joi.boolean(),
    status: Joi.array(),
    requestorEmail: Joi.string(),
    from: Joi.date(),
    to: Joi.date(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const requestFilter = {
  body: Joi.object().keys({
    type: Joi.string(),
    userId: Joi.array(),
    projectId: Joi.array(),
    status: Joi.string(),
    isPaid: Joi.boolean(),
    location: Joi.array(),
    projectType: Joi.array(),
    generate: Joi.boolean(), // to generate reports csv
    requestHistory: Joi.boolean(), // to generate requestHistory csv
    from: Joi.date(),
    to: Joi.date(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

/*
function getService - This function is used to validate request id 

*/
const getRequestById = {
  params: Joi.object().keys({
    requestId: Joi.string(),
  }),
};

/*
function updateService - This function is used to validate request id and inputs  for updating

*/
const updateRequest = {
  params: Joi.object().keys({
    requestId: Joi.required(),
  }),
  body: Joi.object()
    .keys({
      type: Joi.string(),
      userId: Joi.string(),
      projectId: Joi.string(),
      requestId: Joi.string(),
      status: Joi.string(),
      reasonForRejection: Joi.string(),
      inProject: Joi.boolean(),
      grantedHours: Joi.number(),
      requestedHours: Joi.number(),
      usedHours: Joi.number(),
      pendingAmount: Joi.number(),
      approvedAmount: Joi.number(),
      paidAmount: Joi.number(),
      remainingHours: Joi.number(),
      requestorEmail: Joi.string(),
      amountToPay: Joi.number(),
      hoursToPay: Joi.string(),
      bodyOfWork: Joi.string(),
      isPaid: Joi.boolean(),
      payId: Joi.string(),
      hoursToAdd: Joi.string(),
      description: Joi.string().allow(""),
      updatedAt: Joi.date(),
      duration: Joi.string(),
      isActive: Joi.boolean(),
    })
    .min(1),
};

/*
function deleteService - This function is used to validate the id to delete request

*/
const deleteRequest = {
  params: Joi.object().keys({
    requestId: Joi.string(),
  }),
};
/*
function myService - This function is used to validate myService

*/
const myRequests = {
  query: Joi.object().keys({
    type: Joi.string(),
    isPaid: Joi.string(),
    userId: Joi.string(),
    status: Joi.string(),
    search: Joi.string().allow(""),
    from: Joi.date(),
    to: Joi.date(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

/*
function v- This function is used to validate the id to delete myPaymentRequest

*/
const myPayments = {
  query: Joi.object().keys({
    requestorEmail: Joi.string(),
    from: Joi.date(),
    to: Joi.date(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const downloadCsv = {
  query: Joi.object().keys({
    type: Joi.string(),
    fileName: Joi.string(),
  }),
};

module.exports = {
  createRequest,
  getRequest,
  requestFilter,
  getRequestById,
  updateRequest,
  deleteRequest,
  myRequests,
  myPayments,
  getRequestBySearch,
  downloadCsv,
};
