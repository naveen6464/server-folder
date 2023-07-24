/*
   Service Name : Project
*/

/** ***************** Models Import ******************************************************** */
const httpStatus = require("http-status");

const cron = require("node-cron");
const logger = require("../config/logger");
/** ***************** Import Project model from model ******************************************************** */
const {
  Project,
  Request,
  ApprovedRequest,
  SponsorDetails,
  Pillar,
  Goal,
  User,
} = require("../models");

/** ***************** ApiError from utils ******************************************************** */
const ApiError = require("../utils/ApiError");

/** ***************** counter from services ******************************************************** */
const counter = require("./counter.service");
const emailService = require("./email.service");
const requestService = require("./request.service");
const logsService = require("./logs.service");

/**
 * Create a Project
 * @param {Object} userBody
 * @returns {Promise<User>}
 */

const ifPillarOrGoalExist = async (userBody) => {
  if (userBody.pillarId) {
    if (userBody.pillarId.length) {
      let count = 0;
      await userBody.pillarId.forEach(async (id) => {
        await Project.find({ pillarId: { $in: [id] } })
          .countDocuments()
          .then(async (res) => {
            count = res + 1;
            await Pillar.update({ _id: id }, { projectCount: count });
          });
      });
    }
  }
  if (userBody.goalId) {
    if (userBody.goalId.length) {
      let count = 0;
      await userBody.goalId.forEach(async (id) => {
        await Project.find({ goalId: { $in: [id] } })
          .countDocuments()
          .then(async (res) => {
            count = res + 1;
            await Goal.update({ _id: id }, { projectCount: count });
          });
      });
    }
  }
};
const createProject = async (userBodyData, user) => {
  const userBody = userBodyData;

  const check = await Project.exists({
    title: userBody.title,
    isDeleted: false,
  });
  if (!check) {
    if (userBody.pillarId !== [] || userBody.goalId !== []) {
      ifPillarOrGoalExist(userBody);
    }
    const id = await counter.getCount("projects"); // passing users id to get counter value to autoIncrement _id
    userBody._id = id.toString();
    userBody.createdBy = user._id;

    const project = await Project.create(userBody);
    const logBodyData = {
      action: "create",
      userId: userBody._id,
      collectionName: "projects",
      data: userBody,
    };
    await logsService.createlogs(logBodyData);
    return project;
  }
  throw new ApiError(httpStatus.CONFLICT, "title is already found");
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
const queryProject = async (filterData, options, join, joinOption, req) => {
  const filter = filterData;

  if (req.query.search) {
    filter.$or = [
      { title: { $regex: `${req.query.search}`, $options: "i" } },
      { description: { $regex: `${req.query.search}`, $options: "i" } },
    ];
  }
  if (req.query.from && req.query.to) {
    const startDate = req.query.from;
    const endDate = req.query.to;
    filter.createdAt = {
      $gte: new Date(`${startDate}`),
      $lt: new Date(`${endDate}`),
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
  let logBodyData = {
    action: "get",
    userId: req.user._id,
    collectionName: "projects",
    data: filter,
  };
  await logsService.createlogs(logBodyData);
  const project = await Project.paginate(
    filter,
    options,
    { createdBy: 0, updatedBy: 0, isDeleted: 0 },
    join,
    joinOption
  ); // This third argument is to remove the field from response
  // JOIN  IS FOR POPULATION

  const approvedData = async (id) => {
    const tempArray = [];
    await ApprovedRequest.find({ projectId: id, isActive: true }).then(
      (res) => {
        tempArray.push(res);
      }
    );
    logBodyData = {
      action: "get",
      userId: id,
      collectionName: "approvedRequests",
      data: { _id: id },
    };
    await logsService.createlogs(logBodyData);

    return tempArray;
  };
  const sponsorData = async (id) => {
    const sponsorArray = [];
    await SponsorDetails.find({ projectId: id }).then((res) => {
      sponsorArray.push(res);
    });
    return sponsorArray;
  };
  const dummyProject = project;

  await Promise.all(
    project.results.map(async (currentData, index) => {
      const approvedResult = await approvedData(currentData._id);
      const resource = await approvedResult.map((e) => {
        const resultArray = [];
        e.forEach((data) => resultArray.push(data.userId));
        return resultArray;
      });
      const sponsorResult = await sponsorData(currentData._id);
      const sponsor = await sponsorResult.map((e) => {
        const resultSponsorArray = [];
        e.forEach((data) => resultSponsorArray.push(data.sponsorId));
        return resultSponsorArray;
      });
      if (req.user.role[0] === "admin") {
        const pending = await Request.find({
          status: "pending",
          projectId: currentData._id,
          isDeleted: false,
        }).then((e) => {
          const pendingService = [];
          e.forEach((data) => {
            if (!pendingService.includes(data.userId))
              pendingService.push(data.userId);
          });
          return pendingService;
        });
        const pendingPayment = await Request.find({
          type: "payment",
          status: "approved",
          projectId: currentData._id,
          isDeleted: false,
        }).then((e) => {
          const pendingpay = [];
          e.forEach((data) => {
            if (!pendingpay.includes(data.userId)) pendingpay.push(data.userId);
          });
          return pendingpay;
        });
        dummyProject.results[index].pendingService.push(...pending);
        dummyProject.results[index].pendingPayment.push(...pendingPayment);
      } else {
        const pending = await Request.find({
          type: "sign_up",
          status: "pending",
          projectId: currentData._id,
          isDeleted: false,
        }).then((e) => {
          const pendingArray = [];
          e.forEach((data) => {
            if (!pendingArray.includes(data.userId))
              pendingArray.push(data.userId);
          });
          return pendingArray;
        });

        dummyProject.results[index].pendingService.push(...pending);
      }

      const resourceArray = resource[0];
      const sponsorArray = sponsor[0];
      dummyProject.results[index].resourceData.push(...resourceArray);
      dummyProject.results[index].sponsorData.push(...sponsorArray);
    })
  );
  return dummyProject;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getProjectById = async (id) => {
  const logBodyData = {
    action: "get",
    userId: id,
    collectionName: "projects",
    data: { _id: id },
  };
  await logsService.createlogs(logBodyData);
  return Project.find(
    { _id: id, isDeleted: false },
    { createdBy: 0, updatedBy: 0, isDeleted: 0 }
  );
};

async function after30Days(emailDetails, project) {
  const emailData = emailDetails;
  const projectDetails = project;
  const updateBody = {};

  const resource = await ApprovedRequest.find({
    projectId: project._id,
    isActive: true,
  });
  await emailService.sendClosedEmail(emailData);
  updateBody.status = "closed";
  updateBody.isClosed = true;
  Object.assign(projectDetails, updateBody);
  await projectDetails.save();
  Promise.all(
    resource.map(async (data) => {
      const userBody = {
        type: "leave",
        requestId: data.requestId,
        projectId: data.projectId,
        userId: data.userId,
      };
      const user = await User.findById(data.userId);
      await requestService.createRequest(userBody, user);
    })
  );
}
async function checkProjectCloseStatus() {
  await Project.find({ status: "closing" }).then((e) => {
    e.forEach(async (data) => {
      const updateBody = {};
      if (data.daysToClose !== 30 && !(data.daysToClose > 30)) {
        updateBody.daysToClose = data.daysToClose + 1;
        Object.assign(data, updateBody);
        await data.save();
      } else if (data.daysToClose === 30) {
        const sponsorList = await SponsorDetails.find({
          projectId: data._id,
        }).then(async (sponsorData) => {
          const sponsorArray = [];
          sponsorData.map(async (sponsor) => {
            sponsorArray.push(sponsor.sponsorId);
          });
          return sponsorArray;
        });
        const resourceList = await ApprovedRequest.find({
          projectId: data._id,
          isActive: true,
        }).then(async (approverData) => {
          const resourceArray = [];
          approverData.map(async (approver) => {
            resourceArray.push(approver.userId);
          });
          return resourceArray;
        });

        Promise.all(sponsorList, resourceList);
        const sponsorEmail = await User.find({
          _id: { $in: sponsorList },
          isDeleted: false,
        });
        const resourceEmail = await User.find({
          _id: { $in: resourceList },
          isDeleted: false,
        });
        const emailData = {
          sponsor: sponsorEmail,
          resource: resourceEmail,
          status: "closed",
          projectTitle: data.title,
        };
        after30Days(emailData, data);
      }
    });
  });
}

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
let newPillar = [];
let newGoal = [];
const updateProjectById = async (projectId, updateBodyData, user) => {
  const updateBody = updateBodyData;
  const project = await Project.findById(projectId);
  const logBodyData = {
    action: "update",
    userId: updateBody._id,
    collectionName: "projects",
    data: updateBody,
  };
  await logsService.createlogs(logBodyData);
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, "Project not found");
  }
  const oldPillar = project.pillarId;
  const oldGoal = project.goalId;
  if (updateBody.pillarId) {
    newPillar = updateBody.pillarId;
    newPillar.concat(oldPillar.filter((data) => !newPillar.includes(data)));
  }
  if (updateBody.goalId) {
    newGoal = updateBody.goalId;
    newGoal.concat(oldGoal.filter((data) => !newGoal.includes(data)));
  }

  const newUpdateBody = {
    pillarId: newPillar,
    goalId: newGoal,
  };

  const check = await Project.exists({ title: updateBody.title });
  if (!check) {
    if (updateBody.pillarId !== [] || updateBody.goalId !== []) {
      await ifPillarOrGoalExist(newUpdateBody);
    }
    if (updateBody.status === "closing") {
      // const now = new Date();
      // now.setUTCHours(0, 0, 0, 0);
      // // let next30days = new Date(now.setDate(now.getDate() + 30))
      const sponsorList = await SponsorDetails.find({
        projectId: project._id,
      }).then(async (e) => {
        const sponsorArray = [];
        await e.map(async (data) => {
          sponsorArray.push(data.sponsorId);
        });
        return sponsorArray;
      });
      const resourceList = await ApprovedRequest.find({
        projectId: project._id,
        isActive: true,
      }).then(async (e) => {
        const resourceArray = [];
        await e.map(async (data) => {
          resourceArray.push(data.userId);
        });
        return resourceArray;
      });
      const sponsorEmail = await User.find({
        _id: { $in: sponsorList },
        isDeleted: false,
      });
      const resourceEmail = await User.find({
        _id: { $in: resourceList },
        isDeleted: false,
      });
      const emailData = {
        sponsor: sponsorEmail,
        resource: resourceEmail,
        status: updateBody.status,
        projectTitle: project.title,
      };
      emailService.sendClosingEmail(emailData);
      // cron.schedule("0 1 * * *", () => {
      //   checkProjectCloseStatus(emailData, project);
      // });
      cron.schedule("0 1 * * *", () => {
        checkProjectCloseStatus();
      });
    }

    updateBody.updatedBy = user._id;
    Object.assign(project, updateBody);
    await project.save();
    return project;
  }
  if (updateBody.title === project.title) {
    updateBody.updatedBy = user._id;
    Object.assign(project, updateBody);
    await project.save();
    return project;
  }
  throw new ApiError(httpStatus.NOT_FOUND, "title already exist");
};

const reScheduleCron = () => {
  cron.schedule("0 1 * * *", () => {
    checkProjectCloseStatus();
  });
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteProjectById = async (projectId) => {
  const project = await Project.findById(projectId);

  const logBodyData = {
    action: "delete",
    userId: projectId,
    collectionName: "projects",
    data: { _id: projectId },
  };
  await logsService.createlogs(logBodyData);
  if (!project) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  // await project.remove();
  project.isDeleted = true;
  await project.save();
  return project;
};

// get project by approver request
const getApproverProjects = async (
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
    collectionName: "projects",
    data: filter,
  };
  await logsService.createlogs(logBodyData);
  if (filter.title) filter.title = { $regex: filter.title, $options: "i" };
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }
  const project = await Project.paginate(
    filter,
    options,
    { createdBy: 0, updatedBy: 0, isDeleted: 0 },
    join,
    joinOption
  ); // This third argument is to remove the field from response
  // JOIN  IS FOR POPULATION
  return project;
};

// get project by admin service
const getAdminProjects = async (filterData, options, join, joinOption, req) => {
  const filter = filterData;
  const logBodyData = {
    action: "get",
    userId: req.user._id,
    collectionName: "projects",
    data: filter,
  };
  await logsService.createlogs(logBodyData);
  if (filter.title) filter.title = { $regex: filter.title, $options: "i" };
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }
  const project = await Project.paginate(
    filter,
    options,
    { createdBy: 0, updatedBy: 0, isDeleted: 0 },
    join,
    joinOption
  ); // This third argument is to remove the field from response
  // JOIN  IS FOR POPULATION
  return project;
};

