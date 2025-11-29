# 📧 Email Setup Guide - Resend

This guide will help you set up automated confirmation emails for the Minka waitlist using Resend.

## 🚀 Quick Setup

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free tier)
3. Verify your email address

### 2. Get Your API Key

1. In the Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Give it a name (e.g., "Minka Waitlist")
4. Copy the API key (you'll only see it once!)

### 3. Verify Your Domain (Optional but Recommended)

For production, you should verify your domain:

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Follow the DNS configuration instructions
4. Once verified, you can use emails like `noreply@yourdomain.com`

**📋 See `DNS_SETUP_RESEND.md` for detailed DNS records and step-by-step instructions.**

### 4. Set Up Environment Variables

Add these to your `.env.local` file:

```env
# Resend Email Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**For development/testing**, you can use Resend's test domain:
```env
RESEND_FROM_EMAIL=onboarding@resend.dev
```

> ⚠️ **Important**: Never commit `.env.local` to Git. It's already in `.gitignore`.

### 5. Test the Setup

1. Start your development server: `npm run dev`
2. Go to the waitlist page and submit an email
3. Check your email inbox for the confirmation message
4. Check the server logs for any email errors

## 📋 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `RESEND_API_KEY` | Your Resend API key | Yes |
| `RESEND_FROM_EMAIL` | The email address to send from | Yes |

## 🔧 Troubleshooting

### Email Not Sending

1. **Check API Key**: Make sure `RESEND_API_KEY` is set correctly
2. **Check From Email**: Ensure `RESEND_FROM_EMAIL` is valid
3. **Check Logs**: Look for error messages in the server console
4. **Resend Dashboard**: Check the Resend dashboard for delivery status

### Common Errors

- **"API key is invalid"**: Double-check your API key in `.env.local`
- **"Domain not verified"**: Use `onboarding@resend.dev` for testing, or verify your domain
- **"Rate limit exceeded"**: Free tier allows 100 emails/day. Upgrade if needed.

## 📝 Email Template

The confirmation email template is located in:
- `src/lib/email/templates.tsx`

You can customize:
- Subject line
- Email content
- Styling and colors
- Branding

## 🚀 Production Deployment

When deploying to production (Vercel, Netlify, etc.):

1. Add environment variables in your hosting platform's dashboard
2. Use a verified domain email address
3. Test email delivery after deployment
4. Monitor email delivery in Resend dashboard

## 📊 Monitoring

- **Resend Dashboard**: View email delivery stats, opens, clicks
- **Server Logs**: Check console for email send confirmations
- **Error Tracking**: Monitor for failed email sends

---

**Need Help?** Check [Resend Documentation](https://resend.com/docs) or contact support.

