const mongoose = require("mongoose");
const validator = require("validator");

const monitorSchema = new mongoose.Schema({
  id: String,
  name: {
    type: String,
    unique: [true, "A device with this name already exist"],
    minLength: [5, "A device name should be more than 5"],
    required: [true, "Please provide a name for this device"],
    trim: true,
  },
  timeout: {
    type: Number,
    min: 10,
    required: [
      true,
      "Please provide a time range for this device to be monitored",
    ],
  },
  alert_email: {
    type: String,
    validate: [validator.isEmail, "Please provide a valid email"],
    required: [true, "Please provide emails to receive alert message!"],
  },
  pause: {
    type: Boolean,
    default: false,
  },
  expiresAt: Date,
});

const Monitor = mongoose.model("Monitor", monitorSchema);

module.exports = Monitor;
