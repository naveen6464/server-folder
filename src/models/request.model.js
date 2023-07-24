/** ***************** package Import ******************************************************** */

const mongoose = require("mongoose");

/** ***************** toJson and paginate from plugins folder ******************************************************** */

const { toJSON, paginate } = require("./plugins");

/*  
  RequestSchema  - It is the schema for our Request module
*/

const RequestSchema = mongoose.Schema(
  {
    _id: {
      type: String,
    },
    /* Start of sign_up schema  */
    requestId: {
      type: String,
      trim: true,
    },
    inProject: {
      type: Boolean,
    },
    grantedHours: {
      type: Number,
      trim: true,
    },
    requestedHours: {
      type: Number,
      trim: true,
    },
    usedHours: {
      type: Number,
      trim: true,
    },
    remainingHours: {
      type: Number,
      trim: true,
    },
    // this fields are only used for display
    pendingAmount: {
      type: Number,
      trim: true,
    },
    // this fields are only used for display
    approvedAmount: {
      type: Number,
      trim: true,
    },
    // this fields are only used for display
    paidAmount: {
      type: Number,
      trim: true,
    },
    // this fields are only used for display
    pendingAddHours: {
      type: Number,
      trim: true,
    },
    /* End of sign_up schema  */

    /* Start of payment schema  */
    amountToPay: {
      type: Number,
    },
    requestorEmail: {
      type: String,
    },
    isPaid: {
      type: Boolean,
    },
    hoursToPay: {
      type: String,
    },
    payId: {
      type: String,
      trim: true,
    },
    bodyOfWork: {
      type: String,
      trim: true,
    },
    /* End of payment schema  */

    /* Start of addHours schema  */

    hoursToAdd: {
      type: String,
    },
    /* End of addHours schema  */

    /* These all are the common fields  */
    type: {
      enum: ["sign_up", "payment", "add_hours", "leave"],
      type: String,
    },
    projectId: {
      type: String,
      // ref: "projects",
      trim: true,
    },
    userId: {
      type: String,
      ref: "users",
      trim: true,
    },
    status: {
      // Request
      enum: ["pending", "approved", "rejected"],
      type: String,
      trim: true,
    },
    duration: {
      type: String, // not in payment
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    reasonForRejection: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: String,
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
RequestSchema.plugin(toJSON);
RequestSchema.plugin(paginate);

RequestSchema.pre("save", async function (next) {
  next();
});

const Request = mongoose.model("requests", RequestSchema);

module.exports = Request;
