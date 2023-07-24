/*
   controller Name : Goal
*/

/** ******************  Import httpStatus ******************************************************** */

const httpStatus = require("http-status");
/** ******************  Import pick,ApiError and catchAsync ******************************************************** */
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

/** ******************  Import Services ******************************************************** */
const { goalService } = require("../services");

// create an goal controller
const createGoal = catchAsync(async (req, res) => {
  const goal = await goalService.createGoal(req.body, req.user);
  res.status(httpStatus.CREATED).send(goal);
});

// get goals based on the given query
const getGoals = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["title", "createdBy", "isActive"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await goalService.queryGoals(filter, options, req);
  res.send(result);
});

// get goals based on the goal id
const getGoal = catchAsync(async (req, res) => {
  const goal = await goalService.getGoalById(req.params.goalId);

  if (!goal) {
    throw new ApiError(httpStatus.NOT_FOUND, "Gaol not found");
  }
  res.send(goal);
});

// update goals based on the goal id
const updateGoal = catchAsync(async (req, res) => {
  const goal = await goalService.updateGoalById(
    req.params.goalId,
    req.body,
    req.user
  );
  res.send(goal);
});

// delete the goal based on the goal id
const deleteGoal = catchAsync(async (req, res) => {
  const goal = await goalService.deleteGoalById(req.params.goalId);
  if (!goal) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  res.status(200).send({ success: true });
});

// export all the goals to use goal.route.js
module.exports = {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  deleteGoal,
  // getGoalsByPillar,
};
