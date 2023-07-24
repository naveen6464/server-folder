/*
    Roles   
*/

// In this roles for an user is assigned.

const roles = ["user", "admin", "sponsor", "resource", "approver", "lead"];
const presentState = ["active", "inActive"];

const userArray = [
  "activeStatus",
  "getUsers",
  "sponsor",
  "resource",
  "getResourceUser",
  "getSponsorUser",
  "payRelease",
  "getProjects",
  "getProject",
  "manageSignup",
  "getServices",
  "getServiceByUser",
  "getService",
  "filterRequest",
  "filterProject",
  "manageChangeRequest",
  "getChangeRequestByUser",
  "getChangeRequests",
  "getChangeRequest",
  "managePaymentRequest",
  "getPaymentRequestByUser",
  "getPaymentRequests",
  "getPaymentRequest",
  "userDashboard",
  "getAmountDetail",
  "manageRequestHour",
  "getRequestHour",
  "getRequestHourById",
  "deleteRequestHour",
  "manageProposedProject",
  "getProposedProject",
  "manageLocation",
  "getLocations",
  "getLocation",
];
const adminArray = [
  "activeStatus",
  "sponsor",
  "resource",
  "getResourceUser",
  "getSponsorUser",
  "getUsers",
  "manageUsers",
  "managePillar",
  "getPillars",
  "getPillar",
  "manageGoal",
  "getGoals",
  "getGoal",
  "manageProject",
  "getProjects",
  "getProject",
  "manageSignup",
  "getServices",
  "filterRequest",
  "filterProject",
  "getServiceByUser",
  "getService",
  "manageChangeRequest",
  "getChangeRequestByUser",
  "getChangeRequests",
  "getChangeRequest",
  "managePaymentRequest",
  "getPaymentRequestByUser",
  "getPaymentRequests",
  "getPaymentRequest",
  "userDashboard",
  "adminGoals",
  "payRelease",
  "getAmountDetail",
  "manageRequestHour",
  "getRequestHour",
  "getRequestHourById",
  "deleteRequestHour",
  "manageProposedProject",
  "getProposedProject",
  "manageLocation",
  "getLocations",
  "getLocation",
  "manageLogs",
  "getLogs",
  "downloadCsv",
];

const resourceArray = [
  "activeStatus",
  "sponsor",
  "resource",
  "getResourceUser",
  "getSponsorUser",
  "userSponsor",
  "getUsers",
  "manageProject",
  "getProjects",
  "getProject",
  "manageSignup",
  "getServices",
  "getServiceByUser",
  "getService",
  "filterRequest",
  "filterProject",
  "manageChangeRequest",
  "getChangeRequestByUser",
  "getChangeRequests",
  "getChangeRequest",
  "managePaymentRequest",
  "getPaymentRequestByUser",
  "getPaymentRequests",
  "getPaymentRequest",
  "userDashboard",
  "adminGoals",
  "payRelease",
  "getAmountDetail",
  "manageRequestHour",
  "getRequestHour",
  "getRequestHourById",
  "deleteRequestHour",
  "manageProposedProject",
  "getProposedProject",
  "manageLocation",
  "getLocations",
  "getLocation",
];
const sponsorArray = [
  "activeStatus",
  "sponsor",
  "resource",
  "getResourceUser",
  "getSponsorUser",
  "userSponsor",
  "getUsers",
  "getPillars",
  "getPillar",
  "getGoals",
  "getGoal",
  "getProjects",
  "getProject",
  "filterProject",
  "manageSignup",
  "getServices",
  "getServiceByUser",
  "getService",
  "filterRequest",
  "getChangeRequestByUser",
  "getChangeRequests",
  "getChangeRequest",
  "getPaymentRequestByUser",
  "getPaymentRequests",
  "getPaymentRequest",
  "userDashboard",
  "adminGoals",
  "payRelease",
  "getAmountDetail",
  "manageRequestHour",
  "getRequestHour",
  "getRequestHourById",
  "deleteRequestHour",
  "manageProposedProject",
  "getProposedProject",
  "manageLocation",
  "getLocations",
  "getLocation",
];
const approverArray = [
  "activeStatus",
  "sponsor",
  "resource",
  "getResourceUser",
  "getSponsorUser",
  "getUsers",
  "manageUsers",
  "managePillar",
  "getPillars",
  "getPillar",
  "manageGoal",
  "getGoals",
  "getGoal",
  "manageProject",
  "getProjects",
  "getProject",
  "manageSignup",
  "getServices",
  "filterRequest",
  "filterProject",
  "getServiceByUser",
  "getService",
  "manageChangeRequest",
  "getChangeRequestByUser",
  "getChangeRequests",
  "getChangeRequest",
  "managePaymentRequest",
  "getPaymentRequestByUser",
  "getPaymentRequests",
  "getPaymentRequest",
  "userDashboard",
  "adminGoals",
  "payRelease",
  "getAmountDetail",
  "manageRequestHour",
  "getRequestHour",
  "getRequestHourById",
  "deleteRequestHour",
  "manageProposedProject",
  "getProposedProject",
  "manageLocation",
  "getLocations",
  "getLocation",
];
const leadArray = [
  "activeStatus",
  "sponsor",
  "resource",
  "getResourceUser",
  "getSponsorUser",
  "getUsers",
  "manageUsers",
  "managePillar",
  "getPillars",
  "getPillar",
  "manageGoal",
  "getGoals",
  "getGoal",
  "manageProject",
  "getProjects",
  "getProject",
  "filterProject",
  "manageRequest",
  "getRequests",
  "getServiceByUser",
  "getService",
  "filterRequest",
  "manageChangeRequest",
  "getChangeRequestByUser",
  "getChangeRequests",
  "getChangeRequest",
  "managePaymentRequest",
  "getPaymentRequestByUser",
  "getPaymentRequests",
  "getPaymentRequest",
  "userDashboard",
  "adminGoals",
  "payRelease",
  "getAmountDetail",
  "manageRequestHour",
  "getRequestHour",
  "getRequestHourById",
  "deleteRequestHour",
  "manageProposedProject",
  "getProposedProject",
  "manageLocation",
  "getLocations",
  "getLocation",
];
const roleRights = new Map();
roleRights.set(roles[0], userArray);
roleRights.set(roles[1], adminArray);
roleRights.set(roles[2], sponsorArray);
roleRights.set(roles[3], resourceArray);
roleRights.set(roles[4], approverArray);
roleRights.set(roles[5], leadArray);

module.exports = {
  roles,
  roleRights,
  presentState,
};