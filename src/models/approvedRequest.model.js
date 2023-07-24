/** ***************** package Import ******************************************************** */

const mongoose = require("mongoose");

/** ***************** toJson and paginate from plugins folder ******************************************************** */

const { toJSON, paginate } = require("./plugins");

/*  
 approvedRequestSchema  - It is the schema for our approvedrequest module
*/
const approvedRequestSchema = mongoose.Schema(
  {
    _id: {
      type: String,
    },
    projectId: {
      type: String,
      ref: "projects",
      required: true,
    },
    requestId: {
      type: String,
      ref: "requests",
      required: true,
    },
    userId: {
      type: String,
      ref: "users",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

// add plugin that converts mongoose to json and paginate
approvedRequestSchema.plugin(toJSON);
approvedRequestSchema.plugin(paginate);

approvedRequestSchema.pre("save", async function (next) {
  next();
});

/**
 * @typedef ApprovedRequest
 */
const ApprovedRequest = mongoose.model(
  "approvedRequests",
  approvedRequestSchema,
  "approvedRequests"
);

module.exports = ApprovedRequest;
