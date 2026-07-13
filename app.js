const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");

// Importing our routers
const monitorRouter = require("./routes/monitorRoutes");
const userRouter = require("./routes/userRoutes");

// Import our error controller
const errorController = require("./controllers/errorController");

// Import our app error class
const AppError = require("./utils/error");

// This creates our express application
const app = express();

// Add security headers
app.use(helmet());

// Development logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// body parser
app.use(express.json({ limit: "10kb" }));

// Mount routes on our application
app.use("/api/v1/monitors", monitorRouter);
app.use("/api/v1/users", userRouter);

// This handle all routes not defined in our app
app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler middleware
app.use(errorController);

module.exports = app;
