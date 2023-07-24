/*
   Service Name : requests
*/

/** ***************** Models Import ******************************************************** */
const httpStatus = require("http-status");

/** ***************** Import Service from model ******************************************************** */
const { Parser } = require("json2csv");
const fs = require("fs");
const path = require("path");
const Request = require("../models/request.model");
const SponsorDetails = require("../models/sponsorDetails.model");
const ApprovedRequest = require("../models/approvedRequest.model");
const User = require("../models/user.model");

/** ***************** ApiError from utils ******************************************************** */

const ApiError = require("../utils/ApiError");
/** ***************** counter from services ******************************************************** */

const counter = require("./counter.service");
const emailService = require("./email.service");
const logsService = require("./logs.service");
const Project = require("../models/project.model");
const logger = require("../config/logger");

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */

const requestCount = async (request) => {
  const countService = await Request.countDocuments({
    type: "sign_up",
    status: "pending",
    projectId: request.projectId,
    isDeleted: false,
  });

  const countPayment = await Request.countDocuments({
    type: "payment",
    status: "pending",
    projectId: request.projectId,
    isDeleted: false,
  });
  const countAddHours = await Request.countDocuments({
    type: "add_hours",
    status: "pending",
    projectId: request.projectId,
    isDeleted: false,
  });
  const countApprovedPayments = await Request.countDocuments({
    type: "payment",
    status: "approved",
    projectId: request.projectId,
    isDeleted: false,
  });
  const countApprovedPaymentsButNotPaid = await Request.countDocuments({
    type: "payment",
    status: "approved",
    isPaid: false,
    projectId: request.projectId,
    isDeleted: false,
  });
  await Project.findByIdAndUpdate(request.projectId, {
    pendingServicesCount: countService,
    pendingPaymentsCount: countPayment,
    pendingAddHoursCount: countAddHours,
    approvedPaymentsCount: countApprovedPayments,
    unPaidStatusCount: countApprovedPaymentsButNotPaid,
  });
};

const createSignupRequest = async (userBodyData, user) => {
  const userBody = userBodyData;
  try {
    const signupRequestExistToProject = await Request.find({
      projectId: userBody.projectId,
      userId: userBody.userId,
      type: "sign_up",
      status: "pending",
      isActive: true,
    });
    if (!signupRequestExistToProject.length) {
      const id = await counter.getCount("requests"); // passing users id to get counter value to autoIncrement _id
      userBody._id = id.toString();
      userBody.createdBy = user._id;
      userBody.userId = user._id;
      userBody.inProject = false;
      userBody.status = "pending";
      userBody.usedHours = 0;
      userBody.requestedHours = userBody.grantedHours;
      userBody.remainingHours = parseInt(userBody.grantedHours, 10);
      const joint = await Request.create(userBody);
      const logBodyData = {
        action: "create",
        userId: userBody._id,
        collectionName: "requests",
        data: userBody,
      };
      await logsService.createlogs(logBodyData);
      await requestCount(userBody);

      if (joint) {
        const project = await Project.find({ _id: userBody.projectId });
        const userEmail = await User.find({ _id: joint.userId });
        const admin = await User.find({
          role: { $in: ["admin"] },
          isDeleted: false,
        });
        const sponsorList = await SponsorDetails.find({
          projectId: userBody.projectId,
        }).then(async (e) => {
          const sponsorArray = [];
          await e.map(async (data) => {
            sponsorArray.push(data.sponsorId);
          });
          return sponsorArray;
        });
        const sponsorEmail = await User.find({
          _id: { $in: sponsorList },
          isDeleted: false,
        });

        const emailData = {
          firstName: userEmail[0].firstName,
          lastName: userEmail[0].lastName,
          adminName: admin,
          sponsor: sponsorEmail,
          hours: joint.grantedHours,
          type: joint.type,
          projectTitle: project[0].title,
        };
        emailService.sendSignupCreatedEmail(userEmail[0].email, emailData);
      }
      return joint;
    }
    return new ApiError(
      httpStatus.CONFLICT,
      "There is already a request waiting for this project for approval"
    );
  } catch (e) {
    logger.error(e);
  }
};

const createPaymentRequest = async (userBodyData, user) => {
  const userBody = userBodyData;

  try {
    const id = await counter.getCount("requests"); // passing users id to get counter value to autoIncrement _id
    userBody._id = id.toString();
    userBody.createdBy = user._id;
    userBody.userId = user._id;
    userBody.status = "pending";
    userBody.isPaid = false;
    const payment = await Request.findById({ _id: userBody.requestId });
    const usedHours = payment.usedHours + parseFloat(userBody.hoursToPay);
    const remainingHours = parseFloat(
      (payment.remainingHours - parseFloat(userBody.hoursToPay)).toFixed(2)
    );
    const updatedData = {
      usedHours,
      remainingHours,
    };
    Object.assign(payment, updatedData);
    await payment.save();
    const joint = await Request.create(userBody);
    const logBodyData = {
      action: "create",
      userId: userBody._id,
      collectionName: "requests",
      data: userBody,
    };
    await logsService.createlogs(logBodyData);
    await requestCount(userBody);
    if (joint) {
      const project = await Project.find({ _id: joint.projectId });
      const userEmail = await User.find({ _id: joint.userId });
      const admin = await User.find({
        role: { $in: ["admin"] },
        isDeleted: false,
      });
      const sponsorList = await SponsorDetails.find({
        projectId: userBody.projectId,
      }).then(async (e) => {
        const sponsorArray = [];
        await e.map(async (data) => {
          sponsorArray.push(data.sponsorId);
        });
        return sponsorArray;
      });
      const sponsorEmail = await User.find({
        _id: { $in: sponsorList },
        isDeleted: false,
      });
      const emailData = {
        firstName: userEmail[0].firstName,
        lastName: userEmail[0].lastName,
        adminName: admin,
        sponsor: sponsorEmail,
        adminRequest: `A new request has been created by ${userEmail[0].corematicaName} and waiting for your approval`,
        hours: joint.hoursToPay,
        type: joint.type,
        amount: joint.amountToPay,
        projectTitle: project[0].title,
      };
      emailService.sendPaymentCreatedEmail(userEmail[0].email, emailData);
    }
    return joint;
  } catch (e) {
    logger.error(e);
  }
};

