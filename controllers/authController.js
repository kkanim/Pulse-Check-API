const jwt = require("jsonwebtoken");

const User = require("./../model/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/error");

// This function creates and assigns token to authenticated users
function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

// Signup a user on the server
exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role,
  });

  const token = signToken(user._id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      name: user.name,
      role: user.role,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide an email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Please provide a valid email and password", 400));
  }

  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});

// Adding protected routes functionality
exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError(
        "No auth token found for this user. Please login or signup to be assigned with a token",
        401,
      ),
    );
  }

  // This verifies the authenticity of the bearer token
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  console.log(decoded)


  // The decoded is an object {_id, iat: (issuedAt) & exp: (expiresAt)}

  const user = await User.findOne({ _id: decoded.id });

  if (!user) {
    return next(
      new AppError("No user found! Please ensure you are logged in", 400),
    );
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "User changed password after token was issued. Please log in again",
        400,
      ),
    );
  }

  req.user = user;
  next();
});


// This is where authorization happens
exports.restrictedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `You do not have permission to perform this action. This route is only accessible to - ${roles}s`,
          403,
        ),
      );
    }

    next();
  };
};
