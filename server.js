const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Handling uncaught exceptions -> Sync Errors
process.on("uncaughtException", (err) => {
  console.log(`UNHANDLED REJECTION: ${err.name} : ${err.message}`);
  console.log("Shutting down app...");
  process.exit();
});

dotenv.config({ path: "./local.env" });

const app = require("./app");

const DB = process.env.MONGO_URI.replace(
  "<db_password>",
  process.env.DB_PASSWORD,
);

mongoose.connect(DB).then(() => {
  console.log(`Database connected successfully`);
});

const port = process.env.PORT || 3000;

// Create server
const server = app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

// handle all unhandled rejected promises -> Async Errors
process.on("unhandledRejection", (err) => {
  console.log(`UNHANDLED REJECTION: ${err.name} : ${err.message}`);

  server.close(() => {
    console.log("Shutting down server....");
    process.exit();
  });
});
