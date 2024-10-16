const nodemailer = require('nodemailer');

async function sendTestEmail() {
  // Create a transporter using your Mailtrap configuration
  const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: '504ddc639f68d2', // Replace with your Mailtrap username
      pass: '842cd7010cd166', // Replace with your Mailtrap password
    },
  });

  // Set up email data
  const mailOptions = {
    from: '"Test Sender" <your_email@example.com>', // sender address
    to: 'recipient@example.com', // list of receivers
    subject: 'Hello from Mailtrap', // Subject line
    text: 'This is a test email sent from Mailtrap.', // plain text body
    html: '<b>This is a test email sent from Mailtrap.</b>', // HTML body
  };

  try {
    // Send mail
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Execute the function
sendTestEmail();
