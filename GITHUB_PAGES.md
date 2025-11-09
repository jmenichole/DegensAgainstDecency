# 📄 GitHub Pages - Not Recommended

**⚠️ Important Notice**: This repository is designed for full-stack deployment with a backend server. GitHub Pages only supports static file hosting and **cannot** run the Node.js backend required for real multiplayer gameplay.

## 🚫 Why GitHub Pages Doesn't Work for This Project

GitHub Pages serves **static files only**, which means:

❌ **No Real-time Multiplayer**: WebSocket connections not supported
❌ **No Backend API**: Cannot create or join actual games
❌ **No Discord OAuth**: Authentication requires server-side processing
❌ **No AI Content**: Dynamic content generation needs backend
❌ **No Persistent Data**: Cannot save game states or user data
❌ **No Game Logic**: All game mechanics require server processing

## ✅ Recommended Deployment Options

To enable real multiplayer games and all features, deploy to one of these platforms:

**Recommended hosting platforms:**
- **Vercel**: Best for Node.js apps with easy deployment (recommended)
- **Railway**: Modern platform with simple setup
- **Heroku**: Easy deployment with git
- **DigitalOcean App Platform**: Scalable with managed services
- **Render**: Free tier available

See [WEBSITE_REQUIREMENTS.md](WEBSITE_REQUIREMENTS.md) for detailed deployment instructions.

### Required Environment Variables

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

### Server Requirements

- **Node.js 16+**
- **WebSocket support** (for real-time gameplay)
- **Session storage** (Redis recommended for production)
- **HTTPS** (required for Discord OAuth)

## 📖 Development Workflow

1. **Test locally** with the full server: `npm start`
2. **Make changes** to game logic or UI
3. **Test thoroughly** with multiple browser windows
4. **Deploy** to your chosen hosting platform

## 🤝 Contributing

When contributing:
- Test the full server version locally
- Ensure text readability meets accessibility standards
- Update README.md and documentation
- Test multiplayer functionality

## 📞 Support

- **Issues**: Use GitHub Issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Deployment Help**: See [WEBSITE_REQUIREMENTS.md](WEBSITE_REQUIREMENTS.md)

---

**⭐ Star this repository** if you find it useful!