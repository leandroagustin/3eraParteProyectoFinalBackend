const { createTransport } = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const TEST_MAIL = "francisca.moen70@ethereal.email";

const transporter = createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: TEST_MAIL,
    pass: "qT8m4PZQZsYCbp42KR",
  },
});

module.exports = transporter;
