/*
   validation Name : ProposedProject
*/

/** ***************** package  Import ******************************************************** */

const Joi = require("@hapi/joi");

/*
function createProposedProject- This function is used to validate ProposedProjectInputs

*/
const createProposedProject = {
  body: Joi.object().keys({
    _id: Joi.string(),
    userId: Joi.string(),
    status: Joi.string(),
    proposedProject: Joi.string().allow(""),
    description: Joi.string().allow(""),
    createdBy: Joi.string(),
    updatedBy: Joi.string(),
    isActive: Joi.boolean(),
    isDelete: Joi.boolean(),
  }),
};

/*
function getProposedProject- This function is used to validate getProposedProject query

*/
const getProposedProject = {
  query: Joi.object().keys({
    userId: Joi.string(),
    status: Joi.string(),
    proposedProject: Joi.string(),
    from: Joi.date(),
    to: Joi.date(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

/*
function updatePillar - This function is used to validate pillar id and inputs  for updating

*/
const updateProposedProject = {
  params: Joi.object().keys({
    proposedId: Joi.required(),
  }),
  body: Joi.object()
    .keys({
      userId: Joi.string(),
      status: Joi.string(),
      proposedProject: Joi.string().allow(""),
      description: Joi.string().allow(""),
      createdBy: Joi.string(),
      updatedBy: Joi.string(),
      updatedAt: Joi.date(),
      isActive: Joi.boolean(),
      isDelete: Joi.boolean(),
    })
    .min(1),
};
// export all the function
module.exports = {
  createProposedProject,
  getProposedProject,
  updateProposedProject,
};
