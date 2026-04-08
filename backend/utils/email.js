const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your-gmail@gmail.com') {
    console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`);
    return { success: true, mock: true };
  }
  try {
    await transporter.sendMail({ from: process.env.FROM_EMAIL, to, subject, html });
    return { success: true };
  } catch (err) {
    console.error('Email error:', err.message);
    return { success: false, error: err.message };
  }
};

const claimStatusEmail = (claimantName, itemTitle, status, adminNote) => `
<!DOCTYPE html><html><body style="font-family:Inter,sans-serif;background:#f8fafc;margin:0;padding:20px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
  <div style="background:linear-gradient(135deg,#1a1a2e,#6366f1);padding:32px;text-align:center">
    <div style="font-size:3rem">🔍</div>
    <h1 style="color:#fff;margin:8px 0 0;font-size:1.5rem;font-weight:800">CampusFinds</h1>
  </div>
  <div style="padding:32px">
    <h2 style="color:#1e293b;margin:0 0 16px">Claim Update</h2>
    <p style="color:#64748b;margin:0 0 20px">Hi <strong>${claimantName}</strong>, here's an update on your claim:</p>
    <div style="background:${status==='approved'?'#d1fae5':status==='rejected'?'#fee2e2':'#fef3c7'};border-radius:12px;padding:20px;margin-bottom:20px">
      <p style="margin:0 0 8px;font-weight:700;color:#1e293b;font-size:1.1rem">📦 ${itemTitle}</p>
      <p style="margin:0;font-size:1.2rem;font-weight:800;color:${status==='approved'?'#065f46':status==='rejected'?'#991b1b':'#92400e'}">
        ${status==='approved'?'✅ Claim Approved':status==='rejected'?'❌ Claim Rejected':'⏳ Under Review'}
      </p>
    </div>
    ${adminNote?`<div style="background:#f8fafc;border-left:4px solid #6366f1;border-radius:8px;padding:16px;margin-bottom:20px"><p style="margin:0;color:#475569;font-size:.9rem"><strong>Note from admin:</strong> ${adminNote}</p></div>`:''}
    <p style="color:#94a3b8;font-size:.82rem;margin:0">Please visit CampusFinds to view full details.</p>
  </div>
  <div style="background:#f8fafc;padding:16px;text-align:center">
    <p style="color:#cbd5e1;font-size:.78rem;margin:0">© 2024 CampusFinds · Chandigarh University</p>
  </div>
</div></body></html>`;

const feedbackResolvedEmail = (name, subject) => `
<!DOCTYPE html><html><body style="font-family:Inter,sans-serif;background:#f8fafc;margin:0;padding:20px">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
  <div style="background:linear-gradient(135deg,#1a1a2e,#10b981);padding:32px;text-align:center">
    <div style="font-size:3rem">✅</div>
    <h1 style="color:#fff;margin:8px 0 0;font-size:1.5rem;font-weight:800">CampusFinds</h1>
  </div>
  <div style="padding:32px">
    <h2 style="color:#1e293b;margin:0 0 16px">Feedback Resolved</h2>
    <p style="color:#64748b">Hi <strong>${name}</strong>, your feedback "<em>${subject}</em>" has been marked as resolved by our team. Thank you for reaching out!</p>
  </div>
</div></body></html>`;

module.exports = { sendEmail, claimStatusEmail, feedbackResolvedEmail };
