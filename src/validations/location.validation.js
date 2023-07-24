/*
   validation Name : location
*/

/** ***************** package  Import ******************************************************** */

const Joi = require("@hapi/joi");

/*
function createLocation - This function is used to validate location inputs

*/
const createLocation = {
  body: Joi.object().keys({
    _id: Joi.string(),
    location: Joi.string().required().allow(""),
    isActive: Joi.boolean(),
    isDeleted: Joi.boolean(),
  }),
};

/*
function getLocations - This function is used to validate location inputs

*/
const getLocations = {
  query: Joi.object().keys({
    location: Joi.string().allow(""),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

/*
function getLocation - This function is used to validate location id 

*/
const getLocation = {
  params: Joi.object().keys({
    locationId: Joi.string(),
  }),
};

/*
function updateLocation - This function is used to validate location id and inputs  for updating

*/
const updateLocation = {
  params: Joi.object().keys({
    locationId: Joi.required(),
    isActive: Joi.boolean(),
    isDeleted: Joi.boolean(),
  }),
  body: Joi.object()
    .keys({
      location: Joi.string(),
    })
    .min(1),
};

/*
function deleteLocation - This function is used to validate the id to delete location

*/
const deleteLocation = {
  params: Joi.object().keys({
    locationId: Joi.string(),
  }),
};
// export all the function
module.exports = {
  createLocation,
  getLocations,
  getLocation,
  updateLocation,
  deleteLocation,
};
