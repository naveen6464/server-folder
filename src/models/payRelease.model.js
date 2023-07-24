/** ***************** package Import ******************************************************** */

const mongoose = require("mongoose");

/** ***************** toJson and paginate from plugins folder ******************************************************** */

const { toJSON, paginate } = require("./plugins");

/*  
 payReleaseSchema  - It is the schema for our payRelease module
*/
const payReleaseSchema = mongoose.Schema(
  {
    _id: {
      type: String,
    },
    paymentRequestId: {
      type: Array,
      required: true,
    },
    userId: {
      type: Array,
      required: true,
    },
    projectId: {
      type: Array,
      required: true,
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
payReleaseSchema.plugin(toJSON);
payReleaseSchema.plugin(paginate);

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

payReleaseSchema.pre("save", async function (next) {
  next();
});

/**
 * @typedef Pillar
 */
const PayRelease = mongoose.model(
  "payReleases",
  payReleaseSchema,
  "payReleases"
);

module.exports = PayRelease;
