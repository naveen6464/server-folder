/** ***************** package Import ******************************************************** */

const mongoose = require("mongoose");

/** ***************** toJson and paginate from plugins folder ******************************************************** */

const { toJSON, paginate } = require("./plugins");

/*  
 locationSchema  - It is the schema for our pillar module
*/
const locationSchema = mongoose.Schema(
  {
    _id: {
      type: String,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

// add plugin that converts mongoose to json
locationSchema.plugin(toJSON);
locationSchema.plugin(paginate);

locationSchema.pre("save", async function (next) {
  next();
});

/**
 * @typedef Pillar
 */
const Location = mongoose.model("locations", locationSchema);

module.exports = Location;
