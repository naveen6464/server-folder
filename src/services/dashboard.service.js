/*
   Service Name : Dashboard
*/

/** ***************** Models Import ******************************************************** */

/** ***************** Import Project model from model ******************************************************** */
const httpStatus = require("http-status");
const logger = require("../config/logger");
const logsService = require("./logs.service");
const {
  Project,
  Pillar,
  Goal,
  User,
  ChangeRequest,
  PayRelease,
  ApprovedRequest,
  SponsorDetails,
  Request,
  Location,
} = require("../models");
const ApiError = require("../utils/ApiError");

/** ***************** ApiError from utils ******************************************************** */

/** ***************** counter from services ******************************************************** */

// get admin count based to dashboard

const getProjectCount = async () => {
  try {
    return await Project.countDocuments({
      isDeleted: false,
      isActive: true,
      isClosed: false,
    })
      .then((res) => {
        return res;
      })
      .catch((err) => err);
  } catch (e) {
    logger.error(e);
    throw new ApiError(httpStatus.NOT_FOUND, "error in admin projects");
  }
};

const getRequestCount = async () => {
  try {
    return await Request.countDocuments({
      status: "pending",
      isDeleted: false,
    })
      .then((res) => {
        return res;
      })
      .catch((err) => err);
  } catch (e) {
    logger.error(e);
    throw new ApiError(httpStatus.NOT_FOUND, "error in admin requests");
  }
};

const getTotalRequestCount = async () => {
  try {
    return await Request.countDocuments({
      isDeleted: false,
    })
      .then((res) => {
        return res;
      })
      .catch((err) => err);
  } catch (e) {
    logger.error(e);
    throw new ApiError(httpStatus.NOT_FOUND, "error in admin total requests");
  }
};

const getGoalCount = async () => {
  try {
    return await Goal.countDocuments({ isDeleted: false })
      .then((res) => {
        return res;
      })
      .catch((err) => err);
  } catch (e) {
    logger.error(e);
    throw new ApiError(httpStatus.NOT_FOUND, "error in admin goal count");
  }
};

const getPillarCount = async () => {
  try {
    return await Pillar.countDocuments({ isDeleted: false })
      .then((res) => res)
      .catch((err) => err);
  } catch (e) {
    logger.error(e);
    throw new ApiError(httpStatus.NOT_FOUND, "error in admin pillar count");
  }
};

const getUsersCount = async () => {
  try {
    return await User.countDocuments()
      .then((res) => res)
      .catch((err) => err);
  } catch (e) {
    logger.error(e);
    throw new ApiError(httpStatus.NOT_FOUND, "error in admin user count");
  }
};

const getlocationsCount = async () => {
  try {
    return await Location.countDocuments()
      .then((res) => res)
      .catch((err) => err);
  } catch (e) {
    logger.error(e);
    throw new ApiError(httpStatus.NOT_FOUND, "error in admin location count");
  }
};

const getPayReleaseCount = async () => {
  try {
    return await PayRelease.countDocuments()
      .then((res) => res)
      .catch((err) => err);
  } catch (e) {
    logger.error(e);
    throw new ApiError(httpStatus.NOT_FOUND, "error in admin payRelease count");
  }
};

const getPaymentsAmount = async (sumData) => {
  let sum = sumData;
  try {
    return await Request.find({
      status: "approved",
      type: "payment",
      isDeleted: false,
    })
      .then((pay) => {
        pay.forEach((data) => {
          sum += data.amountToPay;
        });
        return sum;
      })
      .catch((err) => err);
  } catch (e) {
    logger.error(e);
    throw new ApiError(httpStatus.NOT_FOUND, "error in admin payment amount");
  }
};

const getAllocatedFund = async (FundAmount) => {
  let Fund = FundAmount;
  try {
    return await Project.find({
      status: "inProgress",
      isDeleted: false,
      isClosed: false,
    })
      .then((fund) => {
        fund.forEach((data) => {
          Fund += data.allocatedFund;
        });
        return Fund;
      })
      .catch((err) => err);
  } catch (e) {
    logger.error(e);
    throw new ApiError(httpStatus.NOT_FOUND, "error in admin allocated Fund");
  }
};

