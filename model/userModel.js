const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    trim: true,
  },
  email: {
    type: String,
    validate: [validator.isEmail, "Please provide a valid email"],
    required: [true, "Please provide your email"],
    unique: [true, "This email alreay exist"],
  },
  password: {
    type: String,
    minLength: [8, "Passwords should be more than 8 character"],
    required: [true, "Please provide a password"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords do not match",
    },
  },
  role: {
    type: String,
    enum: ["admin", "technician", "engineer", "user"],
    default: "user",
  },
  passwordChangedAt: Date,
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

userSchema.methods.changedPasswordAfter = function (issueAt) {
  if (this.passwordChangedAt) {
    const timestamp = parseInt(this.passwordChangedAt / 1000, 10);

    return issueAt < timestamp;
  }
};

userSchema.methods.correctPassword = async function (cp, up) {
  return await bcrypt.compare(cp, up);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
