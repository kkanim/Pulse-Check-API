const device = require("./device");

const stopDevice = device("69a6ec34493ed28e6db784a6");

process.on("SIGINT", () => {
  stopDevice();
  process.exit();
});