const createAddHours = async (userBodyData, user) => {
  const userBody = userBodyData;
  try {
    const id = await counter.getCount("requests"); // passing users id to get counter value to autoIncrement _id
    userBody._id = id.toString();
    userBody.createdBy = user._id;
    const requestHours = await Request.create(userBody);
    const logBodyData = {
      action: "create",
      userId: userBody._id,
      collectionName: "requests",
      data: userBody,
    };
    await logsService.createlogs(logBodyData);
    await requestCount(userBody);
    const project = await Project.find({ _id: requestHours.projectId });
    const userEmail = await User.find({ _id: requestHours.userId });
    const admin = await User.find({
      role: { $in: ["admin"] },
      isDeleted: false,
    });
    const sponsorList = await SponsorDetails.find({
      projectId: userBody.projectId,
    }).then(async (e) => {
      const sponsorArray = [];
      await e.map(async (data) => {
        sponsorArray.push(data.sponsorId);
      });
      return sponsorArray;
    });
    const sponsorEmail = await User.find({
      _id: { $in: sponsorList },
      isDeleted: false,
    });
    const emailData = {
      firstName: userEmail[0].firstName,
      lastName: userEmail[0].lastName,
      adminName: admin,
      sponsor: sponsorEmail,
      hours: requestHours.hoursToAdd,
      type: requestHours.type,
      projectTitle: project[0].title,
    };
    emailService.sendAddHoursCreatedEmail(userEmail[0].email, emailData);
    return requestHours;
  } catch (e) {
    logger.error(e);
  }
};

const createLeaveRequest = async (userBodyData, user) => {
  const userBody = userBodyData;
  try {
    const duplicate = await Request.find({
      type: "leave",
      projectId: userBody.projectId,
      userId: userBody.userId,
      status: "pending",
    });
    if (!duplicate.length) {
      const id = await counter.getCount("requests"); // passing users id to get counter value to autoIncrement _id
      userBody._id = id.toString();
      userBody.createdBy = user._id;
      userBody.userId = user._id;
      userBody.status = "approved";
      userBody.isActive = false;
      const removeResource = {
        isActive: false,
      };
      const leaveProject = await Request.create(userBody);
      const logBodyData = {
        action: "create",
        userId: userBody._id,
        collectionName: "requests",
        data: userBody,
      };
      await logsService.createlogs(logBodyData);

      await ApprovedRequest.findOneAndUpdate(
        {
          projectId: userBody.projectId,
          userId: userBody.userId,
          requestId: userBody.requestId,
        },
        removeResource
      );
      const removeProject = {
        inProject: false,
      };
      await Request.findOneAndUpdate(
        {
          type: "sign_up",
          _id: userBody.requestId,
          projectId: userBody.projectId,
          userId: userBody.userId,
        },
        removeProject
      );
      const project = await Project.find({ _id: userBody.projectId });
      const admin = await User.find({
        role: { $in: ["admin"] },
        isDeleted: false,
      });
      const userEmail = await User.find({ _id: userBody.userId });
      const sponsorList = await SponsorDetails.find({
        projectId: userBody.projectId,
      }).then(async (e) => {
        const sponsorArray = [];
        await e.map(async (data) => {
          sponsorArray.push(data.sponsorId);
        });
        return sponsorArray;
      });
      const sponsorEmail = await User.find({
        _id: { $in: sponsorList },
        isDeleted: false,
      });
      const emailData = {
        firstName: userEmail[0].firstName,
        lastName: userEmail[0].lastName,
        type: userBody.type,
        adminName: admin,
        sponsor: sponsorEmail,
        status: userBody.approved,
        projectTitle: project[0].title,
      };
      emailService.sendLeaveRequestEmail(userEmail[0].email, emailData);

      return leaveProject;
    }
    throw new ApiError(httpStatus.CONFLICT, "Wait until your request approved");
  } catch (e) {
    logger.error(e);
  }
};

const createRequest = async (userBodyData, user) => {
  const userBody = userBodyData;
  if (userBody.type === "sign_up") {
    return createSignupRequest(userBody, user);
  }
  if (userBody.type === "payment") {
    return createPaymentRequest(userBody, user);
  }
  if (userBody.type === "add_hours") {
    return createAddHours(userBody, user);
  }
  if (userBody.type === "leave") {
    return createLeaveRequest(userBody, user);
  }

  throw new ApiError(httpStatus.NOT_FOUND, "Enter a valid type");
};
//   throw new ApiError(httpStatus.CONFLICT, " is already found");

