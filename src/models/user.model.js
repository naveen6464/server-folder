/** ***************** package Import ******************************************************** */

const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

/** ***************** toJson and paginate from plugins folder ******************************************************** */

const { toJSON, paginate } = require("./plugins");

/** ***************** roles from config/roles  ******************************************************** */

/*  
  userSchema  - It is the schema for our user module
*/

const userSchema = mongoose.Schema(
  {
    _id: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
      },
      private: true, // used by the toJSON plugin
    },
    role: {
      type: Array,
      default: ["user"],
      required: true,
    },

    corematicaName: {
      type: String,
      trim: true,
    },

    firstName: {
      type: String,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    mobileNumber: {
      type: String,
    },

    street: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
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
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

// userSchema.index( {corematicaName : 1} , {unqiue : true} )
/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */

userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.find({ email, _id: { $ne: excludeUserId } });
  let checkDuplicate = 0;
  user.forEach((userData) => {
    if (userData.isDeleted === false) {
      return !!user;
    }
    checkDuplicate += 1;
  });
  if (checkDuplicate === user.length) {
    return !user;
  }

  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

/**
 * @typedef User
 */
const User = mongoose.model("users", userSchema);

module.exports = User;
