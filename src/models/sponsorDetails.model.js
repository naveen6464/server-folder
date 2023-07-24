/** ***************** package Import ******************************************************** */

const mongoose = require("mongoose");

/** ***************** toJson and paginate from plugins folder ******************************************************** */

const { toJSON, paginate } = require("./plugins");

/*  
 sponsorDetailsSchema  - It is the schema for our sponsordetails module
*/
const sponsorDetailsSchema = mongoose.Schema(
  {
    _id: {
      type: String,
    },
    projectId: {
      type: String,
      ref: "projects",
      required: true,
    },
    sponsorId: {
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

// add plugin that converts mongoose to json
sponsorDetailsSchema.plugin(toJSON);
sponsorDetailsSchema.plugin(paginate);

sponsorDetailsSchema.pre("save", async function (next) {
  next();
});

/**
 * @typedef SponsorDetails
 */
const SponsorDetails = mongoose.model(
  "sponsorsDetails",
  sponsorDetailsSchema,
  "sponsorsDetails"
);

module.exports = SponsorDetails;
