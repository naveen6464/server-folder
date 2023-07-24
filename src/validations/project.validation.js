/*
   validation Name : project
*/

/** ***************** package  Import ******************************************************** */

const Joi = require("@hapi/joi");

/*
function createProject - This function is used to validate project inputs

*/
const createProject = {
  body: Joi.object().keys({
    _id: Joi.string(),
    pillarId: Joi.array().required(),
    goalId: Joi.array().required(),
    status: Joi.string(),
    type: Joi.string(),
    title: Joi.string().required(),
    levelOfEffort: Joi.string().required(),
    location: Joi.string(),
    isClosed: Joi.boolean(),
    rateOfPay: Joi.number().required(),
    allocatedFund: Joi.number(),
    description: Joi.string().allow(""),
    usedAmount: Joi.number(),
    isActive: Joi.boolean(),
  }),
};

/*
function getProjects - This function is used to validate project inputs

*/
const getProjects = {
  query: Joi.object().keys({
    search: Joi.string().allow(""),
    title: Joi.string(),
    pillarId: Joi.string(),
    goalId: Joi.string(),
    isClosed: Joi.boolean(),
    isActive: Joi.boolean(),
    createdBy: Joi.string(),
    from: Joi.date(),
    to: Joi.date(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

/*
function getProject - This function is used to validate project id 

*/
const getProject = {
  params: Joi.object().keys({
    projectId: Joi.string(),
  }),
};

/*
function getProjectByUserID - This function is used to validate project by user id 

*/

const getRoleProject = {
  params: Joi.object().keys({
    role: Joi.string(),
    search: Joi.string(),
    isClosed: Joi.boolean(),
  }),
};

/*
function updateProject - This function is used to validate project id and inputs  for updating

*/
const updateProject = {
  params: Joi.object().keys({
    projectId: Joi.required(),
  }),
  body: Joi.object()
    .keys({
      pillarId: Joi.array(),
      goalId: Joi.array(),
      type: Joi.string(),
      status: Joi.string(),
      title: Joi.string(),
      levelOfEffort: Joi.string(),
      location: Joi.string(),
      isClosed: Joi.boolean(),
      rateOfPay: Joi.number(),
      allocatedFund: Joi.number(),
      description: Joi.string().allow(""),
      usedAmount: Joi.number(),
      isActive: Joi.boolean(),
      updatedAt: Joi.date(),
    })
    .min(1),
};

/*
function deleteProject - This function is used to validate the id to delete project

*/
const deleteProject = {
  params: Joi.object().keys({
    projectId: Joi.string(),
  }),
};

const projectFilter = {
  body: Joi.object().keys({
    type: Joi.string(),
    search: Joi.string().allow(""),
    location: Joi.array(),
    isClosed: Joi.boolean(),
    isActive: Joi.boolean(),
    sponsor: Joi.array(),
    resource: Joi.array(),
    from: Joi.date(),
    to: Joi.date(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};
// export all the function
module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  projectFilter,
  getRoleProject,
};