const getusedFund = async (usedFundAmount) => {
  let usedFund = usedFundAmount;
  try {
    return await Project.find({
      status: "inProgress",
      isDeleted: false,
      isClosed: false,
    })
      .then((useFund) => {
        useFund.forEach((data) => {
          usedFund += data.usedAmount;
        });
        return usedFund;
      })
      .catch((e) => {
        console.log(e);
        return e;
      });
  } catch (e) {
    logger.error(e);
    throw new ApiError(httpStatus.NOT_FOUND, "error in admin user Fund");
  }
};

const getinReviewAmount = async (inReviewAmountData) => {
  let inReviewAmount = inReviewAmountData;
  try {
    return await Request.find({
      isDeleted: false,
      status: "pending",
      type: "payment",
    })
      .then((data) => {
        data.forEach((e) => {
          inReviewAmount += e.amountToPay;
        });
        return inReviewAmount;
      })
      .catch((err) => err);
  } catch (e) {
    logger.error(e);
    throw new ApiError(httpStatus.NOT_FOUND, "error in admin inReview Amount");
  }
};

const getApprovedAmount = async (approvedAmountData) => {
  let approvedAmount = approvedAmountData;
  try {
    return await Request.find({
      isDeleted: false,
      status: "approved",
      isPaid: false,
      type: "payment",
    })
      .then((data) => {
        data.forEach((e) => {
          approvedAmount += e.amountToPay;
        });
        return approvedAmount;
      })
      .catch((err) => err);
  } catch (e) {
    logger.error(e);
    throw new ApiError(httpStatus.NOT_FOUND, "error in admin Approved amount");
  }
};

const getPaidAmount = async (paidAmountData) => {
  let paidAmount = paidAmountData;
  try {
    return await Request.find({
      isDeleted: false,
      isPaid: true,
      type: "payment",
    })
      .then((data) => {
        data.forEach((e) => {
          paidAmount += e.amountToPay;
        });
        return paidAmount;
      })
      .catch((err) => err);
  } catch (e) {
    logger.error(e);
    throw new ApiError(httpStatus.NOT_FOUND, "error in admin paid amount");
  }
};

const getAdminCount = async (userId, role) => {
  try {
    const inReviewAmount = 0;
    const approvedAmount = 0;
    const paidAmount = 0;
    const sum = 0;
    const Fund = 0;
    const usedFund = 0;
    const project = await getProjectCount();
    const requests = await getRequestCount();
    const totalRequests = await getTotalRequestCount();
    const goal = await getGoalCount();
    const pillar = await getPillarCount();
    const user = await getUsersCount();
    const location = await getlocationsCount();
    const payRelease = await getPayReleaseCount();
    const paymentAmount = await getPaymentsAmount(sum);
    const allocatedFund = await getAllocatedFund(Fund);
    const usedAmount = await getusedFund(usedFund);
    const inReview = await getinReviewAmount(inReviewAmount);
    const approved = await getApprovedAmount(approvedAmount);
    const paid = await getPaidAmount(paidAmount);
    let result = {};
    try {
      result = {
        projects: project,
        goals: goal,
        pillars: pillar,
        users: user,
        locations: location,
        payRelease,
        requests,
        totalRequests,
        allocatedFund,
        usedFund: usedAmount,
        amountToPay: paymentAmount,
        inReviewAmount: inReview,
        approvedAmount: approved,
        paidAmount: paid,
      };
    } catch (e) {
      logger.error(e);
    }

    const logBodyData = {
      action: "get",
      userId,
      collectionName: "",
      route: "dashboard",
      data: { role },
    };
    await logsService.createlogs(logBodyData);
    return result;
  } catch (error) {
    logger.error(error);
    throw new ApiError(httpStatus.NOT_FOUND, "error");
  }
};

