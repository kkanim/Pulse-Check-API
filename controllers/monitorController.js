const Monitor = require("../model/monitorModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("./../utils/error");
const sendEmail = require("../utils/sendEmail");

const timers = {}; 

async function createTimer(monitor) {
  const id = monitor._id.toString();

  if (timers[id]) {
    clearTimeout(timers[id]);
  }

  if (monitor.pause) {
    await monitor.save(); 
    return;
  }

  const delay = monitor.timeout * 1000 + 1000;

  timers[id] = setTimeout(async () => {
    console.log({
      ALERT: `Device - ${monitor.name} is down`,
      OccuredAt: new Date().toISOString(),
      EmailSentTo: `${monitor.alert_email}`,
    });

    sendEmail({
      to: monitor.alert_email,
      subject: `Device "${monitor.name}" is down`,
      message: `"${monitor.name}" - Connection lost!`,
    });
    
    delete timers[id]; 
  }, delay);

  monitor.expiresAt = new Date(Date.now() + delay);
  await monitor.save(); 
}

exports.registerMonitor = catchAsync(async (req, res, next) => {
  const { name, timeout, alert_email, id } = req.body;

  let monitor = await Monitor.create({
    id,
    name,
    timeout,
    alert_email,
  });

  createTimer(monitor);

  res.status(201).json({
    status: "success",
    data: {
      monitor,
    },
  });
});

exports.sendHeartbeat = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  let monitor = await Monitor.findOne({ _id: id });

  if (!monitor) {
    return next(new AppError("No monitor was found with this id", 404));
  }

  monitor.pause = false;
  monitor.expiresAt = undefined;
  createTimer(monitor);

  res.status(200).json({
    status: "success",
    message: "Timer reset successful",
  });
});

exports.pauseMonitor = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  let monitor = await Monitor.findOne({ _id: id });


  if (!monitor) {
    return next(new AppError("No monitor was found with this id", 404));
  }

  monitor.pause = true;
  createTimer(monitor)
  await monitor.save();

  res.status(200).json({
    status: "paused",
    message: "A technician paused this monitor",
  });
});

exports.restartMonitor = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  let monitor = await Monitor.findOne({ _id: id });

  if (!monitor) {
    return next(new AppError("No monitor was found with this id", 404));
  }

  monitor.pause = false;
  createTimer(monitor);

  res.status(200).json({
    status: "success",
    message: "Monitor started successfully",
    data: {
      monitor,
    },
  });
});

exports.getAllMonitors = catchAsync(async (req, res, next) => {
  const monitors = await Monitor.find();

  res.status(200).json({
    status: "success",
    data: {
      monitors,
    },
  });
});
