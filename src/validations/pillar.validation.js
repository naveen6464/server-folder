/*
   validation Name : pillar
*/

/** ***************** package  Import ******************************************************** */

const Joi = require("@hapi/joi");

/*
function createPillar - This function is used to validate pillar inputs

*/
const createPillar = {
  body: Joi.object().keys({
    _id: Joi.string(),
    title: Joi.string().required(),
    description: Joi.string().allow(""),
    isActive: Joi.boolean(),
  }),
};

/*
function getPillars - This function is used to validate pillar inputs

*/
const getPillars = {
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
function getPillar - This function is used to validate pillar id 

*/
const getPillar = {
  params: Joi.object().keys({
    pillarId: Joi.string(),
  }),
};

/*
function updatePillar - This function is used to validate pillar id and inputs  for updating

*/
const updatePillar = {
  params: Joi.object().keys({
    pillarId: Joi.required(),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string().allow(""),
      isActive: Joi.boolean(),
      description: Joi.string().allow(""),
      updatedAt: Joi.date(),
    })
    .min(1),
};

/*
function deletePillar - This function is used to validate the id to delete pillar

*/
const deletePillar = {
  params: Joi.object().keys({
    pillarId: Joi.string(),
  }),
};
// export all the function
module.exports = {
  createPillar,
  getPillars,
  getPillar,
  updatePillar,
  deletePillar,
};
