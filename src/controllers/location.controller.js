/*
   controller Name : Location
*/

/** ******************  Import httpStatus ******************************************************** */

const httpStatus = require("http-status");
/** ******************  Import pick,ApiError and catchAsync ******************************************************** */
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

/** ******************  Import Services ******************************************************** */
const { locationService } = require("../services");

// create location controller
const createLocation = catchAsync(async (req, res) => {
  const location = await locationService.createLocation(req.body);
  res.status(httpStatus.CREATED).send(location);
});

// get location based on query
const getLocations = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["location"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await locationService.queryLocations(filter, options, req);
  res.send(result);
});

// get location based on locationId
const getLocation = catchAsync(async (req, res) => {
  const location = await locationService.getLocationById(req.params.locationId);
  if (!location) {
    throw new ApiError(httpStatus.NOT_FOUND, "Location not found");
  }
  res.send(location);
});

// update location based on locationId
const updateLocation = catchAsync(async (req, res) => {
  const location = await locationService.updateLocationById(
    req.params.locationId,
    req.body,
    req.user
  );
  res.send(location);
});

// delete location based on the locationId
const deleteLocation = catchAsync(async (req, res) => {
  await locationService.deleteLocationById(req.params.locationId);
  res.status(200).send({ success: true });
});

// exports all the controller to use in location.route.js
module.exports = {
  createLocation,
  getLocations,
  getLocation,
  updateLocation,
  deleteLocation,
};
