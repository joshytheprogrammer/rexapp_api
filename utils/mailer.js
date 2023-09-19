"use strict";
const nodemailer = require("nodemailer");

// Set up the transporter using environment variables
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   secure: true,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

const transporter = nodemailer.createTransport({
  host: 'rexapp.ng',
  port: 465,
  secure: true,
  auth: {
    user: 'noreply@rexapp.ng',
    pass: 'A0bau6AM*%PrHj6Df[Jf9pX<y',
  },
});

// Function to send an email
async function sendMail({ to, subject, text, html }) {
  const from = 'noreply@rexapp.ng'

  try {
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from,    // Sender address
      to,      // Recipient(s)
      subject, // Email subject
      text,    // Plain text body
      html,    // HTML body
    });

    console.log("Message sent: %s", info.messageId);
    return info.messageId;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

module.exports = sendMail;
