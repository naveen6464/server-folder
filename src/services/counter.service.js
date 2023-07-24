/*
   Service Name : Counters
*/

/** ***************** Models Import ******************************************************** */
const httpStatus = require("http-status");
const logger = require("../config/logger");
const { Counter } = require("../models");
const ApiError = require("../utils/ApiError");

/*
   function updateCount - This function used to update counters
   $countObject : 
   $currentId
*/
const updateCount = (countObject, keyName) => {
  return Counter.update({ keyName }, { $inc: { value: 1 } }, (err) => {
    if (err) throw new ApiError(httpStatus.CONFLICT, "counter error");
  });
};

const getCount = async (keyName) => {
  try {
    const countObject = await Counter.findOne({ keyName });
    let currentId = 1;
    if (countObject) {
      currentId = countObject.value + 1;
      updateCount(countObject, countObject.keyName);
    } else {
      const insert = new Counter({
        keyName,
        value: currentId,
      });
      insert.save(function (err) {
        if (err) throw new Error(err);
      });
    }
    return currentId;
  } catch (error) {
    logger.error(error);
    throw new ApiError(httpStatus.CONFLICT, "Error in id");
  }
};

module.exports = {
  getCount,
  updateCount,
};
