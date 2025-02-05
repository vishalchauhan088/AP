const User = require("../models/userModel.js");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

function createJwtToken(_id) {
  return jwt.sign({ id: _id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

function sendToken(user, statusCode, res) {
  const token = createJwtToken(user._id);
  const cookieOptions = {
    //keep it in milllisceconds
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),

    httpOnly: true, // can't be accessed and modified by brower
  };
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }

  // let's remove password from the user object
  user.password = undefined;
  res.cookie("jwt", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
}
exports.signUp = catchAsync(async (req, res) => {
  const user = await User.create({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  req.user = user;

  sendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res) => {
  //using username and password to login

  if (!req.body.usernameOrEmail || !req.body.password) {
    return next(new AppError("Please provide username and password", 400));
  }
  const user = await User.findOne({
    $or: [
      { username: req.body.usernameOrEmail },
      { email: req.body.usernameOrEmail },
    ],
  }).select("+password");

  // check if user is present
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  // then check if user password is correct or not
  const isPasswordCorrect = await bcryptjs.compare(
    req.body.password,
    user.password
  );
  if (!isPasswordCorrect) {
    console.log("Error logging in:", user.username);

    return next(new AppError("Wrong password", 401));
  }
  sendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  //now since user has logged in
  //let's check if the token is valid

  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return next(new AppError("Please login first", 401));
  }

  let token = req.headers.authorization.split(" ")[1];

  // Check for token in cookies

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  console.log("user in proctect", user);

  if (!user) {
    return next(new AppError("User not found", 401));
  }
  //let's check if user has changed the password after token was created
  console.log(user.passwordChangedAfter(decoded.iat));
  if (user.passwordChangedAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password. Please login again", 401)
    );
  }

  req.user = user;

  next();
});

exports.restrictTo = (...roles) => {
  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You are not allowed to perform this action", 403)
      );
    }
    next();
  };
};