// get user count to dashboard
const getUserCount = async (userId, role) => {
  let logBodyData;
  try {
    const project = await Project.countDocuments()
      .then((res) => res)
      .catch((err) => err);

    const requests = await Request.countDocuments({
      status: "pending",
      isDeleted: false,
    })
      .then((res) => {
        return res;
      })
      .catch((err) => err);

    const change = await ChangeRequest.countDocuments()
      .then((res) => res)
      .catch((err) => err);
    const result = {
      projects: project,
      requests,
      changeRequests: change,
    };
    logBodyData = {
      action: "get",
      userId,
      collectionName: "",
      route: "dashboard",
      data: { role },
    };
    await logsService.createlogs(logBodyData);
    return result;
  } catch (e) {
    logger.error(e);
  }
};

// get sponsor count to dashboard
const getSponsorCount = async (userId) => {
  const role = "sponsor";
  let logBodyData;
  const inReviewAmount = 0;
  const approvedAmount = 0;
  let paidAmount = 0;
  const sum = 0;
  const Fund = 0;
  const usedFund = 0;
  let requests = 0;
  const sponsorProject = [];
  try {
    const time = new Date();
    const year = time.toISOString().split("-")[0];
    const month = time.toISOString().split("-")[1];
    let startDate = "";
    let endDate = "";
    if (month >= 4 && month <= 7) {
      startDate = `${year}-01-01T00:00:00.661Z`;
      endDate = `${year}-03-31T23:59:59.661Z`;
    } else if (month >= 7 && month <= 10) {
      startDate = `${year}-04-01T00:00:00.661Z`;
      endDate = `${year}-07-31T23:59:59.661Z`;
    } else if (month >= 10 && month <= 12) {
      startDate = `${year}-07-01T00:00:00.661Z`;
      endDate = `${year}-10-31T23:59:59.661Z`;
    } else if (month >= 1 && month <= 3) {
      startDate = `${year - 1}-10-01T00:00:00.661Z`;
      endDate = `${year - 1}-12-31T23:59:59.661Z`;
    }
    const project = await getProjectCount();
    const totalRequests = await getTotalRequestCount();
    const goal = await getGoalCount();
    const pillar = await getPillarCount();
    const payRelease = await getPayReleaseCount();
    const allocatedFund = await getAllocatedFund(Fund);
    const usedAmount = await getusedFund(usedFund);
    const inReview = await getinReviewAmount(inReviewAmount);
    const approved = await getApprovedAmount(approvedAmount);
    const paymentAmount = await getPaymentsAmount(sum);
    requests = await SponsorDetails.find({ sponsorId: userId }).then(
      async (e) => {
        try {
          e.forEach((data) => {
            sponsorProject.push(data.projectId);
          });
          return Request.countDocuments({
            projectId: sponsorProject,
            isDeleted: false,
          }).catch((err) => err);
        } catch (err) {
          logger.error(err);
          return err;
        }
      }
    );
    const paid = await Request.find({
      createdAt: {
        $gte: new Date(`${startDate}`),
        $lte: new Date(`${endDate}`),
      },
      projectId: sponsorProject,
      isDeleted: false,
      isPaid: true,
      type: "payment",
    })
      .then((data) => {
        data.forEach((e) => {
          paidAmount += e.amountToPay;
        });
        return paidAmount;
      })
      .catch((err) => err);
    const myProject = await SponsorDetails.find({ sponsorId: userId })
      .then(async (e) => {
        const sponsor = [];
        e.forEach((data) => {
          sponsor.push(data.projectId);
        });
        return Project.countDocuments({
          _id: { $in: sponsor },
          isDeleted: false,
          isActive: true,
        }).catch((err) => err);
      })
      .catch((err) => err);

    const result = {
      projects: project,
      myProjects: myProject,
      goals: goal,
      pillars: pillar,
      payRelease,
      requests,
      totalRequests,
      allocatedFund,
      usedFund: usedAmount,
      amountToPay: paymentAmount,
      inReviewAmount: inReview,
      approvedAmount: approved,
      paidAmount: paid,
    };
    logBodyData = {
      action: "get",
      userId,
      collectionName: "",
      route: "dashboard",
      data: { role },
    };
    await logsService.createlogs(logBodyData);
    return result;
  } catch (e) {
    logger.error(e);
    throw new ApiError(httpStatus.EXPECTATION_FAILED, e);
  }
};

