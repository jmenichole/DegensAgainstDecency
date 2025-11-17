# Vercel Deployment Guide

This guide explains how to deploy Degens Against Decency to Vercel and properly configure environment variables for **Production** deployment.

## ⚠️ Important: Production vs Preview Deployments

**Vercel creates two types of deployments:**

1. **Production Deployment** 
   - URL: `https://your-app.vercel.app` (your main domain)
   - Triggered by: Commits to main/master branch (or configured production branch)
   - Label: Shows "Production" in Deployments tab
   - **This is your live site that users should visit**

2. **Preview Deployment**
   - URL: `https://your-app-git-branchname-team.vercel.app` (includes branch name)
   - Triggered by: Commits to any non-production branch or pull requests
   - Label: Shows branch name in Deployments tab
   - **Used for testing before merging to production**

**Critical**: When configuring environment variables, you must enable them for **Production** environment, not just Preview! See instructions below.

## Quick Start

### 1. Prerequisites
- GitHub account with this repository forked/cloned
- Vercel account (free tier is sufficient)
- Environment variable values ready (see below)

### 2. Initial Deployment

1. **Connect Repository to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Select "Import Git Repository"
   - Choose your forked repository
   - Click "Import"

2. **Configure Build Settings**
   - Vercel will auto-detect the settings from `vercel.json`
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run vercel-build` (auto-detected)
   - Output Directory: Leave empty (Node.js app)
   - Install Command: `npm install` (auto-detected)

3. **Deploy**
   - Click "Deploy" to create your first deployment
   - This will create a basic deployment (may show old landing page if env vars not set)

### 3. Configure Environment Variables

After initial deployment, configure environment variables in Vercel:

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following environment variables:

#### Required Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Sets Node.js environment to production mode |
| `SESSION_SECRET` | Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | Secure session encryption key |

#### Discord OAuth (Optional - Required for Discord Login)

| Variable | Value | Description |
|----------|-------|-------------|
| `DISCORD_CLIENT_ID` | Your Discord Application Client ID | From Discord Developer Portal |
| `DISCORD_CLIENT_SECRET` | Your Discord Application Client Secret | From Discord Developer Portal |
| `DISCORD_CALLBACK_URL` | `https://your-app.vercel.app/auth/discord/callback` | Replace with your actual Vercel domain |

#### Discord Bot Integration (Optional)

| Variable | Value | Description |
|----------|-------|-------------|
| `DISCORD_BOT_TOKEN` | Your Discord Bot Token | For Discord server slash commands |

#### AI Card Generation (Optional)

| Variable | Value | Description |
|----------|-------|-------------|
| `OPENAI_API_KEY` | Your OpenAI API Key | For AI-generated cards (app has fallback) |
| `CARD_GENERATOR_URL` | `https://degenscardbot.vercel.app/api/generate` | Custom card generator API (optional) |

#### Vercel AI Gateway (Optional - Recommended for Production)

**NEW**: Multi-provider AI support with automatic failover and cost tracking. See [VERCEL_AI_GATEWAY.md](VERCEL_AI_GATEWAY.md) for details.

| Variable | Value | Description |
|----------|-------|-------------|
| `USE_AI_GATEWAY` | `true` or `false` | Enable AI Gateway for multi-provider support |
| `AI_GATEWAY_URL` | `https://gateway.ai.cloudflare.com/v1` | AI Gateway endpoint URL |
| `ANTHROPIC_API_KEY` | Your Anthropic API Key | For Claude models (optional) |
| `GOOGLE_AI_KEY` | Your Google AI API Key | For Gemini models (optional) |
| `XAI_API_KEY` | Your xAI API Key | For Grok models (optional) |
| `AI_GATEWAY_DEFAULT_PROVIDER` | `openai` | Primary AI provider to use |
| `AI_GATEWAY_DEFAULT_MODEL` | `gpt-3.5-turbo` | Primary model to use |
| `AI_GATEWAY_FALLBACK_ENABLED` | `true` | Enable automatic provider fallback |
| `AI_GATEWAY_COST_LIMIT_DAILY` | `10.00` | Daily cost limit in USD |
| `AI_GATEWAY_COST_LIMIT_REQUEST` | `0.10` | Per-request cost limit in USD |

**Benefits of AI Gateway:**
- 🔄 Automatic failover if one provider is down
- 💰 Real-time cost tracking and limits
- ⚡ Load balancing across multiple providers
- 📊 Usage analytics at `/api/ai-gateway/stats`
- 🚀 No vendor lock-in - switch providers anytime

