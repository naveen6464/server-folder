/*
   validation Name : goal
*/

/** ***************** package  Import ******************************************************** */

const Joi = require("@hapi/joi");

/*
function createGoal- This function is used to validate goalInputs

*/
const createGoal = {
  body: Joi.object().keys({
    _id: Joi.string(),
    goalDate: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().allow(""),
    isActive: Joi.boolean(),
  }),
};

/*
function getGoals - This function is used to validate goalInputs

*/
const getGoals = {
  query: Joi.object().keys({
    title: Joi.string().allow(""),
    createdBy: Joi.string(),
    isActive: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

/*
function getGoal- This function is used to validate goalId 

*/
const getGoal = {
  params: Joi.object().keys({
    goalId: Joi.string(),
  }),
};

/*
function updateGoal- This function is used to validate goalId and inputs  for updating

*/
const updateGoal = {
  params: Joi.object().keys({
    goalId: Joi.required(),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string().allow(""),
      goalDate: Joi.string(),
      description: Joi.string().allow(""),
      isActive: Joi.boolean(),
      updatedAt: Joi.date(),
    })
    .min(1),
};

/*
function deleteGoal- This function is used to validate the id to delete goal

*/
const deleteGoal = {
  params: Joi.object().keys({
    goalId: Joi.string(),
  }),
};

module.exports = {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  deleteGoal,
};
