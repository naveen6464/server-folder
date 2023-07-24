/** ***************** package Import ******************************************************** */

const mongoose = require("mongoose");

/** ***************** toJson and paginate from plugins folder ******************************************************** */

const { toJSON, paginate } = require("./plugins");

/*  
 pillarSchema  - It is the schema for our pillar module
*/
const pillarSchema = mongoose.Schema(
  {
    _id: {
      type: String,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // this field is the count of project using this pillar
    projectCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

// add plugin that converts mongoose to json
pillarSchema.plugin(toJSON);
pillarSchema.plugin(paginate);

pillarSchema.pre("save", async function (next) {
  next();
});

/**
 * @typedef Pillar
 */
const Pillar = mongoose.model("pillars", pillarSchema);

module.exports = Pillar;
