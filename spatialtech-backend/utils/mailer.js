/* ============================================================
   Email Utility — Nodemailer Configuration
   Sends notification emails when contact form is submitted
   ============================================================ */

const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '587');

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Increase timeouts for slow connections
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });
};

/**
 * Check whether real SMTP credentials are configured
 */
const isEmailConfigured = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) return false;
  if (user === 'your-email@gmail.com') return false;
  if (pass === 'your-app-password') return false;
  return true;
};

/**
 * Send contact form notification email
 */
const sendContactEmail = async ({ name, email, phone, organization, country, service, message }) => {
  // Skip email if credentials not configured
  if (!isEmailConfigured()) {
    console.log('📧 SMTP email not configured — skipping nodemailer notification.');
    console.log('   ➜ Contact from:', name, '(' + email + ')');
    console.log('   ➜ To fix: update EMAIL_USER and EMAIL_PASS in .env with real Gmail + App Password');
    return { sent: false, reason: 'SMTP not configured' };
  }

  try {
    const transporter = createTransporter();

    // Verify connection before sending
    await transporter.verify();
    console.log('📧 SMTP connection verified');

    // Email to admin
    const adminMail = {
      from: `"Spatial Heights Website" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      replyTo: email,
      subject: `New Contact: ${name} — ${service || 'General Inquiry'}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
          <div style="background: #010138; padding: 24px 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #00FF66; margin: 0; font-size: 20px;">New Contact Form Submission</h1>
            <p style="color: #83FFFF; margin: 8px 0 0; font-size: 14px;">Spatial Heights Technologies Website</p>
          </div>
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e9ecef;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; font-weight: 600; color: #333; width: 130px;">Name:</td>
                <td style="padding: 10px 0; color: #555;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-weight: 600; color: #333;">Email:</td>
                <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #0061FF;">${email}</a></td>
              </tr>
              ${phone ? `<tr>
                <td style="padding: 10px 0; font-weight: 600; color: #333;">Phone:</td>
                <td style="padding: 10px 0; color: #555;">${phone}</td>
              </tr>` : ''}
              ${organization ? `<tr>
                <td style="padding: 10px 0; font-weight: 600; color: #333;">Organization:</td>
                <td style="padding: 10px 0; color: #555;">${organization}</td>
              </tr>` : ''}
              ${country ? `<tr>
                <td style="padding: 10px 0; font-weight: 600; color: #333;">Country:</td>
                <td style="padding: 10px 0; color: #555;">${country}</td>
              </tr>` : ''}
              ${service ? `<tr>
                <td style="padding: 10px 0; font-weight: 600; color: #333;">Service:</td>
                <td style="padding: 10px 0; color: #555;">${service}</td>
              </tr>` : ''}
            </table>
            <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #0061FF;">
              <h3 style="margin: 0 0 10px; color: #333; font-size: 14px;">Message:</h3>
              <p style="margin: 0; color: #555; line-height: 1.7; white-space: pre-wrap;">${message}</p>
            </div>
            <p style="margin-top: 24px; font-size: 12px; color: #999;">
              Received at ${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}
            </p>
          </div>
        </div>
      `
    };

    // Auto-reply to sender
    const autoReply = {
      from: `"Spatial Heights Technologies" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thank you for contacting Spatial Heights Technologies',
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
          <div style="background: #010138; padding: 24px 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #00FF66; margin: 0; font-size: 22px;">Spatial Heights Technologies</h1>
            <p style="color: #83FFFF; margin: 8px 0 0; font-size: 13px;">Precision Geospatial Intelligence</p>
          </div>
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e9ecef;">
            <h2 style="color: #010138; font-size: 18px; margin: 0 0 16px;">Hello ${name},</h2>
            <p style="color: #555; line-height: 1.8; margin: 0 0 16px;">
              Thank you for reaching out to Spatial Heights Technologies. We have received your message 
              and our team will review it shortly.
            </p>
            <p style="color: #555; line-height: 1.8; margin: 0 0 16px;">
              We typically respond within 24 business hours. If your inquiry is urgent, please don't 
              hesitate to follow up.
            </p>
            <p style="color: #555; line-height: 1.8; margin: 0 0 24px;">
              Best regards,<br>
              <strong>The Spatial Heights Technologies Team</strong><br>
              Abuja, Nigeria
            </p>
            <div style="border-top: 1px solid #e9ecef; padding-top: 16px; text-align: center;">
              <p style="font-size: 12px; color: #999; margin: 0;">
                <a href="mailto:info@spatialheightstech.com" style="color: #0061FF;">info@spatialheightstech.com</a>
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(adminMail);
    console.log('📧 Admin notification sent to:', adminMail.to);

    // Try auto-reply (non-critical)
    try {
      await transporter.sendMail(autoReply);
      console.log('📧 Auto-reply sent to:', email);
    } catch (replyErr) {
      console.error('⚠️ Auto-reply failed (non-critical):', replyErr.message);
    }

    return { sent: true };

  } catch (error) {
    console.error('❌ SMTP email failed:', error.message);
    return { sent: false, reason: error.message };
  }
};

module.exports = { sendContactEmail, isEmailConfigured };
