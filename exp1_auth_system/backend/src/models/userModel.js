const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: {
      values: ["administrator", "admin", "user"],
      message: "User can be : administrator,admin,user",
    },
    default: "user",
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 20,
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      validator: function (el) {
        return this.password === el;
      },
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    select: false,
    default: Date.now,
  },
});

//encrypting password
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }

    this.password = await bcryptjs.hash(this.password, 8);
    this.passwordConfirm = undefined;

    next();
  } catch (error) {
    next(error);
  }
});

//updating passwordChangedAt field
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) {
    return next();
  }
  this.passwordChangedAt = new Date(Date.now() - 2000); // 2 seconds in the past
  next();
});

userSchema.methods.passwordChangedAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    console.log(jwtTimestamp, changedTimestamp);

    return jwtTimestamp < changedTimestamp;
  }

  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
