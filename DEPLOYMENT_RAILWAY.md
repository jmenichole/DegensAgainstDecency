# 🚂 Railway Deployment Guide

Railway is an excellent platform for deploying the Degens Against Decency game arena with full WebSocket support.

## 🚀 Quick Deploy to Railway

### Option 1: Deploy from GitHub (Recommended)

1. **Sign up/Login to Railway**
   - Visit [railway.app](https://railway.app)
   - Sign in with your GitHub account

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose this repository: `jmenichole/DegensAgainstDecency`
   - Railway will automatically detect it's a Node.js app
   - The repository includes `.nvmrc` and `nixpacks.toml` to ensure Node.js 18+ is used

3. **Configure Environment Variables**
   - Go to your project → Variables tab
   - Add the following required variables:
   
   ```bash
   NODE_ENV=production
   SESSION_SECRET=<generate-with-crypto-randomBytes>
   ```
   
   **Optional but recommended:**
   ```bash
   DISCORD_CLIENT_ID=your_discord_client_id
   DISCORD_CLIENT_SECRET=your_discord_client_secret
   DISCORD_CALLBACK_URL=https://your-app.railway.app/auth/discord/callback
   DISCORD_BOT_TOKEN=your_discord_bot_token
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Generate SESSION_SECRET**
   - Run locally: `npm run generate-secret`
   - Copy the generated value to Railway

5. **Deploy**
   - Railway will automatically build and deploy
   - Wait for deployment to complete (usually 2-3 minutes)
   - Your app will be live at: `https://your-app.railway.app`

### Option 2: Deploy with Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to your GitHub repo (optional)
railway link

# Add environment variables
railway variables set NODE_ENV=production
railway variables set SESSION_SECRET=<your-generated-secret>

# Deploy
railway up
```

## 🔧 Post-Deployment Configuration

### 1. Update Discord OAuth Redirect URI

If using Discord authentication:
- Go to [Discord Developer Portal](https://discord.com/developers/applications)
- Select your application
- Navigate to OAuth2 → General
- Add redirect URI: `https://your-app.railway.app/auth/discord/callback`
- Replace `your-app` with your actual Railway domain

### 2. Custom Domain (Optional)

Railway provides a free `.railway.app` subdomain, or you can add a custom domain:
- Go to your Railway project → Settings → Domains
- Click "Generate Domain" or "Add Custom Domain"
- Follow the DNS configuration instructions

## 📊 Monitoring & Logs

- **View Logs**: Click on your service → View Logs
- **Metrics**: Railway provides CPU, Memory, and Network metrics
- **Restart**: Click on your service → ⋮ → Restart

## 💰 Pricing

Railway offers:
- **Free Tier**: $5 worth of usage credits per month
- **Hobby Plan**: $5/month with $5 in credits included
- **Pro Plan**: $20/month with $20 in credits included

WebSocket support is fully included at all tiers.

## ✅ Advantages of Railway

- ✅ **Full WebSocket Support** - Perfect for real-time multiplayer
- ✅ **Automatic HTTPS** - Built-in SSL certificates
- ✅ **GitHub Integration** - Auto-deploy on push
- ✅ **Environment Variables** - Easy secret management
- ✅ **Persistent Storage** - Volumes for databases if needed
- ✅ **Great DX** - Excellent developer experience

## 🐛 Troubleshooting

### App Won't Start
- Check logs in Railway dashboard
- Verify all required environment variables are set
- Ensure `SESSION_SECRET` is properly generated
- If you see `ReferenceError: ReadableStream is not defined`, ensure Railway is using Node.js 18+ (configured via `.nvmrc` and `nixpacks.toml`)

### WebSocket Connection Failed
- Railway fully supports WebSockets, no special configuration needed
- Verify your client is connecting to the correct domain

### Discord OAuth Not Working
- Verify `DISCORD_CALLBACK_URL` matches your Railway domain
- Check Discord Developer Portal has correct redirect URI
- Ensure `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` are set

## 📞 Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project Issues: https://github.com/jmenichole/DegensAgainstDecency/issues

---

**Happy deploying! 🚂**
