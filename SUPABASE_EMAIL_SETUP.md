# Supabase Email Configuration Guide

## Issue: Confirmation Emails Not Being Sent

If users are not receiving verification emails after registration, follow these steps to configure Supabase properly.

## Solution: Configure Email Settings in Supabase Dashboard

### Step 1: Check Email Confirmation Settings

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **ReTexValue**
3. Navigate to: **Authentication** → **Settings** → **Email Auth**

### Step 2: Enable Email Confirmation

Make sure the following setting is **ENABLED**:
- ✅ **Enable email confirmations** - Toggle this ON

### Step 3: Configure Email Templates (Optional but Recommended)

1. Go to: **Authentication** → **Email Templates**
2. Customize the **Confirm signup** template:

```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your account:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>

<p>Welcome to ReTexValue - Join the circular economy revolution!</p>
```

### Step 4: Configure SMTP Settings (For Production)

By default, Supabase uses their email service which has rate limits. For production:

1. Go to: **Project Settings** → **Auth** → **SMTP Settings**
2. Enable **Custom SMTP**
3. Configure your SMTP provider (Gmail, SendGrid, AWS SES, etc.):

#### Example: Gmail SMTP Configuration
```
Host: smtp.gmail.com
Port: 587
Username: your-email@gmail.com
Password: your-app-password (not regular password!)
Sender email: your-email@gmail.com
Sender name: ReTexValue
```

**Note**: For Gmail, you need to create an "App Password" in your Google Account settings.

### Step 5: Configure Site URL and Redirect URLs

1. Go to: **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:5174` (for development) or your production URL
3. Add **Redirect URLs**:
   - `http://localhost:5174/login`
   - `http://localhost:5174/**` (wildcard for all routes)
   - Your production URLs

### Step 6: Test Email Configuration

1. Go to: **Authentication** → **Users**
2. Click **"Invite user"**
3. Enter a test email
4. Check if you receive the email

## Quick Fix: Disable Email Confirmation (Development Only)

If you want to skip email verification during development:

1. Go to: **Authentication** → **Settings**
2. Find **"Enable email confirmations"**
3. Toggle it **OFF**

⚠️ **Warning**: This will auto-confirm all users without email verification. Only use in development!

## Troubleshooting

### Problem: Still not receiving emails after enabling

**Check:**
1. Spam/junk folder
2. Email rate limits (Supabase free tier: limited emails per hour)
3. Check Supabase logs: **Logs** → **Auth Logs**
4. Verify email address is valid

### Problem: "Email not authorized" error

**Solution**: In Supabase Auth settings, make sure:
- Email provider is enabled
- No email domain restrictions are set

### Problem: Emails are slow

**Solution**: 
- Use custom SMTP provider
- Upgrade to Supabase Pro plan for better email delivery

## Current Application Behavior

The registration page now:
1. ✅ Shows clear verification instructions
2. ✅ Provides "Resend Email" button
3. ✅ Handles both confirmed and unconfirmed scenarios
4. ✅ Better error messages
5. ✅ Auto-login if email confirmation is disabled

## Email Template Variables

Available in Supabase email templates:
- `{{ .ConfirmationURL }}` - Email verification link
- `{{ .Email }}` - User's email address
- `{{ .Token }}` - Verification token
- `{{ .SiteURL }}` - Your site URL

## Rate Limits

**Supabase Free Tier:**
- 3 signups per hour per IP
- Limited email sends per day

**Solution for Production:**
- Upgrade to Pro plan
- Use custom SMTP provider
- Implement rate limiting on your app

## Next Steps

1. Configure email settings in Supabase Dashboard
2. Test registration with a real email
3. Check email delivery in Supabase logs
4. Set up custom SMTP for production

## Support

If issues persist:
- Check Supabase status: https://status.supabase.com
- Supabase docs: https://supabase.com/docs/guides/auth
- Support: https://supabase.com/dashboard/support