// get resource count to dashboard
const getResourceCount = async (userId, role) => {
  let logBodyData;
  let inReviewAmount = 0;
  let approvedAmount = 0;
  let paidAmount = 0;
  try {
    const time = new Date();
    const year = time.toISOString().split("-")[0];
    const month = time.toISOString().split("-")[1];
    let startDate = "";
    let endDate = "";
    if (month >= 4 && month <= 7) {
      startDate = `${year}-01-01T00:00:00.661Z`;
      endDate = `${year}-03-31T23:59:59.661Z`;
    } else if (month >= 7 && month <= 10) {
      startDate = `${year}-04-01T00:00:00.661Z`;
      endDate = `${year}-07-31T23:59:59.661Z`;
    } else if (month >= 10 && month <= 12) {
      startDate = `${year}-07-01T00:00:00.661Z`;
      endDate = `${year}-10-31T23:59:59.661Z`;
    } else if (month >= 1 && month <= 3) {
      startDate = `${year - 1}-10-01T00:00:00.661Z`;
      endDate = `${year - 1}-12-31T23:59:59.661Z`;
    }
    const project = await getProjectCount();

    const myProject = await ApprovedRequest.find({
      userId,
      isActive: true,
    })
      .then(async (res) => {
        const projectDataId = [];
        res.forEach((data) => {
          projectDataId.push(data.projectId);
        });
        return Project.countDocuments({
          isActive: true,
          _id: { $in: projectDataId },
          isClosed: false,
        });
      })
      .catch((err) => err);

    const requests = await Request.countDocuments({
      status: "pending",
      userId,
      isDeleted: false,
    })
      .then((res) => {
        return res;
      })
      .catch((err) => err);
    const totalRequests = await Request.countDocuments({
      userId,
      isDeleted: false,
    })
      .then((res) => {
        return res;
      })
      .catch((err) => err);
    const inReview = await Request.find({
      userId,
      isDeleted: false,
      status: "pending",
      type: "payment",
    })
      .then((data) => {
        data.forEach((e) => {
          inReviewAmount += e.amountToPay;
        });
        return inReviewAmount;
      })
      .catch((err) => err);
    const approved = await Request.find({
      userId,
      isDeleted: false,
      isPaid: false,
      status: "approved",
      type: "payment",
    })
      .then((data) => {
        data.forEach((e) => {
          approvedAmount += e.amountToPay;
        });
        return approvedAmount;
      })
      .catch((err) => err);
    const paid = await Request.find({
      createdAt: {
        $gte: new Date(`${startDate}`),
        $lte: new Date(`${endDate}`),
      },
      userId,
      isDeleted: false,
      isPaid: true,
      type: "payment",
    })
      .then((data) => {
        data.forEach((e) => {
          paidAmount += e.amountToPay;
        });
        return paidAmount;
      })
      .catch((err) => {
        return err;
      });
    const result = {
      myProjects: myProject,
      projects: project,
      requests,
      totalRequests,
      inReviewAmount: inReview,
      approvedAmount: approved,
      paidAmount: paid,
    };
    logBodyData = {
      action: "get",
      userId,
      collectionName: "",
      route: "dashboard",
      data: { role },
    };
    await logsService.createlogs(logBodyData);
    return result;
  } catch (error) {
    logger.error(error);
    return error;
  }
};

