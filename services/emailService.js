import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  initializeTransporter() {
    if (this.initialized) return;

    
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const sendgridApiKey = process.env.SENDGRID_API_KEY;

    console.log('🔍 Email configuration check:');
    console.log('   SendGrid API Key:', sendgridApiKey ? '✅ Present' : '❌ Missing');
    console.log('   SMTP Host:', smtpHost ? '✅ Present' : '❌ Missing');
    console.log('   SMTP User:', smtpUser ? '✅ Present' : '❌ Missing');

    if (sendgridApiKey && sendgridApiKey.trim()) {
      try {
        this.transporter = nodemailer.createTransport({
          service: 'SendGrid',
          auth: {
            user: 'apikey',
            pass: sendgridApiKey.trim()
          }
        });
        console.log('✅ Email service configured with SendGrid');
        this.initialized = true;
        return;
      } catch (error) {
        console.error('❌ Failed to configure SendGrid:', error.message);
      }
    }

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      try {
        this.transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort),
          secure: smtpPort === '465',
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });
        console.log('✅ Email service configured with SMTP');
        this.initialized = true;
        return;
      } catch (error) {
        console.error('❌ Failed to configure SMTP:', error.message);
      }
    }

    console.log('⚠️  Email service running in development mode (console logging only)');
    console.log('   To enable real emails, set SENDGRID_API_KEY or SMTP credentials in .env');
    this.initialized = true;
  }

  async sendInvitationEmail(invitation, trip, inviter, invitee) {
    if (!this.initialized) {
      this.initializeTransporter();
    }
    
    const acceptUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/invitations/${invitation._id}/accept`;
    const declineUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/invitations/${invitation._id}/decline`;
    
    const emailContent = this.generateInvitationEmail(invitation, trip, inviter, acceptUrl, declineUrl);
    
    try {
      if (this.transporter) {
        // Send real email
        const mailOptions = {
          from: process.env.SMTP_USER || process.env.FROM_EMAIL || 'noreply@packpal.com',
          to: invitee.email,
          subject: `You're invited to join a trip to ${trip.destination}!`,
          html: emailContent
        };

        const result = await this.transporter.sendMail(mailOptions);
        console.log('✅ Invitation email sent successfully:', result.messageId);
        return true;
      } else {
        // Development mode - log to console
        console.log('=== INVITATION EMAIL (Development Mode) ===');
        console.log(`To: ${invitee.email}`);
        console.log(`Subject: You're invited to join a trip to ${trip.destination}!`);
        console.log('Content:', emailContent);
        console.log('Accept URL:', acceptUrl);
        console.log('Decline URL:', declineUrl);
        console.log('==========================================');
        return true;
      }
    } catch (error) {
      console.error('Error sending invitation email:', error);
      return false;
    }
  }

  generateInvitationEmail(invitation, trip, inviter, acceptUrl, declineUrl) {
    const startDate = new Date(trip.startDate).toLocaleDateString();
    const endDate = new Date(trip.endDate).toLocaleDateString();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Trip Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; margin: 10px; text-decoration: none; border-radius: 6px; font-weight: bold; }
          .accept { background: #10B981; color: white; }
          .decline { background: #EF4444; color: white; }
          .trip-details { background: white; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 You're Invited!</h1>
          </div>
          <div class="content">
            <p>Hi there!</p>
            <p><strong>${inviter.name}</strong> has invited you to join their trip to <strong>${trip.destination}, ${trip.country}</strong>!</p>
            
            <div class="trip-details">
              <h3>Trip Details:</h3>
              <p><strong>Destination:</strong> ${trip.destination}, ${trip.country}</p>
              <p><strong>Dates:</strong> ${startDate} - ${endDate}</p>
              <p><strong>Invited by:</strong> ${inviter.name} (${inviter.email})</p>
            </div>
            
            <p>Click the buttons below to accept or decline this invitation:</p>
            
            <div style="text-align: center;">
              <a href="${acceptUrl}" class="button accept">✅ Accept Invitation</a>
              <a href="${declineUrl}" class="button decline">❌ Decline Invitation</a>
            </div>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              This invitation expires on ${new Date(invitation.expiresAt).toLocaleDateString()}. 
              If you have any questions, please contact ${inviter.name} directly.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendInvitationAcceptedEmail(invitation, trip, inviter, invitee) {
    if (!this.initialized) {
      this.initializeTransporter();
    }
    
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invitation Accepted</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Invitation Accepted!</h1>
          </div>
          <div class="content">
            <p>Great news, <strong>${inviter.name}</strong>!</p>
            <p><strong>${invitee.name}</strong> has accepted your invitation to join the trip to <strong>${trip.destination}, ${trip.country}</strong>.</p>
            <p>You can now collaborate on trip planning together!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      if (this.transporter) {
        // Send real email
        const mailOptions = {
          from: process.env.SMTP_USER || process.env.FROM_EMAIL || 'noreply@packpal.com',
          to: inviter.email,
          subject: `${invitee.name} accepted your trip invitation!`,
          html: emailContent
        };

        const result = await this.transporter.sendMail(mailOptions);
        console.log('✅ Acceptance email sent successfully:', result.messageId);
        return true;
      } else {
        // Development mode - log to console
        console.log('=== ACCEPTANCE EMAIL (Development Mode) ===');
        console.log(`To: ${inviter.email}`);
        console.log(`Subject: ${invitee.name} accepted your trip invitation!`);
        console.log('Content:', emailContent);
        console.log('==========================================');
        return true;
      }
    } catch (error) {
      console.error('Error sending acceptance email:', error);
      return false;
    }
  }

  async sendInvitationDeclinedEmail(invitation, trip, inviter, invitee) {
    if (!this.initialized) {
      this.initializeTransporter();
    }
    
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invitation Declined</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Invitation Declined</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${inviter.name}</strong>,</p>
            <p><strong>${invitee.name}</strong> has declined your invitation to join the trip to <strong>${trip.destination}, ${trip.country}</strong>.</p>
            <p>Don't worry, you can still enjoy your trip and invite other friends!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      if (this.transporter) {
        // Send real email
        const mailOptions = {
          from: process.env.SMTP_USER || process.env.FROM_EMAIL || 'noreply@packpal.com',
          to: inviter.email,
          subject: `${invitee.name} declined your trip invitation`,
          html: emailContent
        };

        const result = await this.transporter.sendMail(mailOptions);
        console.log('✅ Decline email sent successfully:', result.messageId);
        return true;
      } else {
        // Development mode - log to console
        console.log('=== DECLINE EMAIL (Development Mode) ===');
        console.log(`To: ${inviter.email}`);
        console.log(`Subject: ${invitee.name} declined your trip invitation`);
        console.log('Content:', emailContent);
        console.log('==========================================');
        return true;
      }
    } catch (error) {
      console.error('Error sending decline email:', error);
      return false;
    }
  }

  async sendEmail({ to, subject, template, data }) {
    if (!this.initialized) {
      this.initializeTransporter();
    }

    let emailContent = '';
    
    switch (template) {
      case 'notification':
        emailContent = this.generateNotificationEmail(data);
        break;
      case 'collaboration-invite':
        emailContent = this.generateCollaborationInviteEmail(data);
        break;
      default:
        emailContent = `<p>${data.message || 'No content provided'}</p>`;
    }

    try {
      if (this.transporter) {
        const mailOptions = {
          from: process.env.SMTP_USER || process.env.FROM_EMAIL || 'noreply@packpal.com',
          to,
          subject,
          html: emailContent
        };

        const result = await this.transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', result.messageId);
        return true;
      } else {
        console.log('=== EMAIL (Development Mode) ===');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log('Content:', emailContent);
        console.log('================================');
        return true;
      }
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  generateNotificationEmail(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${data.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${data.title}</h1>
          </div>
          <div class="content">
            <p>${data.message}</p>
            ${data.tripDestination ? `<p><strong>Trip:</strong> ${data.tripDestination}</p>` : ''}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateCollaborationInviteEmail(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Collaboration Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🤝 Collaboration Invitation</h1>
          </div>
          <div class="content">
            <p>Hi there!</p>
            <p><strong>${data.inviterName}</strong> has invited you to collaborate on a trip to <strong>${data.tripDestination}, ${data.tripCountry}</strong> as a <strong>${data.role}</strong>.</p>
            <p>You'll be able to help plan and organize this trip together!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

const emailServiceInstance = new EmailService();

export default emailServiceInstance;

export const sendEmail = (options) => {
  return emailServiceInstance.sendEmail(options);
}; 