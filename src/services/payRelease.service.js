/*
   Service Name : payRelease
*/

/** ***************** Models Import ******************************************************** */

/** ***************** Import PayRelease model from model ******************************************************** */

const { PayRelease, Project, Request } = require("../models");
/** ***************** ApiError from utils ******************************************************** */

/** ***************** counter from services ******************************************************** */
const counter = require("./counter.service");
// const Request = require("../models/request.model");
const logger = require("../config/logger");

/**
 * Create a PayRelease
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createPayRelease = async (userBodyData) => {
  console.log(userBodyData);
  const userBody = userBodyData;
  try {
    const id = await counter.getCount("payReleases"); // passing users id to get counter value to autoIncrement _id
    userBody._id = id.toString();
    const userBodyId = userBody.paymentRequestId;
    let projectId = [];
    const payRelease = await PayRelease.create(userBody);
    await Request.update(
      { _id: { $in: userBodyId } },
      { $set: { isPaid: true, payId: payRelease._id } },
      { multi: true },
      function (err) {
        if (err) {
          throw err;
        }
      }
    );
    const removeDuplicateFromArray = (arr) => {
      const unique = [];
      arr.forEach((e) => {
        if (!unique.includes(e)) {
          unique.push(e);
        }
      });
      return unique;
    };
    const removeDuplicate = removeDuplicateFromArray(userBody.projectId);
    console.log(removeDuplicate);
    const requestCount = async (projectId) => {
      const countApprovedPaymentsButNotPaid = await Request.countDocuments({
        type: "payment",
        status: "approved",
        isPaid: false,
        projectId,
        isDeleted: false,
      });
      await Project.findByIdAndUpdate(projectId, {
        unPaidStatusCount: countApprovedPaymentsButNotPaid,
      });
    };
    removeDuplicate.forEach((e) => {
      requestCount(e);
    });

    // const countApprovedPaymentsButNotPaid = await Request.countDocuments({
    //   type: "payment",
    //   status: "approved",
    //   isPaid: false,
    //   projectId: request.projectId,
    //   isDeleted: false,
    // });
    // await Project.Update(
    //   { _id: { $in: removeDuplicate } },
    //   {
    //     unPaidStatusCount: countApprovedPaymentsButNotPaid,
    //   },
    //   { multi: true }
    // );
    projectId = [...userBody.projectId];

    userBodyId.forEach(async (e, index) => {
      const payment = await Request.findById(e);
      const countApprovedPayments = await Request.countDocuments({
        type: "payment",
        status: "approved",
        projectId: projectId[index],
        isDeleted: false,
      });
      if (payment.amountToPay !== 0) {
        await Project.update(
          { _id: projectId[index] },
          {
            $inc: { usedAmount: payment.amountToPay },
            approvedPaymentsCount: countApprovedPayments,
          }
        );
      }
    });

    return payRelease;
  } catch (e) {
    logger.error(e);
  }
};

const queryPayRelease = async (filterData, options, req) => {
  const filter = filterData;
  if (filter.bank) filter.bank = { $regex: filter.bank, $options: "i" };
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

  const payRelease = await PayRelease.paginate(filter, options, {
    isActive: 0,
    isDeleted: 0,
  }); // This third argument is to remove the field from response
  return payRelease;
};
module.exports = {
  createPayRelease,
  queryPayRelease,
};
