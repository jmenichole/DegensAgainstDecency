# Deploying with Integrations

This guide explains how to deploy the Degens Against Decency game arena with TiltCheck and JustTheTip integrations enabled.

## Free Hosting on Vercel

The application is fully compatible with Vercel's free tier, including the integrations.

### Step 1: Deploy to Vercel

1. **Fork/Clone the Repository**
   - Fork this repository to your GitHub account
   - Or clone it locally

2. **Connect to Vercel**
   - Visit [Vercel](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import this repository

3. **Configure Environment Variables**

   In Vercel Dashboard → Settings → Environment Variables, add:

   **Required:**
   ```
   NODE_ENV=production
   SESSION_SECRET=[generate secure random string]
   ```

   **Optional - Discord OAuth:**
   ```
   DISCORD_CLIENT_ID=your_client_id
   DISCORD_CLIENT_SECRET=your_client_secret
   DISCORD_CALLBACK_URL=https://yourdomain.vercel.app/auth/discord/callback
   ```

   **Optional - Discord Bot:**
   ```
   DISCORD_BOT_TOKEN=your_bot_token
   ```

   **Optional - OpenAI:**
   ```
   OPENAI_API_KEY=your_openai_key
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app is now live!

### Step 2: Enable Integrations (Demo Mode)

To enable integrations in demo mode (no external APIs needed):

In Vercel Dashboard → Settings → Environment Variables, add:

```
TILTCHECK_ENABLED=true
JUSTTHETIP_ENABLED=true
```

**That's it!** The integrations will run in demo mode with local detection and mock data.

### Step 3: Enable Integrations (Production Mode)

For production use with real APIs:

1. **Get TiltCheck API Key**
   - Visit [TiltCheck](https://github.com/jmenichole/TiltCheck)
   - Subscribe to a plan
   - Get your API key from dashboard
   - Add to Vercel environment variables:
     ```
     TILTCHECK_ENABLED=true
     TILTCHECK_API_KEY=your_api_key
     TILTCHECK_API_URL=your_api_url
     ```

2. **Setup JustTheTip**
   - Visit [JustTheTip](https://github.com/jmenichole/Justthetip)
   - Deploy your own instance or use hosted API
   - Get bot token
   - Add to Vercel environment variables:
     ```
     JUSTTHETIP_ENABLED=true
     JUSTTHETIP_API_URL=your_api_url
     JUSTTHETIP_BOT_TOKEN=your_bot_token
     ```

3. **Redeploy**
   - In Vercel, go to Deployments
   - Click "Redeploy" on latest deployment
   - Integrations are now live!

## Testing Your Deployment

### Test Integration Health

```bash
curl https://yourdomain.vercel.app/api/integrations/health
```

Expected response:
```json
{
  "tiltCheck": {
    "enabled": true,
    "activePlayers": 0
  },
  "justTheTip": {
    "enabled": true,
    "registeredWallets": 0,
    "tipHistory": 0
  }
}
```

### Test Wallet Registration

```bash
curl -X POST https://yourdomain.vercel.app/api/integrations/justthetip/register-wallet \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","walletAddress":"8pBX4jYxLNmJfQgXWZ9kH3nRvU7QmC2TsD1yA6vE5wFx"}'
```

Expected response in demo mode:
```json
{
  "success": true,
  "walletAddress": "8pBX4jYxLNmJfQgXWZ9kH3nRvU7QmC2TsD1yA6vE5wFx",
  "message": "Wallet registered successfully (demo mode)"
}
```

## Alternative Hosting Platforms

The integrations work on any Node.js hosting platform:

### Railway (Recommended for WebSockets)
- Better WebSocket support than Vercel
- Free tier available
- Deploy from GitHub

### Heroku
- Classic Node.js hosting
- Free tier available (with limitations)
- Good WebSocket support

### DigitalOcean App Platform
- Deploy from GitHub
- $5/month minimum
- Full WebSocket support

### Traditional VPS
- Full control
- Deploy with PM2
- Configure nginx reverse proxy

## Troubleshooting

### Integrations Not Working

1. **Check Environment Variables**
   ```
   # In Vercel, check Settings → Environment Variables
   # Make sure TILTCHECK_ENABLED=true and/or JUSTTHETIP_ENABLED=true
   ```

2. **Check Deployment Logs**
   - Go to Vercel Dashboard → Deployments
   - Click on latest deployment
   - Check "Building" and "Runtime" logs
   - Look for integration initialization messages

3. **Test Health Endpoint**
   ```bash
   curl https://yourdomain.vercel.app/api/integrations/health
   ```
   Should show `"enabled": true` for active integrations

### Demo Mode Not Working

If demo mode isn't working:

1. Check NODE_ENV is not explicitly set to 'production' for demo
2. Make sure API keys are NOT set (or set to 'demo')
3. Check logs for "demo mode" messages

### Production Mode Issues

1. **TiltCheck Errors**
   - Verify API key is correct
   - Check API URL is accessible
   - Review TiltCheck dashboard for quota limits

2. **JustTheTip Errors**
   - Verify bot token is correct
   - Check API URL is accessible
   - Ensure Solana addresses are valid (32-44 base58 chars)

## Environment Variables Reference

### Core Settings
- `NODE_ENV` - Environment (production/development)
- `PORT` - Server port (default: 3000)
- `SESSION_SECRET` - Required for sessions

### TiltCheck Integration
- `TILTCHECK_ENABLED` - Enable TiltCheck (true/false)
- `TILTCHECK_API_KEY` - API key (optional for demo)
- `TILTCHECK_API_URL` - API URL (optional for demo)

### JustTheTip Integration
- `JUSTTHETIP_ENABLED` - Enable JustTheTip (true/false)
- `JUSTTHETIP_API_URL` - API URL (optional for demo)
- `JUSTTHETIP_BOT_TOKEN` - Bot token (optional for demo)

## Performance Considerations

### Vercel Free Tier Limits
- 100GB bandwidth/month
- 100 hours execution time/month
- 12 serverless functions per deployment

### Best Practices
- Enable only integrations you need
- Use demo mode for testing
- Monitor usage in Vercel dashboard
- Consider Railway for production if WebSocket heavy

## Security Notes

1. **Never commit API keys** - Use environment variables only
2. **Use HTTPS** - Vercel provides this automatically
3. **Rotate secrets** - Change SESSION_SECRET regularly
4. **Monitor logs** - Check for suspicious activity
5. **Validate inputs** - Already implemented in integrations

## Support

### Issues
- [GitHub Issues](https://github.com/jmenichole/DegensAgainstDecency/issues)

### Integration Documentation
- [TiltCheck Integration](INTEGRATIONS.md#tiltcheck-integration)
- [JustTheTip Integration](INTEGRATIONS.md#justthetip-integration)

### External Projects
- [TiltCheck Repository](https://github.com/jmenichole/TiltCheck)
- [JustTheTip Repository](https://github.com/jmenichole/Justthetip)

---

**Ready to deploy?** Follow Step 1 above to get started! 🚀