// below function are for query different type of request
function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"); // To remove the mongo search paranthesis
}
const getSignupQuery = async (filterData, options, join, joinOption, req) => {
  const filter = filterData;
  const logBodyData = {
    action: "get",
    userId: req.user._id,
    collectionName: "requests",
    data: filter,
  };
  await logsService.createlogs(logBodyData);
  try {
    if (
      filter.type === "sign_up" &&
      filter.userId &&
      filter.status &&
      filter.inProject &&
      !req.query.search
    ) {
      const projectDataId = [];
      const approvedDataId = [];
      await ApprovedRequest.find({
        userId: filter.userId,
        isActive: true,
      }).then((e) => {
        e.forEach((data) => {
          if (!approvedDataId.includes(data.projectId)) {
            approvedDataId.push(data.projectId);
          }
        });
      });
      await Project.find({
        isActive: true,
        _id: { $in: approvedDataId },
        isClosed: false,
      }).then((e) => {
        e.forEach((data) => {
          projectDataId.push(data._id);
        });
      });
      let changeJoin = join;
      changeJoin = [
        {
          path: "projectId",
          options: { sort: { _id: -1 } },
          model: "projects",
          populate: {
            path: "location",
            model: "locations",
            select: "location",
          },
        },
        {
          path: "userId",
          model: "users",
        },
      ];
      filter.projectId = { $in: projectDataId };
      const request = await Request.paginate(
        filter,
        options,
        { createdBy: 0, updatedBy: 0, isDeleted: 0 },
        changeJoin,
        joinOption
      ); // This third argument is to remove the field from response
      await Promise.all(
        request.results.map(async (currentData, index) => {
          if (currentData.projectId !== null) {
            const paymentPendingAmount = await Request.find({
              projectId: currentData.projectId._id,
              userId: filter.userId,
              type: "payment",
              status: "pending",
              isDeleted: false,
            }).then((e) => {
              let sum = 0;
              e.forEach((data) => {
                sum += data.amountToPay;
              });
              return sum;
            });

            const paymentApprovedAmount = await Request.find({
              projectId: currentData.projectId._id,
              userId: filter.userId,
              type: "payment",
              status: "approved",
              isDeleted: false,
            }).then((e) => {
              let sum = 0;
              e.forEach((data) => {
                sum += data.amountToPay;
              });
              return sum;
            });

            const paymentPaidAmount = await Request.find({
              projectId: currentData.projectId._id,
              userId: filter.userId,
              type: "payment",
              isPaid: true,
              isDeleted: false,
            }).then((e) => {
              let sum = 0;
              e.forEach((data) => {
                sum += data.amountToPay;
              });
              return sum;
            });

            const addHoursPending = await Request.countDocuments({
              projectId: currentData.projectId._id,
              userId: filter.userId,
              type: "add_hours",
              status: "pending",
              isDeleted: false,
            });
            request.results[index].pendingAmount = paymentPendingAmount;
            request.results[index].approvedAmount = paymentApprovedAmount;
            request.results[index].paidAmount = paymentPaidAmount;
            request.results[index].pendingAddHours = addHoursPending;
          }
        })
      );
      return request;
    }
    if (
      filter.type === "sign_up" &&
      filter.userId &&
      filter.status &&
      filter.inProject &&
      req.query.search
    ) {
      const myRequestId = [];

      const filter1 = { isDeleted: false, isActive: true, isClosed: false };
      filter1.$or = [
        {
          title: { $regex: `${escapeRegExp(req.query.search)}`, $options: "i" },
        },
        {
          description: {
            $regex: `${escapeRegExp(req.query.search)}`,
            $options: "i",
          },
        },
      ];

      await Project.find(filter1).then((pro) => {
        pro.forEach((data1) => {
          myRequestId.push(data1._id);
        });
      }); // This third argument is to remove the field from response

      filter.projectId = { $in: myRequestId };
      const request = await Request.paginate(
        filter,
        options,
        {
          createdBy: 0,
          updatedBy: 0,
          isDeleted: 0,
        },
        join,
        joinOption
      );
      return request;
    }
    if (filter.type === "sign_up") {
      const request = await Request.paginate(
        filter,
        options,
        { createdBy: 0, updatedBy: 0, isDeleted: 0 },
        join,
        joinOption
      ); // This third argument is to remove the field from response

      return request;
    }
  } catch (e) {
    logger.error(e);
  }
};

const getPaymentQuery = async (filterData, options, join, joinOption, req) => {
  const filter = filterData;
  const logBodyData = {
    action: "get",
    userId: req.user._id,
    collectionName: "requests",
    data: filter,
  };
  await logsService.createlogs(logBodyData);
  try {
    if (filter.requestorEmail)
      filter.requestorEmail = {
        $regex: escapeRegExp(filter.requestorEmail),
        $options: "i",
      };

    const payment = await Request.paginate(
      filter,
      options,
      { createdBy: 0, updatedBy: 0, isDeleted: 0 },
      join,
      joinOption
    ); // This third argument is to remove the field from response

    return payment;
  } catch (e) {
    logger.error(e);
  }
};

const getAddHoursQuery = async (filterData, options, join, joinOption, req) => {
  const filter = filterData;
  const logBodyData = {
    action: "get",
    userId: req.user._id,
    collectionName: "requests",
    data: filter,
  };
  await logsService.createlogs(logBodyData);
  try {
    const requestHours = await Request.paginate(
      filter,
      options,
      {
        isActive: 0,
        isDeleted: 0,
      },
      join,
      joinOption
    ); // This third argument is to remove the field from response
    return requestHours;
  } catch (e) {
    logger.error(e);
  }
};

