const express = require("express");
const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const docsRoute = require("./docs.route");
const pillarRoute = require("./pillar.route.js");
const goalRoute = require("./goal.route");
const ProjectRoute = require("./project.route");
const dashboardRoute = require("./dashboard.route");
const payReleaseRoute = require("./payRelease.route");
const requestRoute = require("./request.route");
const proposedProjectRoute = require("./proposedProject.route");
const locationRoute = require("./location.route");
const logsRoute = require("./logs.route");

const router = express.Router();

router.use("/auth", authRoute);
router.use("/users", userRoute);
router.use("/docs", docsRoute);
router.use("/pillars", pillarRoute);
router.use("/goals", goalRoute);
router.use("/projects", ProjectRoute);
router.use("/dashboard", dashboardRoute);
router.use("/payRelease", payReleaseRoute);
router.use("/request", requestRoute);
router.use("/proposedProject", proposedProjectRoute);
router.use("/location", locationRoute);
router.use("/logs", logsRoute);

module.exports = router;
