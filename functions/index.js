const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'madhumithapaluri2004@gmail.com',
    pass: 'nlpaxpryberkdhwn',
  },
});

exports.sendMail = functions.https.onCall(async (data, context) => {
  const mailOptions = {
    from: 'madhumithapaluri2004@gmail.com',
    to: 'madhumithapaluri2004@gmail.com',
    subject: 'New Contact Form Submission',
    html: `
      <h2>New Message from Your Website</h2>
      <p><b>Name:</b> ${data.name}</p>
      <p><b>Email:</b> ${data.email}</p>
      <p><b>Phone:</b> ${data.phone}</p>
      <p><b>Event Date:</b> ${data.eventDate}</p>
      <p><b>Service:</b> ${data.serviceType}</p>
      <p><b>Message:</b> ${data.message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email sent successfully!' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: 'Failed to send email.' };
  }
});