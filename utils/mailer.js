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
  host: 'mza.studymay.site',
  port: 465,
  secure: true,
  auth: {
    user: 'noreply@mza.studymay.site',
    pass: '0.[dDqc?xg.)vdCQ0J&Y)k87t',
  },
});

// Function to send an email
async function sendMail({ from, to, subject, text, html }) {
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