const getLeaveQuery = async (filterData, options, join, joinOption, req) => {
  const filter = filterData;
  const logBodyData = {
    action: "get",
    userId: req.user._id,
    collectionName: "requests",
    data: filter,
  };
  await logsService.createlogs(logBodyData);
  try {
    const requestHours = await Request.paginate(
      filter,
      options,
      {
        isActive: 0,
        isDeleted: 0,
      },
      join,
      joinOption
    ); // This third argument is to remove the field from response
    return requestHours;
  } catch (e) {
    logger.error(e);
  }
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryRequest = async (filterData, options, join, joinOption, req) => {
  const filter = filterData;
  const logdata = { ...filter };
  if (req.user.role.includes("admin") || req.user.role.includes("approver")) {
  } else if (req.user.role.includes("sponsor")) {
    const sponsorProject = [];
    const sponsoredUser = [];
    await SponsorDetails.find({ sponsorId: req.user._id }).then(async (e) => {
      e.forEach((data) => {
        sponsorProject.push(data.projectId);
      });
      await ApprovedRequest.find({ projectId: { $in: sponsorProject } }).then(
        async (approveData) => {
          approveData.forEach((userdata) => {
            sponsoredUser.push(userdata.userId);
          });
        }
      );
    });
    if (filter.userId && !sponsoredUser.includes(filter.userId)) {
      throw new Error("You do not have access to view this data");
    }
  } else if (req.user.role.includes("resource")) {
    if (filter.userId) {
      if (req.user._id !== filter.userId)
        throw new Error("You do not have access to view this data");
    }
  }
  if (req.query.from && req.query.to) {
    const startDate = req.query.from;
    const endDate = req.query.to;

    // startDate.setUTCHours(00, 00, 00, 00);
    endDate.setUTCHours(23, 58, 59, 999);
    filter.createdAt = {
      $gte: new Date(`${startDate}`),
      $lte: new Date(`${endDate}`),
    };
  } else if (req.query.from && !req.query.to) {
    const startDate = req.query.from;
    filter.createdAt = {
      $gte: new Date(`${startDate}`),
    };
  } else if (!req.query.from && req.query.to) {
    const endDate = req.query.to;
    endDate.setUTCHours(23, 58, 59, 999);
    filter.createdAt = {
      $lte: new Date(`${endDate}`),
    };
  }

  if (filter.type === "sign_up") {
    return getSignupQuery(filter, options, join, joinOption, req);
  }

  if (filter.type === "payment") {
    return getPaymentQuery(filter, options, join, joinOption, req);
  }
  if (filter.type === "add_hours") {
    return getAddHoursQuery(filter, options, join, joinOption, req);
  }
  if (filter.type === "leave") {
    return getLeaveQuery(filter, options, join, joinOption, req);
  }
  let changeJoin = join;
  changeJoin = [
    {
      path: "projectId",
      model: "projects",
      populate: {
        path: "location",
        model: "locations",
        select: "location",
      },
    },
    {
      path: "userId",
      model: "users",
    },
  ];
  logdata.from = req.query.from;
  logdata.to = req.query.to;
  const logBodyData = {
    action: "get",
    userId: req.user._id,
    collectionName: "requests",
    data: logdata,
  };
  await logsService.createlogs(logBodyData);
  return Request.paginate(
    filter,
    options,
    { createdBy: 0, updatedBy: 0, isDeleted: 0 },
    changeJoin,
    joinOption
  );
};

const getRequestById = async (id) => {
  try {
    return Request.find({ _id: id, isDeleted: false }, { isDeleted: 0 });
  } catch (e) {
    logger.error(e);
  }
};

// update function based on type of request
const updateSignup = async (request, updateBodyData, user) => {
  const updateBody = updateBodyData;
  try {
    updateBody.updatedBy = user._id;
    if (updateBody.grantedHours) {
      updateBody.remainingHours = updateBody.grantedHours;
    }
    if (updateBody.status === "approved") {
      updateBody.inProject = true;
      const check = await ApprovedRequest.find({
        projectId: request.projectId,
        userId: request.userId,
        isActive: true,
      });

      if (check.length === 0) {
        const approvedSignupBody = {
          _id: "",
          projectId: request.projectId,
          requestId: request._id,
          userId: request.userId,
        };

        const id = await counter.getCount("approvedRequests"); // passing users id to get counter value to autoIncrement _id

        approvedSignupBody._id = id.toString();
        await ApprovedRequest.create(approvedSignupBody);
        const logBodyData = {
          action: "create",
          userId: approvedSignupBody._id,
          collectionName: "approvedRequests",
          data: approvedSignupBody,
        };
        await logsService.createlogs(logBodyData);
      } else {
        throw new ApiError(
          httpStatus.CONFLICT,
          "Already resource to this project"
        );
      }
    }

    if (updateBody.status === "approved" || updateBody.status === "rejected") {
      let reason = "";
      if (updateBody.status === "rejected")
        reason = updateBody.reasonForRejection;
      const project = await Project.find({ _id: request.projectId });
      if (updateBody.status === "approved")
        await Project.update(
          { _id: request.projectId },
          { status: "inProgress" }
        );
      await User.find({ _id: request.userId }).then((userData) => {
        const emailData = {
          firstName: userData[0].firstName,
          lastName: userData[0].lastName,
          type: request.type,
          status: updateBody.status,
          projectTitle: project[0].title,
          reason,
        };

        emailService.sendServiceApprovedEmail(userData[0].email, emailData);
      });

      Object.assign(request, updateBody);
      await request.save().then(() => requestCount(request));

      return request;
    }
    Object.assign(request, updateBody);
    await request.save().then(() => requestCount(request));
    const logBodyData = {
      action: "put",
      userId: request._id,
      collectionName: "requests",
      data: updateBody,
    };
    await logsService.createlogs(logBodyData);
    return request;
  } catch (e) {
    logger.error(e);
  }
};

const updatePayment = async (request, updateBodyData, user) => {
  const updateBody = updateBodyData;
  try {
    if (updateBody.status === "approved" || updateBody.status === "rejected") {
      let reason = "";
      if (updateBody.status === "rejected")
        reason = updateBody.reasonForRejection;
      const project = await Project.find({ _id: request.projectId });
      const userEmail = await User.find({ _id: request.userId });
      const emailData = {
        firstName: userEmail[0].firstName,
        lastName: userEmail[0].lastName,
        type: request.type,
        status: updateBody.status,
        projectTitle: project[0].title,
        amount: updateBody.amountToPay,
        hours: updateBody.hoursToPay,
        reason,
      };
      emailService
        .sendServiceApprovedEmail(userEmail[0].email, emailData)
        .catch((err) => {
          console.log(err);
        });

      // emailService.sendPaymentApprovedEmail(userEmail[0].email, emailData);
    }
    if (updateBody.status === "rejected") {
      const payment = await Request.findById({ _id: request.requestId });
      const usedHours = payment.usedHours - parseFloat(updateBody.hoursToPay);
      const remainingHours =
        payment.remainingHours + parseFloat(updateBody.hoursToPay);
      const updatedData = {
        usedHours,
        remainingHours,
      };

      Object.assign(payment, updatedData);
      await payment.save();
    }
    updateBody.updatedBy = user._id;
    Object.assign(request, updateBody);
    await request.save().then(() => requestCount(request));
    const logBodyData = {
      action: "put",
      userId: request._id,
      collectionName: "requests",
      data: updateBody,
    };
    await logsService.createlogs(logBodyData);
    return request;
  } catch (e) {
    logger.error(e);
  }
};

const updateAddHours = async (request, updateBodyData) => {
  const updateBody = updateBodyData;
  try {
    if (updateBody.status === "approved") {
      await Request.findByIdAndUpdate(
        { _id: updateBody.requestId },
        {
          $inc: {
            grantedHours: updateBody.hoursToAdd,
            remainingHours: updateBody.hoursToAdd,
          },
        }
      );
      const project = await Project.find({ _id: request.projectId });
      const userEmail = await User.find({ _id: request.userId });
      const emailData = {
        firstName: userEmail[0].firstName,
        lastName: userEmail[0].lastName,
        type: request.type,
        status: updateBody.status,
        projectTitle: project[0].title,
        hours: request.hoursToAdd,
      };
      emailService.sendServiceApprovedEmail(userEmail[0].email, emailData);
    }
    if (updateBody.status === "rejected") {
      const project = await Project.find({ _id: request.projectId });
      const userEmail = await User.find({ _id: request.userId });
      const emailData = {
        firstName: userEmail[0].firstName,
        lastName: userEmail[0].lastName,
        type: request.type,
        status: updateBody.status,
        projectTitle: project[0].title,
        reason: updateBody.reasonForRejection,
      };
      emailService.sendServiceApprovedEmail(userEmail[0].email, emailData);
    }
    await Object.assign(request, updateBody);
    await request.save().then(() => requestCount(request));
    const logBodyData = {
      action: "put",
      userId: request._id,
      collectionName: "requests",
      data: updateBody,
    };
    await logsService.createlogs(logBodyData);
    return request;
  } catch (e) {
    logger.error(e);
  }
};

const updateLeave = async (request, updateBodyData) => {
  const updateBody = updateBodyData;
  try {
    if (updateBody.status === "approved") {
      updateBody.isActive = false;
      await ApprovedRequest.findOneAndUpdate(
        { projectId: updateBody.projectId, userId: updateBody.userId },
        updateBody
      );
    }

    await Object.assign(request, updateBody);
    await request.save();
    const logBodyData = {
      action: "put",
      userId: request._id,
      collectionName: "requests",
      data: updateBody,
    };
    await logsService.createlogs(logBodyData);
    return request;
  } catch (e) {
    logger.error(e);
  }
};

const updateRequest = async (requestId, updateBodyData, user) => {
  const updateBody = updateBodyData;
  const request = await Request.findById(requestId);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, "request not found");
  }

  if (updateBody.type === "sign_up") {
    return updateSignup(request, updateBody, user);
  }

  if (updateBody.type === "payment") {
    return updatePayment(request, updateBody, user);
  }
  if (updateBody.type === "add_hours") {
    return updateAddHours(request, updateBody, user);
  }
  if (updateBody.type === "leave") {
    return updateLeave(request, updateBody, user);
  }
  throw new ApiError(httpStatus.NOT_FOUND, "enter valid type ");
};

