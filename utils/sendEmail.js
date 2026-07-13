const nodemailer = require("nodemailer");

const sendEmail = async (mailOptions) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const options = {
    from: "CritMon Servers Inc.",
    to: mailOptions.to,
    subject: mailOptions.subject,
    text: mailOptions.message,
  };

  await transporter.sendMail(options);
};

module.exports = sendEmail;
