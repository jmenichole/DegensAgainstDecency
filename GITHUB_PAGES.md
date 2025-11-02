# 📄 GitHub Pages Deployment Guide

This repository includes a **static demo version** that can be hosted on GitHub Pages for demonstration purposes.

## 🎯 What's Included in the Static Demo

The static demo (`arena-demo.html`) provides:

✅ **Visual Interface**: Complete arena UI with improved text readability
✅ **Demo Games**: Sample game listings with different states (waiting, in progress, full)
✅ **Interactive Elements**: Working form controls and buttons
✅ **Create Game Demo**: Shows how the interface works
✅ **Clear Limitations**: Explains what requires a backend server

## 🚀 Quick GitHub Pages Setup

1. **Fork this repository** to your GitHub account
2. **Ensure `.nojekyll` file exists** in the root (already included in this repo)
   - This file tells GitHub Pages to serve all files, including those in directories starting with underscores
3. **Enable GitHub Pages** in repository settings:
   - Go to Settings → Pages
   - Set Source to "Deploy from a branch"
   - Select "main" branch and "/ (root)" folder
   - Click Save
4. **Wait a few minutes** for GitHub to build and deploy your site
5. **Access your demo** at: 
   - Landing page: `https://yourusername.github.io/DegensAgainstDecency/`
   - Demo arena: `https://yourusername.github.io/DegensAgainstDecency/arena-demo.html`

## 📁 Static Files Structure

```
├── .nojekyll               # Ensures GitHub Pages serves all files
├── index.html              # Landing page (links to arena-demo.html)
├── arena-demo.html          # Static demo arena page
├── game.html               # Game interface (requires server for functionality)
├── scripts/
│   ├── arena-demo.js        # Demo functionality (no server required)
│   ├── arena.js            # Full arena functionality (requires server)
│   ├── game.js             # Game client logic (requires server)
│   └── auth.js             # Authentication handling (requires server)
├── styles/
│   ├── main.css            # Main styles (with readability improvements)
│   └── game.css            # Game-specific styles
├── logo.png                # Logo image
└── banner.png              # Banner image
```

## ⚠️ Limitations of Static Hosting

GitHub Pages serves **static files only**, which means:

❌ **No Real-time Multiplayer**: WebSocket connections not supported
❌ **No Backend API**: Cannot create or join actual games
❌ **No Discord OAuth**: Authentication requires server-side processing
❌ **No AI Content**: Dynamic content generation needs backend
❌ **No Persistent Data**: Cannot save game states or user data

## 🔧 For Full Functionality

To enable real multiplayer games and all features, you need to:

### 1. Deploy the Full Server Version

**Recommended hosting platforms:**
- **Heroku**: Easy deployment with git
- **Railway**: Modern platform with simple setup
- **DigitalOcean App Platform**: Scalable with managed services
- **Vercel**: Great for Node.js apps
- **Render**: Free tier available

### 2. Required Environment Variables

```env
# Discord OAuth (optional but recommended)
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_CALLBACK_URL=https://yourdomain.com/auth/discord/callback

# Discord Bot (optional)
DISCORD_BOT_TOKEN=your_discord_bot_token

# Session Security
SESSION_SECRET=your_secure_random_string

# Server Configuration
PORT=3000
NODE_ENV=production

# AI Features (optional)
OPENAI_API_KEY=your_openai_api_key
```

### 3. Server Requirements

- **Node.js 16+**
- **WebSocket support** (for real-time gameplay)
- **Session storage** (Redis recommended for production)
- **HTTPS** (required for Discord OAuth)

## 🎮 Demo vs Full Version Comparison

| Feature | Static Demo | Full Server Version |
|---------|-------------|-------------------|
| Arena Interface | ✅ | ✅ |
| Text Readability | ✅ | ✅ |
| Game Creation UI | ✅ | ✅ |
| Real Multiplayer | ❌ | ✅ |
| Discord Auth | ❌ | ✅ |
| Live Chat | ❌ | ✅ |
| AI Content | ❌ | ✅ |
| Game State Sync | ❌ | ✅ |
| Mobile Support | ✅ | ✅ |

## 📖 Development Workflow

1. **Test locally** with the full server: `npm start`
2. **Make changes** to styles or static content
3. **Test static demo** to ensure GitHub Pages compatibility
4. **Deploy** both static demo and full server versions

## 🤝 Contributing

When contributing:
- Test both static demo and full server versions
- Ensure text readability meets accessibility standards
- Update both README.md and this GitHub Pages guide
- Consider GitHub Pages limitations in new features

## 📞 Support

- **Issues**: Use GitHub Issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Static Demo**: Always works at your GitHub Pages URL
- **Full Version**: Requires proper server deployment

---

**⭐ Star this repository** if you find it useful!
**🔗 Share your GitHub Pages demo** with friends!