const deleteRequest = async (requestId) => {
  try {
    const request = await Request.findById(requestId);
    if (!request) {
      throw new ApiError(httpStatus.NOT_FOUND, "request  not found");
    }
    if (request.status === "approved") {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Your Request is Approved and  can't be modified or deleted"
      );
    }
    if (request.type === "payment") {
      const payment = await Request.findById({ _id: request.requestId });
      const usedHours = payment.usedHours - parseInt(request.hoursToPay, 10);
      const remainingHours =
        payment.remainingHours + parseInt(request.hoursToPay, 10);
      const updatedData = {
        usedHours,
        remainingHours,
      };
      Object.assign(payment, updatedData);
      await payment.save();
    }
    // await payment.remove();
    request.isDeleted = true;
    // request.status = "rejected";
    await request.save().then(async (e) => {
      await requestCount(e);
    });
    const logBodyData = {
      action: "delete",
      userId: request._id,
      collectionName: "requests",
      data: { _id: requestId },
    };
    await logsService.createlogs(logBodyData);
    return request;
  } catch (e) {
    logger.error(e);
  }
};
// get approver requests

const getApproverRequests = async (
  filterData,
  options,
  join,
  joinOption,
  req
) => {
  const filter = filterData;
  try {
    if (req.query.from && req.query.to) {
      const startDate = req.query.from;
      const endDate = req.query.to;
      endDate.setUTCHours(23, 59, 59, 999);
      filter.createdAt = {
        $gte: new Date(`${startDate}`),
        $lte: new Date(`${endDate}`),
      };
    } else if (req.query.from && !req.query.to) {
      const startDate = req.query.from;
      filter.createdAt = {
        $gte: new Date(`${startDate}`),
      };
    } else if (!req.query.from && req.query.to) {
      const endDate = req.query.to;
      endDate.setUTCHours(23, 58, 59, 999);
      filter.createdAt = {
        $lte: new Date(`${endDate}`),
      };
    }
    const signup = await Request.paginate(
      filter,
      options,
      { createdBy: 0, updatedBy: 0, isDeleted: 0 },
      join,
      joinOption
    ); // This third argument is to remove the field from response
    return signup;
  } catch (e) {
    logger.error(e);
  }
};

// get admin Requests
const getAdminRequests = async (filterData, options, join, joinOption, req) => {
  const filter = filterData;
  try {
    if (req.query.from && req.query.to) {
      const startDate = req.query.from;
      const endDate = req.query.to;
      endDate.setUTCHours(23, 59, 59, 999);
      filter.createdAt = {
        $gte: new Date(`${startDate}`),
        $lte: new Date(`${endDate}`),
      };
    } else if (req.query.from && !req.query.to) {
      const startDate = req.query.from;
      filter.createdAt = {
        $gte: new Date(`${startDate}`),
      };
    }
    const signup = await Request.paginate(
      filter,
      options,
      { createdBy: 0, updatedBy: 0, isDeleted: 0 },
      join,
      joinOption
    ); // This third argument is to remove the field from response
    return signup;
  } catch (e) {
    logger.error(e);
  }
};

// get resource request
const getRequestsByResourceId = async (
  filterData,
  options,
  join,
  joinOption,
  req
) => {
  const filter = filterData;
  try {
    filter.userId = req.user._id;
    filter.type = "sign_up";

    if (req.query.from && req.query.to) {
      const startDate = req.query.from;
      const endDate = req.query.to;
      endDate.setUTCHours(23, 59, 59, 999);
      filter.createdAt = {
        $gte: new Date(`${startDate}`),
        $lte: new Date(`${endDate}`),
      };
    } else if (req.query.from && !req.query.to) {
      const startDate = req.query.from;
      filter.createdAt = {
        $gte: new Date(`${startDate}`),
      };
    } else if (!req.query.from && req.query.to) {
      const endDate = req.query.to;
      endDate.setUTCHours(23, 58, 59, 999);
      filter.createdAt = {
        $lte: new Date(`${endDate}`),
      };
    }
    const signup = await Request.paginate(
      filter,
      options,
      { createdBy: 0, updatedBy: 0, isDeleted: 0 },
      join,
      joinOption
    ); // This third argument is to remove the field from response
    return signup;
  } catch (e) {
    logger.error(e);
  }
};

