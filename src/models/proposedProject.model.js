/** ***************** package Import ******************************************************** */

const mongoose = require("mongoose");

/** ***************** toJson and paginate from plugins folder ******************************************************** */

const { toJSON, paginate } = require("./plugins");

/*  
 proposedProjectSchema  - It is the schema for our proposedProjectSchema module
*/
const proposedProjectSchema = mongoose.Schema(
  {
    _id: {
      type: String,
    },
    userId: {
      type: String,
      ref: "users",
    },
    // this field is for user suggesstion for the project
    proposedProject: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    createdBy: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
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

// add plugin that converts mongoose to json
proposedProjectSchema.plugin(toJSON);
proposedProjectSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */

proposedProjectSchema.pre("save", async function (next) {
  next();
});

/**
 * @typedef Pillar
 */
const ProposedProjectRequest = mongoose.model(
  "proposedProject",
  proposedProjectSchema,
  "proposedProject"
);

module.exports = ProposedProjectRequest;
