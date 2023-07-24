/*
   validation Name : user
*/

/** ***************** package  Import ******************************************************** */

const Joi = require("@hapi/joi");

/** ***************** validation Import ******************************************************** */
const { password } = require("./custom.validation");

/*
function createUser - This function is used to validate user inputs

*/
const createUser = {
  body: Joi.object().keys({
    _id: Joi.string(),
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    role: Joi.array(),
    corematicaName: Joi.string().allow(""),
    firstName: Joi.string(),
    lastName: Joi.string(),
    mobileNumber: Joi.string().allow(""),
    street: Joi.string().allow(""),
    city: Joi.string().allow(""),
    state: Joi.string().allow(""),
    location: Joi.string().allow(""),
    isActive: Joi.boolean(),
  }),
};

/*
function getUser - This function is used to validate user inputs

*/
const getUsers = {
  query: Joi.object().keys({
    corematicaName: Joi.string().allow("").trim(),
    isLoggedIn: Joi.boolean(),
    lastSeen: Joi.date(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string(),
  }),
};

/*
function updateUser - This function is used to validate user id and inputs  for updating

*/

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required(),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      role: Joi.array(),
      corematicaName: Joi.string().allow(""),
      firstName: Joi.string().allow(""),
      lastName: Joi.string().allow(""),
      mobileNumber: Joi.string().allow(""),
      isLoggedIn: Joi.boolean(),
      lastSeen: Joi.date(),
      street: Joi.string().allow(""),
      city: Joi.string().allow(""),
      state: Joi.string().allow(""),
      location: Joi.string(),
      isActive: Joi.boolean(),
      updatedAt: Joi.date(),
    })
    .min(1),
};

/*
function deleteUser - This function is used to validate the id to delete user

*/
const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string(),
  }),
};

// exporting all the functions

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
