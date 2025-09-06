// mailService.js
const nodemailer = require("nodemailer");

// create reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // you can use "Outlook", "Yahoo", SMTP, etc.
  auth: {
    user: "your_email@gmail.com",    // your email
    pass: "your_app_password"        // app password (not your normal login)
  }
});

async function sendMail(to, subject, text) {
  try {
    const info = await transporter.sendMail({
      from: '"Work System" <your_email@gmail.com>', 
      to: to,
      subject: subject,
      text: text
    });
    console.log("✅ Email Sent:", info.messageId);
  } catch (error) {
    console.error("❌ Email Error:", error.message);
  }
}

module.exports = sendMail;


const sendMail = require("./mailService");

async function doWork() {
  console.log("⚙️ Work started...");

  setTimeout(async () => {
    console.log("✅ Work completed!");

    await sendMail(
      "receiver_email@example.com",
      "Work Completed ✔",
      "Hello, your work has been successfully completed!"
    );
  }, 3000);
}

doWork();