/** ***************** package Import ******************************************************** */

const mongoose = require("mongoose");

/** ***************** toJson and paginate from plugins folder ******************************************************** */

const { toJSON, paginate } = require("./plugins");

/*  
 projectSchema  - It is the schema for our project module
*/

const projectSchema = mongoose.Schema(
  {
    _id: {
      type: String,
    },
    pillarId: {
      type: [String],
    },
    goalId: {
      type: [String],
    },
    pendingServicesCount: {
      type: Number,
      default: 0,
    },
    pendingPaymentsCount: {
      type: Number,
      default: 0,
    },
    pendingAddHoursCount: {
      type: Number,
      default: 0,
    },
    approvedPaymentsCount: {
      type: Number,
      default: 0,
    },
    unPaidStatusCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["notStarted", "inProgress", "completed", "closing", "closed"],
      required: true,
      default: "notStarted",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Project", "Committee"],
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    levelOfEffort: {
      type: String,
      enum: ["0", "1", "2", "3"],
      required: true,
      trim: true,
    },
    rateOfPay: {
      type: Number,
      required: true,
      trim: true,
    },
    allocatedFund: {
      type: Number,
      default: 0,
      trim: true,
    },
    usedAmount: {
      type: Number,
      default: 0,
    },

    // this fields are only used for display
    resourceData: {
      type: Array,
    },
    // this fields are only used for display
    sponsorData: {
      type: Array,
    },
    // this fields are only used for display
    pendingService: {
      type: Array,
    },
    // this fields are only used for display
    pendingPayment: {
      type: Array,
    },
    daysToClose: {
      type: Number,
      default: 0,
    },

    location: {
      type: String,
      trim: true,
      ref: "locations",
    },
    isClosed: {
      type: Boolean,
      default: false,
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
projectSchema.plugin(toJSON);
projectSchema.plugin(paginate);
projectSchema.index({
  title: "text",
  description: "text",
});

projectSchema.pre("save", async function (next) {
  next();
});

/**
 * @typedef Pillar
 */
const Project = mongoose.model("projects", projectSchema);

module.exports = Project;
