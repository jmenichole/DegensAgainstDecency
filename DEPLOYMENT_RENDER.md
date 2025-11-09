# 🎨 Render Deployment Guide

Render is a great platform for deploying the Degens Against Decency game arena with full WebSocket support and a generous free tier.

## 🚀 Quick Deploy to Render

### Option 1: Deploy from GitHub (Recommended)

1. **Sign up/Login to Render**
   - Visit [render.com](https://render.com)
   - Sign up with your GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub account if not already connected
   - Select repository: `jmenichole/DegensAgainstDecency`
   - Click "Connect"

3. **Configure Service**
   - **Name**: `degens-against-decency` (or your choice)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your deployment branch)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Select "Free" or "Starter" ($7/month for better performance)

4. **Environment Variables**
   - Click "Advanced" → "Add Environment Variable"
   - Add these required variables:
   
   ```bash
   NODE_ENV=production
   SESSION_SECRET=<generate-with-crypto-randomBytes>
   ```
   
   **Optional but recommended:**
   ```bash
   DISCORD_CLIENT_ID=your_discord_client_id
   DISCORD_CLIENT_SECRET=your_discord_client_secret
   DISCORD_CALLBACK_URL=https://your-app.onrender.com/auth/discord/callback
   DISCORD_BOT_TOKEN=your_discord_bot_token
   OPENAI_API_KEY=your_openai_api_key
   ```

5. **Generate SESSION_SECRET**
   - Run locally: `npm run generate-secret`
   - Copy the generated value to Render

6. **Create Web Service**
   - Click "Create Web Service"
   - Render will automatically build and deploy
   - Wait for deployment to complete (usually 3-5 minutes)
   - Your app will be live at: `https://your-app.onrender.com`

### Option 2: Deploy with render.yaml (Infrastructure as Code)

This repository includes a `render.yaml` file for one-click deployment:

1. Go to [Render Dashboard](https://dashboard.render.com/select-repo?type=blueprint)
2. Connect your repository
3. Render will detect `render.yaml` and create services automatically
4. Add environment variables in the Render dashboard
5. Click "Apply" to deploy

## 🔧 Post-Deployment Configuration

### 1. Update Discord OAuth Redirect URI

If using Discord authentication:
- Go to [Discord Developer Portal](https://discord.com/developers/applications)
- Select your application
- Navigate to OAuth2 → General
- Add redirect URI: `https://your-app.onrender.com/auth/discord/callback`
- Replace `your-app` with your actual Render domain

### 2. Custom Domain (Optional)

Render provides a free `.onrender.com` subdomain, or you can add a custom domain:
- Go to your service → Settings → Custom Domains
- Click "Add Custom Domain"
- Follow the DNS configuration instructions
- Render automatically provisions SSL certificates

### 3. Enable WebSocket Support

WebSockets are automatically enabled on Render - no configuration needed!

## 📊 Monitoring & Logs

- **View Logs**: Click on your service → Logs tab
- **Metrics**: Navigate to Metrics tab for CPU, Memory, and Bandwidth
- **Events**: Check Events tab for deployment history
- **Manual Deploy**: Click "Manual Deploy" → "Deploy latest commit"

## 💰 Pricing

Render offers:
- **Free Tier**: 
  - 750 hours/month of free instance time
  - Apps spin down after 15 minutes of inactivity
  - Automatic wake-up on first request (can take 30-60 seconds)
  
- **Starter Plan**: $7/month
  - Always-on instances
  - No spin-down
  - Better for production use
  
- **Standard Plan**: $25/month and up
  - Enhanced performance
  - More resources

**Note**: Free tier spins down after inactivity. For production, consider Starter plan.

## ✅ Advantages of Render

- ✅ **Full WebSocket Support** - Perfect for real-time multiplayer
- ✅ **Automatic HTTPS** - Free SSL certificates for all apps
- ✅ **GitHub Integration** - Auto-deploy on push
- ✅ **Free Tier** - Generous free tier for testing
- ✅ **No Credit Card** - Free tier doesn't require payment info
- ✅ **Health Checks** - Automatic health monitoring
- ✅ **DDoS Protection** - Built-in security

## 🐛 Troubleshooting

### Free Tier Spin Down

**Issue**: App takes 30-60 seconds to respond after being idle
**Solution**: 
- Upgrade to Starter plan ($7/month) for always-on instances
- Or accept the cold start for low-traffic testing

### Build Failed

**Issue**: Build fails with missing dependencies
**Solution**:
- Check build logs in Render dashboard
- Verify `package.json` has all dependencies
- Ensure Node version is >=16 (Render auto-detects from `engines` in package.json)

### WebSocket Connection Failed

**Issue**: WebSocket connections timing out
**Solution**:
- Render fully supports WebSockets, no special configuration needed
- Check that your client is connecting to `wss://` (secure WebSocket)
- Verify the Render app URL is correct

### Discord OAuth Not Working

**Issue**: Discord login redirects to wrong URL
**Solution**:
- Verify `DISCORD_CALLBACK_URL` matches your Render domain
- Check Discord Developer Portal has correct redirect URI
- Ensure `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` are set

### Environment Variables Not Loading

**Issue**: App can't read environment variables
**Solution**:
- Go to Service → Environment tab
- Verify all variables are added
- Click "Manual Deploy" to redeploy with new variables

## 🔄 Continuous Deployment

Render automatically deploys when you push to your connected branch:

1. Make changes locally
2. Commit and push to GitHub
3. Render detects the push and starts building
4. New version goes live automatically (usually 2-3 minutes)

To disable auto-deploy:
- Go to Settings → Build & Deploy
- Toggle off "Auto-Deploy"

## 📞 Support

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Project Issues: https://github.com/jmenichole/DegensAgainstDecency/issues

## 🎯 Recommended: Render vs Railway

**Choose Render if:**
- You want a free tier without credit card
- You're okay with cold starts on free tier
- You want simple, straightforward deployment

**Choose Railway if:**
- You need always-on instances on free tier
- You prefer a more modern developer experience
- You want faster cold start times

Both platforms fully support this application with WebSockets!

---

**Happy deploying! 🎨**
