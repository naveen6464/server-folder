/*
   validation Name : payRelease
*/

/** ***************** package  Import ******************************************************** */

const Joi = require("@hapi/joi");

/*
function createPayRelease- This function is used to validate PayReleaseInputs

*/
const createPayRelease = {
  body: Joi.object().keys({
    _id: Joi.string(),
    referenceDetails: Joi.string().allow(""),
    comments: Joi.string().allow(""),
    paymentRequestId: Joi.array(),
    projectId: Joi.array(),
    userId: Joi.array(),
  }),
};

/*
function getPayRelease- This function is used to validate getPayRelease query

*/
const getPayRelease = {
  query: Joi.object().keys({
    from: Joi.date(),
    to: Joi.date(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};
// export all the function
module.exports = {
  createPayRelease,
  getPayRelease,
};