#### TiltCheck Integration (Optional)

| Variable | Value | Description |
|----------|-------|-------------|
| `TILTCHECK_ENABLED` | `true` or `false` | Enable behavior monitoring |
| `TILTCHECK_API_KEY` | Your TiltCheck API Key | Leave empty for demo mode |
| `TILTCHECK_API_URL` | `https://api.tiltcheck.it.com` | Leave empty for demo mode |

#### JustTheTip Integration (Optional)

| Variable | Value | Description |
|----------|-------|-------------|
| `JUSTTHETIP_ENABLED` | `true` or `false` | Enable crypto tipping |
| `JUSTTHETIP_API_URL` | Your JustTheTip API URL | Leave empty for demo mode |
| `JUSTTHETIP_BOT_TOKEN` | Your JustTheTip Bot Token | Leave empty for demo mode |

### 4. Apply Environment Variables to Production

**CRITICAL**: When adding environment variables, you must specifically enable them for the **Production** environment:

1. When adding each environment variable in Vercel Dashboard:
   - ✅ **Check "Production"** - This is REQUIRED for your live site
   - ⬜ Preview (optional - for testing pull requests)
   - ⬜ Development (optional - can use local `.env` instead)

2. **Common Mistake**: Only enabling Preview environment
   - If you only enable Preview, your production deployment will NOT have the environment variables
   - This causes the app to show the old landing page or fail to work properly
   - **Always ensure Production is checked** for variables you want in your live site

### 5. Promote to Production

After adding environment variables to Production:

**Option A: Redeploy Production (Recommended)**
1. Go to **Deployments** tab
2. Find the deployment with "Production" label
3. Click "..." (three dots) on that deployment
4. Select "Redeploy"
5. Ensure it deploys to Production (not Preview)

**Option B: Promote from Git Branch**
1. Ensure your changes are merged to your main/master branch
2. Vercel will automatically deploy the main branch to Production
3. If using a different branch, configure it in Settings → Git

**Option C: Manual Production Deployment**
1. Go to **Settings** → **Git**
2. Verify your Production Branch is set (usually `main` or `master`)
3. Push to that branch to trigger a production deployment
4. Check that the deployment shows "Production" label (not "Preview")

### 6. Verify Production Deployment

After deployment:
1. Check the **Deployments** tab
2. Look for the deployment with **"Production"** label
3. Click on it and verify:
   - Status: "Ready"
   - Environment: "Production"
   - Domain shows your production URL
4. Visit your production URL to confirm the app works correctly

## Important Notes

### GitHub Secrets vs. Vercel Environment Variables

**Important:** GitHub Secrets are NOT the same as Vercel Environment Variables:

- **GitHub Secrets**: Used by GitHub Actions workflows (`.github/workflows/*.yml`)
- **Vercel Environment Variables**: Used by Vercel deployments (configured in Vercel Dashboard)

**You must configure environment variables separately in Vercel Dashboard** even if you have GitHub Secrets set up. They are independent systems.

### Vercel Limitations

- **WebSocket Support**: Limited on Vercel's serverless functions
  - Real-time features may have reduced performance
  - Consider Railway or traditional VPS for heavy WebSocket usage
- **Cold Starts**: Serverless functions may have startup delays
- **Free Tier Limits**: 
  - 100GB bandwidth/month
  - 100 hours execution time/month
  - May need to upgrade for production use

### Security Best Practices

1. **Never commit secrets to git**
   - Use Vercel Dashboard for all sensitive values
   - Keep `.env` in `.gitignore` (already configured)

2. **Generate secure SESSION_SECRET**
   ```bash
   # Run this locally to generate:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Update Discord OAuth Callback URL**
   - Must match your Vercel domain exactly
   - Format: `https://your-app-name.vercel.app/auth/discord/callback`
   - Update in both Vercel env vars AND Discord Developer Portal

4. **Use Production API Keys**
   - Don't use test/development keys in production
   - Monitor API usage and costs

## Troubleshooting

### Issue: Deployed to Preview Instead of Production

**Cause**: Vercel automatically creates Preview deployments for non-main branches, and you might be viewing the Preview URL instead of the Production URL.

**Solutions**:
1. **Check which URL you're visiting**:
   - Production URL: `https://your-app.vercel.app` (your primary domain)
   - Preview URL: `https://your-app-git-branchname-yourteam.vercel.app` (includes branch name)
   