// get resource requests
const getRequestsBySponsorId = async (
  filterData,
  options,
  join,
  joinOption,
  req
) => {
  const filter = filterData;
  const logBodyData = {
    action: "get",
    userId: req.user._id,
    collectionName: "requests",
    data: filter,
  };
  await logsService.createlogs(logBodyData);
  const sponsorProject = [];
  try {
    // filter.type = "sign_up";

    if (req.query.from && req.query.to) {
      const startDate = req.query.from;
      const endDate = req.query.to;
      endDate.setUTCHours(23, 59, 59, 999);
      filter.createdAt = {
        $gte: new Date(`${startDate}`),
        $lte: new Date(`${endDate}`),
      };
    } else if (req.query.from && !req.query.to) {
      const startDate = req.query.from;
      filter.createdAt = {
        $gte: new Date(`${startDate}`),
      };
    } else if (!req.query.from && req.query.to) {
      const endDate = req.query.to;
      endDate.setUTCHours(23, 58, 59, 999);
      filter.createdAt = {
        $lte: new Date(`${endDate}`),
      };
    }
    await SponsorDetails.find({ sponsorId: req.query.userId }).then((e) => {
      e.forEach((data) => {
        sponsorProject.push(data.projectId);
      });
    });
    filter.projectId = { $in: sponsorProject };

    const signup = await Request.paginate(
      filter,
      options,
      { createdBy: 0, updatedBy: 0, isDeleted: 0 },
      join,
      joinOption
    ); // This third argument is to remove the field from response

    return signup;
  } catch (e) {
    logger.error(e);
  }
};

// Get payments by role{Approver}

const getApproverPayments = async (
  filterData,
  options,
  join,
  joinOption,
  req
) => {
  const filter = filterData;
  try {
    if (filter.requestorEmail)
      filter.requestorEmail = { $regex: filter.requestorEmail, $options: "i" };
    if (req.query.from && req.query.to) {
      const startDate = req.query.from;
      const endDate = req.query.to;
      endDate.setUTCHours(23, 59, 59, 999);
      filter.createdAt = {
        $gte: new Date(`${startDate}`),
        $lte: new Date(`${endDate}`),
      };
    } else if (req.query.from && !req.query.to) {
      const startDate = req.query.from;
      filter.createdAt = {
        $gte: new Date(`${startDate}`),
      };
    } else if (!req.query.from && req.query.to) {
      const endDate = req.query.to;
      endDate.setUTCHours(23, 58, 59, 999);
      filter.createdAt = {
        $lte: new Date(`${endDate}`),
      };
    }
    const payment = await Request.paginate(
      filter,
      options,
      { createdBy: 0, updatedBy: 0, isDeleted: 0 },
      join,
      joinOption
    ); // This third argument is to remove the field from response
    return payment;
  } catch (e) {
    logger.error(e);
  }
};

// Get payments by role{Admin}

const getAdminPayments = async (filterData, options, join, joinOption, req) => {
  const filter = filterData;
  try {
    if (filter.requestorEmail)
      filter.requestorEmail = { $regex: filter.requestorEmail, $options: "i" };

    if (req.query.from && req.query.to) {
      const startDate = req.query.from;
      const endDate = req.query.to;
      endDate.setUTCHours(23, 59, 59, 999);
      filter.createdAt = {
        $gte: new Date(`${startDate}`),
        $lte: new Date(`${endDate}`),
      };
    } else if (req.query.from && !req.query.to) {
      const startDate = req.query.from;
      filter.createdAt = {
        $gte: new Date(`${startDate}`),
      };
    } else if (!req.query.from && req.query.to) {
      const endDate = req.query.to;
      endDate.setUTCHours(23, 58, 59, 999);
      filter.createdAt = {
        $lte: new Date(`${endDate}`),
      };
    }
    const payment = await Request.paginate(
      filter,
      options,
      { createdBy: 0, updatedBy: 0, isDeleted: 0 },
      join,
      joinOption
    ); // This third argument is to remove the field from response
    return payment;
  } catch (e) {
    logger.error(e);
  }
};

// Get payments by role{Resource}

const getPaymentsByResourceId = async (
  filterData,
  options,
  join,
  joinOption,
  req
) => {
  const filter = filterData;
  try {
    filter.userId = req.user._id;
    filter.type = "payment";
    if (filter.requestorEmail)
      filter.requestorEmail = { $regex: filter.requestorEmail, $options: "i" };
    if (req.query.from && req.query.to) {
      const startDate = req.query.from;
      const endDate = req.query.to;
      endDate.setUTCHours(23, 59, 59, 999);
      filter.createdAt = {
        $gte: new Date(`${startDate}`),
        $lte: new Date(`${endDate}`),
      };
    } else if (req.query.from && !req.query.to) {
      const startDate = req.query.from;
      filter.createdAt = {
        $gte: new Date(`${startDate}`),
      };
    } else if (!req.query.from && req.query.to) {
      const endDate = req.query.to;
      endDate.setUTCHours(23, 58, 59, 999);
      filter.createdAt = {
        $lte: new Date(`${endDate}`),
      };
    }
    const payment = await Request.paginate(
      filter,
      options,
      { createdBy: 0, updatedBy: 0, isDeleted: 0 },
      join,
      joinOption
    ); // This third argument is to remove the field from response
    return payment;
  } catch (e) {
    logger.error(e);
  }
};

// Get payments by role{Resource}

const getPaymentsBySponsorId = async (
  filterData,
  options,
  join,
  joinOption,
  req
) => {
  const filter = filterData;
  try {
    filter.userId = req.user._id;
    filter.type = "payment";
    if (filter.requestorEmail)
      filter.requestorEmail = { $regex: filter.requestorEmail, $options: "i" };
    if (req.query.from && req.query.to) {
      const startDate = req.query.from;
      const endDate = req.query.to;
      endDate.setUTCHours(23, 59, 59, 999);
      filter.createdAt = {
        $gte: new Date(`${startDate}`),
        $lte: new Date(`${endDate}`),
      };
    } else if (req.query.from && !req.query.to) {
      const startDate = req.query.from;
      filter.createdAt = {
        $gte: new Date(`${startDate}`),
      };
    } else if (!req.query.from && req.query.to) {
      const endDate = req.query.to;
      endDate.setUTCHours(23, 58, 59, 999);
      filter.createdAt = {
        $lte: new Date(`${endDate}`),
      };
    }
    const sponsor = await SponsorDetails.find({ sponsorId: req.user._id });
    const resource = await ApprovedRequest.find({
      projectId: sponsor[0].projectId,
    });
    const sponsorPayment = [];
    resource.map((e) => sponsorPayment.push(e.userId));
    filter.projectId = sponsor[0].projectId;
    const payment = await Request.paginate(
      filter,
      options,
      { createdBy: 0, updatedBy: 0, isDeleted: 0 },
      join,
      joinOption
    ); // This third argument is to remove the field from response
    return payment;
  } catch (e) {
    logger.error(e);
  }
};