// get project by sponsor request
const getProjectBySponsorID = async (
  filterData,
  options,
  join,
  joinOption,
  req
) => {
  const projectId = [];
  const sponsor = await SponsorDetails.find({ sponsorId: req.user._id });
  (await sponsor).forEach((data) => {
    projectId.push(data.projectId);
  });

  const filter = filterData;
  const logBodyData = {
    action: "get",
    userId: req.user._id,
    collectionName: "projects",
    data: filter,
  };
  await logsService.createlogs(logBodyData);
  filter._id = { $in: projectId };
  if (req.query.search) {
    filter.$or = [
      { title: { $regex: `${req.query.search}`, $options: "i" } },
      { description: { $regex: `${req.query.search}`, $options: "i" } },
    ];
  }
  filter.isActive = true;
  const project = await Project.paginate(
    filter,
    options,
    { createdBy: 0, updatedBy: 0, isDeleted: 0 },
    join,
    joinOption
  ); // This third argument is to remove the field from response
  // JOIN  IS FOR POPULATION
  return project;
};

const getProjectByResourceId = async (
  filterData,
  options,
  join,
  joinOption,
  id
) => {
  const projectId = [];
  const approved = await ApprovedRequest.find({ userId: id, isActive: true });
  (await approved).forEach((data) => projectId.push(data.projectId));

  const filter = filterData;
  const logBodyData = {
    action: "get",
    userId: id,
    collectionName: "projects",
    data: filter,
  };
  await logsService.createlogs(logBodyData);
  filter._id = { $in: projectId };
  if (filter.title) filter.title = { $regex: filter.title, $options: "i" };
  const project = await Project.paginate(
    filter,
    options,
    { createdBy: 0, updatedBy: 0, isDeleted: 0 },
    join,
    joinOption
  ); // This third argument is to remove the field from response
  // JOIN  IS FOR POPULATION
  return project;
};
function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
const queryProjectFilter = async (
  filterData,
  options,
  join,
  joinOption,
  req
) => {
  const filter = filterData;
  const logData = { ...filter };

  try {
    if (req.body.search) {
      filter.$or = [
        {
          title: { $regex: `${escapeRegExp(req.body.search)}`, $options: "i" },
        },
        {
          description: {
            $regex: `${escapeRegExp(req.body.search)}`,
            $options: "i",
          },
        },
      ];
    }
    let logBodyData = {
      action: "get",
      userId: req.user._id,
      collectionName: "projects",
      data: logData,
    };
    await logsService.createlogs(logBodyData);
    if (req.body.from && req.body.to) {
      const startDate = req.body.from;
      const endDate = req.body.to;
      endDate.setUTCHours(23, 59, 59, 999);
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
    const projectFromResource = [];
    const projectFromSponsor = [];

    if (req.body.isClosed) {
      filter.isClosed = req.body.isClosed;
    }
    if (filter.location) {
      filter.location = { $in: filter.location };
    }

    if (filter.resource && !filter.sponsor) {
      await ApprovedRequest.find({
        userId: { $in: filter.resource },
        isActive: true,
      }).then((e) => {
        e.forEach((data) => {
          projectFromResource.push(data.projectId);
        });
      });
      filter._id = { $in: projectFromResource };
      delete filter.resource;
    }

    if (filter.sponsor && !filter.resource) {
      await SponsorDetails.find({ sponsorId: { $in: filter.sponsor } }).then(
        (e) => {
          e.forEach((data) => {
            projectFromSponsor.push(data.projectId);
          });
        }
      );
      filter._id = { $in: projectFromSponsor };
      delete filter.sponsor;
    }

    if (filter.resource && filter.sponsor) {
      await ApprovedRequest.find({
        userId: { $in: filter.resource, isActive: true },
      }).then((e) => {
        e.forEach((data) => {
          projectFromResource.push(data.projectId);
        });
      });

      await SponsorDetails.find({ sponsorId: { $in: filter.sponsor } }).then(
        (e) => {
          e.forEach((data) => {
            projectFromSponsor.push(data.projectId);
          });
        }
      );

      filter.$and = [
        { _id: { $in: projectFromResource } },
        { _id: { $in: projectFromSponsor } },
      ];
      delete filter.sponsor;
      delete filter.resource;
    }
    const project = await Project.paginate(
      filter,
      options,
      { createdBy: 0, updatedBy: 0, isDeleted: 0 },
      join,
      joinOption
    ); // This third argument is to remove the field from response
    const approvedData = async (id) => {
      const tempArray = [];
      await ApprovedRequest.find({ projectId: id, isActive: true }).then(
        (res) => {
          tempArray.push(res);
        }
      );
      logBodyData = {
        action: "get",
        userId: id,
        collectionName: "approvedRequests",
        data: { _id: id },
      };
      await logsService.createlogs(logBodyData);

      return tempArray;
    };
    const sponsorData = async (id) => {
      const sponsorArray = [];
      await SponsorDetails.find({ projectId: id }).then((res) => {
        sponsorArray.push(res);
      });
      return sponsorArray;
    };
    const dummyProject = project;

    await Promise.all(
      project.results.map(async (currentData, index) => {
        const approvedResult = await approvedData(currentData._id);
        const resource = await approvedResult.map((e) => {
          const resultArray = [];
          e.forEach((data) => resultArray.push(data.userId));
          return resultArray;
        });
        const sponsorResult = await sponsorData(currentData._id);
        const sponsor = await sponsorResult.map((e) => {
          const resultSponsorArray = [];
          e.forEach((data) => resultSponsorArray.push(data.sponsorId));
          return resultSponsorArray;
        });
        const pending = await Request.find({
          type: "sign_up",
          status: "pending",
          projectId: currentData._id,
          isDeleted: false,
        }).then((e) => {
          const pendingArray = [];
          e.forEach((data) => {
            if (!pendingArray.includes(data.userId))
              pendingArray.push(data.userId);
          });
          return pendingArray;
        });
        dummyProject.results[index].pendingService.push(...pending);

        const resourceArray = resource[0];
        const sponsorArray = sponsor[0];
        dummyProject.results[index].resourceData.push(...resourceArray);
        dummyProject.results[index].sponsorData.push(...sponsorArray);
      })
    );
    return dummyProject;
  } catch (e) {
    logger.error(e);
  }
};

// export all the controller to use in project.controller.js
module.exports = {
  createProject,
  queryProject,
  getProjectById,
  getProjectByResourceId,
  getProjectBySponsorID,
  updateProjectById,
  deleteProjectById,
  getApproverProjects,
  getAdminProjects,
  queryProjectFilter,
  reScheduleCron,
};
