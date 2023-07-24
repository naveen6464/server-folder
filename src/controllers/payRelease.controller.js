/*
   controller Name : PayRelease
*/

/** ******************  Import httpStatus ******************************************************** */

const httpStatus = require("http-status");
/** ******************  Import pick,ApiError and catchAsync ******************************************************** */
const pick = require("../utils/pick");
const catchAsync = require("../utils/catchAsync");

/** ******************  Import Services ******************************************************** */
const { payReleaseService } = require("../services");

// create an payRelease with the required inputs from the post method
const createPayRelease = catchAsync(async (req, res) => {
  const payRelease = await payReleaseService.createPayRelease(
    req.body,
    req.user
  );
  res.status(httpStatus.CREATED).send(payRelease);
});

// get the details from the payRelease collection.
const getPayRelease = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["createdAt"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await payReleaseService.queryPayRelease(filter, options, req);
  res.send(result);
});

// export all the services to use in payReleaseControllers.
module.exports = {
  createPayRelease,
  getPayRelease,
};