// get approver count to dashboard
const getApproverCount = async (userId, role) => {
  let logBodyData;
  const inReviewAmount = 0;
  const approvedAmount = 0;
  const paidAmount = 0;
  const sum = 0;
  const Fund = 0;
  const usedFund = 0;
  try {
    const project = await getProjectCount();
    const requests = await getRequestCount();
    const totalRequests = await getTotalRequestCount();
    const goal = await getGoalCount();
    const pillar = await getPillarCount();
    const payRelease = await getPayReleaseCount();
    const allocatedFund = await getAllocatedFund(Fund);
    const usedAmount = await getusedFund(usedFund);
    const inReview = await getinReviewAmount(inReviewAmount);
    const approved = await getApprovedAmount(approvedAmount);
    const paid = await getPaidAmount(paidAmount);
    const paymentAmount = await getPaymentsAmount(sum);
    const result = {
      projects: project,
      goals: goal,
      pillars: pillar,
      payRelease,
      requests,
      totalRequests,
      allocatedFund,
      usedFund: usedAmount,
      amountToPay: paymentAmount,
      inReviewAmount: inReview,
      approvedAmount: approved,
      paidAmount: paid,
    };
    logBodyData = {
      action: "get",
      userId,
      collectionName: "",
      route: "dashboard",
      data: { role },
    };
    await logsService.createlogs(logBodyData);
    return result;
  } catch (e) {
    logger.error(e);
  }
};

// get the payment amount from the payment request to show user the amount to pay and remaing amount
const getPaymentAmount = async (userId, role) => {
  let logBodyData;
  let sum = 0;
  let Fund = 0;
  let usedFund = 0;
  try {
    const payment = await Request.find({
      status: "approved",
      type: "payment",
      isDeleted: false,
    })
      .then((pay) => {
        pay.forEach((data) => {
          sum += data.amountToPay;
        });

        return sum;
      })
      .catch((err) => err);
    const allocatedFund = await Project.find({
      status: "inProgress",
      isDeleted: false,
      isClosed: false,
    })
      .then((fund) => {
        fund.forEach((data) => {
          Fund += data.allocatedFund;
        });
        return Fund;
      })
      .catch((err) => err);
    const usedAmount = await Project.find({
      status: "inProgress",
      isDeleted: false,
      isClosed: false,
    })
      .then((useFund) => {
        useFund.forEach((data) => {
          usedFund += data.usedAmount;
        });
        return usedFund;
      })
      .catch((err) => err);
    const result = {
      amountToPay: payment,
      allocatedFund,
      usedFund: usedAmount,
    };
    logBodyData = {
      action: "get",
      userId,
      collectionName: "",
      route: "dashboard",
      data: { role },
    };
    await logsService.createlogs(logBodyData);
    return result;
  } catch (e) {
    logger.error(e);
  }
};

// get the payment amount by userID  from the payment request to show user the amount to pay and remaing amount
const getPaymentAmountByUserId = async (userId, role) => {
  let logBodyData;
  let sum = 0;
  let Fund = 0;
  let usedFund = 0;
  try {
    const payment = await Request.find({
      userId,
      status: "approved",
      type: "payment",
    })
      .then((res) => {
        res.forEach((data) => {
          sum += data.amountToPay;
        });
        return sum;
      })
      .catch((err) => err);
    const allocatedFund = await Project.find({
      userId,
      status: "inProgress",
      isClosed: false,
    })
      .then((fund) => {
        fund.forEach((data) => {
          Fund += data.allocatedFund;
        });
        return Fund;
      })
      .catch((err) => err);
    const usedAmount = await Project.find({
      userId,
      status: "inProgress",
      isClosed: false,
    })
      .then((useFund) => {
        useFund.forEach((data) => {
          usedFund += data.usedAmount;
        });
        return usedFund;
      })
      .catch((err) => err);
    const result = {
      amountToPay: payment,
      allocatedFund,
      usedFund: usedAmount,
    };
    logBodyData = {
      action: "get",
      userId,
      collectionName: "",
      route: "dashboard",
      data: { role },
    };
    await logsService.createlogs(logBodyData);
    return result;
  } catch (e) {
    logger.error(e);
  }
};

// export all the service to use in dashboard controller
module.exports = {
  getAdminCount,
  getUserCount,
  getSponsorCount,
  getApproverCount,
  getResourceCount,
  getPaymentAmount,
  getPaymentAmountByUserId,
};
