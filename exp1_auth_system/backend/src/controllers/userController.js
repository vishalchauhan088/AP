const User = require("../models/userModel.js");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getAllUser = catchAsync(async (req, res) => {
  let query = User.find({});

  if (req.query.username) {
    query = query.where("username").regex(new RegExp(req.query.username, "i"));
  }

  const users = await query.select("-password");

  if (!users) {
    return next(new AppError("No user found with that username", 404));
  }
  res.status(200).json({
    status: "success",
    length: users.length,
    data: {
      users,
    },
  });
});

exports.deleteUserByUsername = catchAsync(async (req, res) => {
  await User.deleteOne({ username: req.params.id });
  res.status(200).json({
    status: "success",
    data: null,
  });
});