const queryBySearch = async (filterData, options, join, joinOption, req) => {
  const filter = filterData;
  const logBodyData = {
    action: "get",
    userId: req.user._id,
    collectionName: "requests",
    data: filter,
  };
  await logsService.createlogs(logBodyData);
  try {
    if (req.body.from && req.body.to) {
      const startDate = req.body.from;
      const endDate = req.body.to;
      endDate.setUTCHours(23, 58, 59, 999);
      filter.createdAt = {
        $gte: new Date(`${startDate}`),
        $lte: new Date(`${endDate}`),
      };
    } else if (req.body.from && !req.body.to) {
      const startDate = req.body.from;
      filter.createdAt = {
        $gte: new Date(`${startDate}`),
      };
    } else if (!req.body.from && req.body.to) {
      const endDate = req.body.to;
      endDate.setUTCHours(23, 58, 59, 999);
      filter.createdAt = {
        $lte: new Date(`${endDate}`),
      };
    }
    if (filter.status) {
      filter.status = { $in: filter.approved };
    }
    if (filter.type) {
      filter.type = { $in: filter.type };
    }
    const request = await Request.paginate(
      filter,
      options,
      { createdBy: 0, updatedBy: 0, isDeleted: 0 },
      join,
      joinOption
    ); // This third argument is to remove the field from response

    return request;
  } catch (e) {
    logger.error(e);
  }
};

