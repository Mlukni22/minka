# 🔍 Email Troubleshooting Guide

If you're not receiving confirmation emails, follow these steps:

## Step 1: Check Environment Variables

Make sure you have a `.env.local` file in the root directory with:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**To check:**
1. Open your project root folder
2. Look for `.env.local` file
3. If it doesn't exist, create it
4. Add the variables above with your actual Resend API key

## Step 2: Check Server Console

When you submit an email on the waitlist:

1. Look at your terminal/console where `npm run dev` is running
2. You should see one of these messages:
   - ✅ `[waitlist] Confirmation email sent successfully to: your@email.com`
   - ❌ `[waitlist] Failed to send confirmation email...`
   - ⚠️ `EMAIL CONFIGURATION MISSING` (big warning box)

## Step 3: Test Email Endpoint

You can test the email configuration directly:

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com"}'
```

**Using browser/Postman:**
- URL: `http://localhost:3000/api/test-email`
- Method: POST
- Body (JSON):
```json
{
  "email": "your@email.com"
}
```

This will tell you:
- If environment variables are set
- If the email was sent successfully
- Any error messages

## Step 4: Verify Resend Setup

1. **Check Resend Dashboard:**
   - Go to [resend.com](https://resend.com) and log in
   - Go to **Logs** or **Emails** section
   - See if emails are being sent

2. **Check API Key:**
   - Make sure your API key starts with `re_`
   - Make sure it's the full key (not truncated)
   - Try creating a new API key if unsure

3. **Check From Email:**
   - For testing: Use `onboarding@resend.dev`
   - For production: Use a verified domain email

## Step 5: Common Issues

### Issue: "Email service not configured"
**Solution:** Add `RESEND_API_KEY` and `RESEND_FROM_EMAIL` to `.env.local`

### Issue: "Invalid API key"
**Solution:** 
- Check that your API key is correct
- Make sure it starts with `re_`
- Try creating a new API key in Resend dashboard

### Issue: "Domain not verified"
**Solution:** 
- For testing, use `onboarding@resend.dev`
- For production, verify your domain in Resend dashboard

### Issue: Emails sent but not received
**Solutions:**
- Check spam/junk folder
- Check Resend dashboard logs for delivery status
- Try a different email address
- Check if your email provider is blocking Resend

### Issue: Server not restarting after .env.local changes
**Solution:**
- Stop the dev server (Ctrl+C)
- Restart it: `npm run dev`
- Environment variables are only loaded on server start

## Step 6: Get Help

If none of the above works:

1. **Check the full error message** in your server console
2. **Check Resend dashboard** for delivery logs
3. **Verify your Resend account** is active and not suspended
4. **Check your email** (including spam folder)

## Quick Checklist

- [ ] `.env.local` file exists in project root
- [ ] `RESEND_API_KEY` is set in `.env.local`
- [ ] `RESEND_FROM_EMAIL` is set in `.env.local`
- [ ] Dev server was restarted after adding env variables
- [ ] Resend API key is valid (check in Resend dashboard)
- [ ] Test endpoint shows success
- [ ] Checked spam folder
- [ ] Checked Resend dashboard logs

---

**Still having issues?** Check the server console for the exact error message and share it.