2. **Ensure environment variables are enabled for Production**:
   - Go to Settings → Environment Variables
   - For each variable, verify "Production" is checked
   - If not, edit the variable and enable Production
   - Redeploy after making changes

3. **Force a Production deployment**:
   - Merge your changes to the main/master branch
   - Or go to Settings → Git and set your Production Branch
   - Push to that branch to trigger production deployment
   - Verify the deployment has "Production" label in Deployments tab

4. **Promote a Preview deployment to Production**:
   - Go to Deployments tab
   - Find the working Preview deployment
   - Click "..." → "Promote to Production"

### Issue: Old Landing Page Still Shows

**Cause**: Environment variables not configured for Production or deployment not redeployed after adding them.

**Solution**:
1. Verify all required environment variables are set in Vercel Dashboard
2. Redeploy the application from Deployments tab
3. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
4. Check deployment logs for errors: Deployments → Click deployment → View Function Logs

### Issue: Discord Login Doesn't Work

**Cause**: Discord OAuth not configured or callback URL mismatch.

**Solutions**:
1. Verify `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` are set
2. Check `DISCORD_CALLBACK_URL` matches your Vercel domain
3. Update redirect URL in Discord Developer Portal:
   - Go to https://discord.com/developers/applications
   - Select your application
   - OAuth2 → Redirects
   - Add: `https://your-app.vercel.app/auth/discord/callback`
4. **Alternative**: Use guest mode by going to `/arena` directly (no login required)

### Issue: "Session secret is required" Error

**Cause**: `SESSION_SECRET` not set in Vercel environment variables.

**Solution**:
1. Generate a secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Add as environment variable in Vercel Dashboard
3. Redeploy

### Issue: WebSocket Connection Failures

**Cause**: Vercel has limited WebSocket support on serverless functions.

**Solutions**:
1. Use polling as fallback (Socket.io does this automatically)
2. For better WebSocket support, consider:
   - Railway: Better WebSocket support, free tier available
   - Traditional VPS: Full WebSocket support, requires manual setup
   - See `DEPLOYMENT_RAILWAY.md` for Railway setup

### Issue: App Works Locally But Not on Vercel

**Cause**: Environment variables in local `.env` not added to Vercel.

**Solution**:
1. Check which variables are in your local `.env`
2. Add each one to Vercel Dashboard → Settings → Environment Variables
3. Redeploy

## Viewing Logs

To debug issues:

1. **Function Logs**
   - Deployments → Click your deployment → View Function Logs
   - Shows server console output and errors

2. **Build Logs**
   - Deployments → Click deployment → View Build Logs
   - Shows npm install and build process

3. **Real-time Logs**
   - Install Vercel CLI: `npm i -g vercel`
   - Run: `vercel logs your-app-name --follow`

## Custom Domain Setup (Optional)

1. Go to Settings → Domains
2. Add your custom domain
3. Update DNS records as shown in Vercel
4. Update `DISCORD_CALLBACK_URL` to use new domain
5. Update Discord Developer Portal redirect URL

## Cost Considerations

### Free Tier Includes:
- Unlimited deployments
- 100GB bandwidth/month
- 100 hours serverless execution/month
- Automatic SSL certificates
- Preview deployments

### Paid Plans (if needed):
- **Pro**: $20/month - 1TB bandwidth, 1000 hours execution
- **Enterprise**: Custom pricing - Dedicated support, SLA

### External Service Costs:
- OpenAI API: ~$0.002 per card generation (pay-as-you-go)
- TiltCheck: $299-799/month (or free demo mode)
- JustTheTip: Free (open source, users pay transaction fees)

## Alternative Deployment Options

If Vercel doesn't meet your needs:

1. **Railway** (Recommended for WebSocket-heavy apps)
   - See `DEPLOYMENT_RAILWAY.md`
   - Better WebSocket support
   - Free tier with persistent storage

2. **Render**
   - See `DEPLOYMENT_RENDER.md`
   - Good WebSocket support
   - Free tier available

3. **Traditional VPS**
   - Full control and customization
   - Requires manual setup (nginx, PM2, SSL)
   - Best for large-scale production

## Support

- **Documentation**: See `WEBSITE_REQUIREMENTS.md` for detailed setup
- **Issues**: https://github.com/jmenichole/DegensAgainstDecency/issues
- **Discord**: Join our server for community support

---

**Last Updated**: November 9, 2024
