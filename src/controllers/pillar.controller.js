/*
   controller Name : Pillar
*/

/** ******************  Import httpStatus ******************************************************** */

const httpStatus = require("http-status");
/** ******************  Import pick,ApiError and catchAsync ******************************************************** */
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

/** ******************  Import Services ******************************************************** */
const { pillarService } = require("../services");

// create pillar controller
const createPillar = catchAsync(async (req, res) => {
  const pillar = await pillarService.createPillar(req.body, req.user);
  if (!pillar.message) {
    res.status(httpStatus.CREATED).send(pillar);
  } else {
    res.status(httpStatus.CONFLICT).send(pillar);
  }
});

// get pillar based on query
const getPillars = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["title", "role", "createdBy", "isActive"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await pillarService.queryPillars(filter, options, req);
  res.send(result);
});

// get pillar based on pillarId
const getPillar = catchAsync(async (req, res) => {
  const pillar = await pillarService.getPillarById(req.params.pillarId);
  if (!pillar) {
    throw new ApiError(httpStatus.NOT_FOUND, "Pillar not found");
  }
  res.send(pillar);
});

// update pillar based on pillarId
const updatePillar = catchAsync(async (req, res) => {
  const pillar = await pillarService.updatePillarById(
    req.params.pillarId,
    req.body,
    req.user
  );
  res.send(pillar);
});

// delete pillar based on the pillarId
const deletePillar = catchAsync(async (req, res) => {
  await pillarService.deletePillarById(req.params.pillarId);
  res.status(200).send({ success: true });
});

// exports all the controller to use in pillar.route.js
module.exports = {
  createPillar,
  getPillars,
  getPillar,
  updatePillar,
  deletePillar,
};
