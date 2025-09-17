# 🎮 Degens Against Decency - GitHub Pages Demo

This is a **demo version** of the Degens Against Decency game arena running on GitHub Pages.

## 🔗 Live Demo
Visit: [https://jmenichole.github.io/DegensAgainstDecencyCardBot/](https://jmenichole.github.io/DegensAgainstDecencyCardBot/)

## ⚠️ Important Notice

**This GitHub Pages deployment is a STATIC DEMO only.**

The repository contains a full-stack Node.js application with:
- Express server with Discord OAuth authentication
- Socket.IO for real-time multiplayer functionality  
- Server-side game management and AI integration
- API endpoints for user management

**GitHub Pages can only serve static files and cannot run the Node.js backend.**

## 🎯 What Works in This Demo

✅ **UI/UX Demonstration**
- Complete game interface layouts
- Responsive design showcase
- Interactive buttons and forms

✅ **Static Game Previews**
- Degens Against Decency card interface
- 2 Truths and a Lie game layout
- Poker game visualization

✅ **Demo Mode Features**
- Simulated game lobbies
- Mock chat functionality
- Example game states

## ❌ What Requires Full Deployment

❌ **Real Multiplayer Gameplay**
❌ **Discord Authentication**
❌ **Live Chat Between Players**
❌ **AI Content Generation**
❌ **Persistent Game States**
❌ **Real-time Updates**

## 🚀 For Full Functionality

Deploy the complete application to a service that supports Node.js:

### Recommended Platforms:
- **[Heroku](https://heroku.com)** - Easy deployment with free tier
- **[Railway](https://railway.app)** - Modern deployment platform
- **[Render](https://render.com)** - Free static and web services
- **[Vercel](https://vercel.com)** - Serverless deployment

### Environment Setup:
```bash
# Clone the repository
git clone https://github.com/Mischief-Manager-inc/DegensAgainstDecencyCardBot.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Discord app credentials

# Run locally
npm start
```

## 🔧 Technical Implementation

This GitHub Pages version automatically detects static deployment and:
- Loads static-friendly JavaScript files
- Shows demo mode indicators
- Provides simulated interactions
- Explains full deployment requirements

The detection logic:
```javascript
const isStaticDeployment = window.location.hostname.includes('github.io') || 
                          window.location.protocol === 'file:' ||
                          (!window.location.port || window.location.port === '80' || window.location.port === '443');
```

## 📁 Repository Structure

```
DegensAgainstDecencyCardBot/
├── .nojekyll                 # Prevents Jekyll processing
├── public/                   # GitHub Pages source
│   ├── index.html           # Landing page
│   ├── arena.html           # Game lobby
│   ├── game.html            # Game interface  
│   ├── styles/              # CSS files
│   │   ├── main.css
│   │   └── game.css
│   └── scripts/             # JavaScript files
│       ├── auth.js          # Server-enabled auth
│       ├── auth-static.js   # Static demo auth
│       ├── arena.js         # Server-enabled arena
│       ├── arena-static.js  # Static demo arena
│       ├── game.js          # Server-enabled game
│       └── game-static.js   # Static demo game
├── src/                     # Server-side code
├── server.js                # Express server
└── package.json             # Dependencies
```

## 🎨 Customization

### For GitHub Pages Demo:
1. Edit files in `public/` directory
2. Modify `*-static.js` files for demo behavior
3. Update CSS in `styles/` for styling changes

### For Full Application:
1. Configure Discord OAuth in `.env`
2. Modify server-side code in `src/`
3. Update `server.js` for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Test changes locally with `npm start`
3. Verify GitHub Pages compatibility
4. Submit pull request

## 📝 License

See main repository for license information.

---

**Ready to experience the full multiplayer chaos? Deploy the complete Node.js application!** 🎮🎉