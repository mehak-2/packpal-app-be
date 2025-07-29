# Email Setup Guide

Your email service is currently running in development mode (console logging only). To enable real email sending, you need to configure email credentials.

## Quick Setup Options

### Option 1: SendGrid (Recommended - Free tier available)

1. Sign up for a free SendGrid account at https://sendgrid.com/
2. Go to Settings → API Keys in your SendGrid dashboard
3. Create a new API key with "Mail Send" permissions
4. Copy the API key

Create a `.env` file in the server directory with:
```
SENDGRID_API_KEY=your_sendgrid_api_key_here
```

### Option 2: Gmail SMTP

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: Google Account → Security → App Passwords
3. Use the generated password

Create a `.env` file in the server directory with:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
```

### Option 3: Other SMTP Providers

For other providers like Outlook, Yahoo, or your own email server:

```
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASS=your_password
```

## Complete .env File Example

```
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/packpal

# JWT Secret
JWT_SECRET=your_jwt_secret_here

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Email Configuration (choose one option)
SENDGRID_API_KEY=your_sendgrid_api_key_here

# OR for SMTP:
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your_email@gmail.com
# SMTP_PASS=your_app_password_here

# From Email (fallback)
FROM_EMAIL=noreply@packpal.com
```

## Testing Email Configuration

After setting up your `.env` file:

1. Restart your server
2. Check the console logs - you should see:
   - ✅ Email service configured with SendGrid/SMTP
   - Instead of the current ❌ Missing messages

3. Try sending an invitation to test the email functionality

## Troubleshooting

- **SendGrid errors**: Make sure your API key has "Mail Send" permissions
- **Gmail errors**: Use App Passwords, not your regular password
- **SMTP errors**: Check your firewall settings and ensure the port is open
- **Authentication errors**: Verify your credentials are correct

## Security Notes

- Never commit your `.env` file to version control
- Use environment-specific API keys for production
- Consider using a dedicated email service for production apps 