// get admin requests
const queryRequestFilter = async (
  filterData,
  options,
  join,
  joinOption,
  req
) => {
  const filter = filterData;
  const logData = { ...filter };
  try {
    if (req.body.from && req.body.to) {
      const startDate = req.body.from;
      const endDate = req.body.to;

      startDate.setUTCHours(0, 0, 0, 0);
      endDate.setUTCHours(23, 59, 59, 999);
      filter.createdAt = {
        $gte: new Date(`${startDate}`),
        $lte: new Date(`${endDate}`),
      };
    } else if (req.body.from && !req.body.to) {
      const startDate = req.body.from;
      startDate.setUTCHours(0, 0, 0, 0);
      filter.createdAt = {
        $gte: new Date(`${startDate}`),
      };
    } else if (!req.body.from && req.body.to) {
      const endDate = req.body.to;
      endDate.setUTCHours(23, 58, 59, 999);
      filter.createdAt = {
        $lte: new Date(`${endDate}`),
      };
    }
    if (req.body.from) logData.from = req.body.from;
    if (req.body.to) logData.to = req.body.to;
    if (req.body.projectType) logData.projectType = req.body.projectType;
    if (req.body.location) logData.location = req.body.location;
    if (req.body.projectId) logData.projectId = req.body.projectId;

    const locationId = [];
    const projectTypeId = [];
    let locationAndProject = [];
    if (req.body.location && !req.body.projectType) {
      if (req.body.projectId) {
        await Project.find({
          location: { $in: req.body.location },
          _id: req.body.projectId,
        })
          .then((e) => {
            e.forEach((data) => {
              locationId.push(data._id);
            });
          })
          .catch((err) => console.log(err));
      } else {
        await Project.find({ location: { $in: req.body.location } })
          .then((e) => {
            e.forEach((data) => {
              locationId.push(data._id);
            });
          })
          .catch((err) => console.log(err));
      }
      locationId.forEach((e) => {
        if (!locationAndProject.includes(e)) locationAndProject.push(e);
      });
      if (locationAndProject.length > 0) {
        filter.projectId = { $in: locationAndProject };
      } else {
        filter.projectId = { $in: locationAndProject };
        // throw new ApiError(NOT_FOUND,"no data found")
      }
    } else if (req.body.projectType && !req.body.location) {
      if (req.body.projectId) {
        await Project.find({
          type: { $in: req.body.projectType },
          _id: req.body.projectId,
        })
          .then((e) => {
            e.forEach((data) => {
              projectTypeId.push(data._id);
            });
          })
          .catch((err) => console.log(err));
      } else {
        await Project.find({ type: { $in: req.body.projectType } })
          .then((e) => {
            e.forEach((data) => {
              projectTypeId.push(data._id);
            });
          })
          .catch((err) => console.log(err));
      }
      projectTypeId.forEach((e) => {
        if (!locationAndProject.includes(e)) locationAndProject.push(e);
      });
      if (locationAndProject.length > 0) {
        filter.projectId = { $in: locationAndProject };
      } else {
        filter.projectId = { $in: locationAndProject };
        // throw new ApiError(NOT_FOUND,"no data found")
      }
    } else if (req.body.location && req.body.projectType) {
      if (req.body.projectId) {
        await Project.find({
          _id: { $in: req.body.projectId },
          location: { $in: req.body.location },
          type: { $in: req.body.projectType },
          isClosed: false,
        })
          .then((e) => {
            e.forEach((data) => {
              locationId.push(data._id);
            });
          })
          .catch((err) => console.log(err));
      } else {
        await Project.find({
          location: { $in: req.body.location },
          type: { $in: req.body.projectType },
          isClosed: false,
        })
          .then((e) => {
            e.forEach((data) => {
              locationId.push(data._id);
            });
          })
          .catch((err) => console.log(err));
      }
      locationId.forEach((e) => {
        if (!locationAndProject.includes(e)) locationAndProject.push(e);
      });

      if (locationAndProject.length > 0) {
        filter.projectId = { $in: locationAndProject };
      } else {
        filter.projectId = { $in: locationAndProject };
        // throw new ApiError(NOT_FOUND,"no data found")
      }
    } else if (
      req.body.projectId &&
      !(req.body.location && req.body.projectType)
    ) {
      locationAndProject = [...req.body.projectId];
      filter.projectId = { $in: locationAndProject };
    }

    if (req.body.generate === true) {
      if (filter.corematicaName)
        filter.corematicaName = {
          $regex: filter.corematicaName,
          $options: "i",
        };
      if (req.body.search) {
        filter.$or = [
          {
            firstName: {
              $regex: `${escapeRegExp(req.body.search)}`,
              $options: "i",
            },
          },
          {
            lastName: {
              $regex: `${escapeRegExp(req.body.search)}`,
              $options: "i",
            },
          },
        ];
      }

      const generate = await Request.find(filter).populate(join);
      // generate.map(async (item) => {
      //   console.log(item);
      //   await requestCount(item);
      // });
      if (generate.length) {
        const newGeneratedArray = [];
        generate.forEach((item) => {
          const data = {
            ManualPayType: "Qtrly Committee/Citizenship",
            BusinessUnitShortName: "PIMG",
            PaySiteShortName: item.projectId.location.location,
            PersonShortName: item.userId.corematicaName,
            ServiceDate: item.createdAt,
            Quantity: "1",
            Amount: item.amountToPay,
            Line1: item.bodyOfWork,
            Line2: item.projectId.type,
          };
          newGeneratedArray.push(data);
        });
        const fields = [
          "ManualPayType",
          "BusinessUnitShortName",
          "PaySiteShortName",
          "PersonShortName",
          "ServiceDate",
          "Quantity",
          "Amount",
          "Line1",
          "Line2",
        ];

        const opts = { fields };
        try {
          const parser = new Parser(opts);
          const csv = parser.parse(newGeneratedArray);

          const date = new Date().toISOString().split("T")[0];
          const time = new Date().toISOString().split("T");
          const newTime = time[1].split(":");
          let name = `PayRoll_${date}_${newTime[0]}_${newTime[1]}_${
            newTime[2].split(".")[0]
          }`;
          name = name.replace(/\-/g, "_");
          const filePath = path.join(__dirname, "../public/reports/");

          fs.writeFile(`${filePath}${name}.csv`, csv, function (err) {
            if (err) {
              throw new Error(err);
            } else {
              console.log("success");
            }
          });
          return { fileName: `${name}.csv` };
        } catch (err) {
          console.error(err);
          throw new ApiError(httpStatus.EXPECTATION_FAILED, err);
        }
      } else {
        throw new Error("No reports to download");
      }
    }

    // This is to generate requestHistory
    if (req.body.requestHistory === true) {
      const generate = await Request.find(filter).populate(join);
      if (generate.length) {
        const newRequestHistoryArray = [];
        generate.forEach((item) => {
          const data = {
            ProjectTitle: item.projectId.title,
            User: item.userId.corematicaName,
            Location: item.projectId.location.location,
            ProjectType: item.projectId.type,
            ProjectStatus: item.projectId.status,
            CreatedOn: item.createdAt,
            RequestType: item.type,
            Rate: item.projectId.rateOfPay,
            Hours: `${
              item.type === "payment"
                ? item.hoursToPay
                : item.type === "addHours"
                ? item.hoursToAdd
                : "-"
            }`,
            PaymentAmount: `${
              item.type === "payment" ? item.amountToPay : "-"
            }`,
            PaymentStatus: `${
              item.type === "payment"
                ? item.status + (item.isPaid ? " (paid)" : " (unPaid)")
                : item.status
            }`,
          };
          newRequestHistoryArray.push(data);
        });
        const fields = [
          "ProjectTitle",
          "User",
          "Location",
          "ProjectType",
          "ProjectStatus",
          "CreatedOn",
          "RequestType",
          "Rate",
          "Hours",
          "PaymentAmount",
          "PaymentStatus",
        ];

        const opts = { fields };
        try {
          const parser = new Parser(opts);
          const csv = parser.parse(newRequestHistoryArray);

          // res.setHeader('Content-Type', 'text/csv');
          const date = new Date().toISOString().split("T")[0];
          const dummy = new Date();
          const time = new Date().toISOString().split("T");
          const newTime = time[1].split(":");
          let name = `RequestHistory_${date}_${newTime[0]}_${newTime[1]}_${
            newTime[2].split(".")[0]
          }`;
          name = name.replace(/\-/g, "_");
          const filePath = path.join(__dirname, "../public/reports/");

          fs.writeFile(`${filePath}${name}.csv`, csv, function (err) {
            if (err) {
              throw new Error(err);
            } else {
              console.log("success");
            }
          });
          return { fileName: `${name}.csv` };
        } catch (err) {
          console.error(err);
          throw new ApiError(httpStatus.EXPECTATION_FAILED, err);
        }
      } else {
        throw new Error("No request to download");
      }
      // const generate = await Request.find(filter).sort(sort)
    }
    const logBodyData = {
      action: "get",
      userId: req.user._id,
      collectionName: "requests",
      data: logData,
    };
    await logsService.createlogs(logBodyData);
    const signup = await Request.paginate(
      filter,
      options,
      { createdBy: 0, updatedBy: 0, isDeleted: 0 },
      join,
      joinOption
    ); // This third argument is to remove the field from response
    return signup;
  } catch (e) {
    logger.error(e);
    throw new ApiError(httpStatus.NOT_FOUND, e);
  }
};

const getCsv = async (filterData) => {
  const filter = filterData;
  let csvData;
  try {
    if (filter.type === "reports") {
      const filePath = path.join(__dirname, "../public/reports/");
      csvData = await fs.readFile(
        `${filePath}${filter.fileName}.csv`,
        "utf-8",
        function (err, data) {
          // var fileData = new Buffer(data).toString('base64');
          if (err) {
            return err;
          }
          return data;
        }
      );
    }
    if (filter.type === "requestHistory") {
      const filePath = path.join(__dirname, "../public/reports/");
      csvData = await fs.readFile(
        `${filePath}${filter.fileName}.csv`,
        "utf-8",
        function (err, data) {
          if (err) {
            return err;
          }
          return data;
        }
      );
    }
    return csvData;
  } catch (e) {
    logger.error(e);
  }
};

// export all the request to use in Request.controller.js
module.exports = {
  createRequest,
  queryRequest,
  updateRequest,
  getRequestById,
  deleteRequest,
  getApproverRequests,
  getAdminRequests,
  getRequestsByResourceId,
  getRequestsBySponsorId,
  getApproverPayments,
  getAdminPayments,
  getPaymentsByResourceId,
  getPaymentsBySponsorId,
  queryBySearch,
  queryRequestFilter,
  getCsv,
};
