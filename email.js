const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

async function sendVerificationEmail(user, token) {
  const transporter = nodemailer.createTransport({
    // Set up your email service configuration
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: user.email,
    subject: "Email Confirmation",
    text: `Please click the following link to confirm your email: ${process.env.BASE_URL}/api/3aB7k9R2xT5yP1w8/confirm-email/${token}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(`Email sending error: ${error}`);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
}

module.exports = {
  sendVerificationEmail,
};
