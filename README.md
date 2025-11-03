# 🎮 Degens Against Decency - Game Arena

A comprehensive multiplayer party game platform featuring Discord authentication, AI-generated content, and real-time gameplay across multiple game types.

## 🎯 Features

### 🔐 Discord OAuth Authentication
- Secure login via Discord
- User session management
- Avatar and username integration
- Development mode for testing (bypass authentication)

### 🤖 Discord Bot Integration
- Create and join games directly from Discord
- Slash commands for game management
- Real-time game notifications via DM
- Bridge between Discord and web interface

### 🎮 Multiple Game Types

#### 1. Degens Against Decency
- Cards Against Humanity-style gameplay
- AI-generated question and answer cards
- Card Czar rotation system
- Real-time card submission and judging
- Configurable rounds and scoring

#### 2. 2 Truths and a Lie
- Classic deception game with modern twist
- AI-generated prompts and categories
- Scoring system based on successful deception
- Multiplayer voting and revelation phases

#### 3. Poker (5-Card Stud)
- Traditional poker gameplay
- Betting rounds and pot management
- Hand evaluation and winner determination
- Fold/Call/Raise mechanics

### 🤖 AI Integration
- Dynamic card generation via OpenAI GPT
- Context-aware content based on themes
- Fallback to curated content if AI unavailable
- Fresh content for every game session

### 🌐 Real-time Multiplayer
- WebSocket-based real-time communication
- Game state synchronization
- Live chat during games
- Player presence and status updates

### 🎨 Modern UI/UX
- Responsive design for desktop and mobile
- Dark theme with neon accents
- Smooth animations and transitions
- Intuitive game controls and feedback

### 🔌 Backend Integrations (Optional)
- **TiltCheck** - Player behavior monitoring for responsible gaming
- **JustTheTip** - Cryptocurrency tipping with Solana smart contracts
- Non-custodial wallet support
- Real-time balance queries and transaction tracking
- See [INTEGRATIONS.md](INTEGRATIONS.md) for full details

## 🚀 Getting Started

### Try the Demo First!

Want to see what the interface looks like? Check out our [**GitHub Pages Demo**](https://jmenichole.github.io/DegensAgainstDecency/) for a static preview. Note that the demo version doesn't support real multiplayer gameplay - for that, you'll need to run the full server.

### Prerequisites
- Node.js 16+
- Discord Developer Application (for OAuth and Bot)
- OpenAI API Key (optional, fallback content available)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd DegensAgainstDecencyCardBot
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Discord OAuth Configuration
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_CALLBACK_URL=http://localhost:3000/auth/discord/callback

# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_discord_bot_token

# Session Configuration
SESSION_SECRET=your_super_secret_session_key

# Server Configuration
PORT=3000
NODE_ENV=development

# OpenAI API Key (optional)
OPENAI_API_KEY=your_openai_api_key
```

4. Start the server:
```bash
npm start
```

5. Visit `http://localhost:3000` to begin!

### Discord App Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a New Application
3. **OAuth2 Setup**:
   - Go to OAuth2 → General
   - Add redirect URI: `http://localhost:3000/auth/discord/callback`
   - Copy Client ID and Client Secret to your `.env` file
4. **Bot Setup**:
   - Go to Bot section
   - Create a Bot
   - Copy Bot Token to your `.env` file as `DISCORD_BOT_TOKEN`
   - Enable necessary bot permissions (Send Messages, Use Slash Commands)
5. **Install Bot to Server**:
   - Go to OAuth2 → URL Generator
   - Select scopes: `bot`, `applications.commands`
   - Select permissions: Send Messages, Use Slash Commands
   - Use generated URL to add bot to your Discord server

## 🎮 How to Play

### Starting a Game (Web Interface)
1. **Login**: Use Discord OAuth to authenticate
2. **Arena**: Browse available games or create a new one
3. **Configure**: Choose game type, max players, and privacy settings
4. **Play**: Join games and enjoy real-time multiplayer action!

### Starting a Game (Discord Bot)
Use these slash commands in any Discord server where the bot is installed:

- `/create-game` - Create a new game
  - **type**: Choose game type (Degens Against Decency, 2 Truths and a Lie, Poker)
  - **max-players**: Set maximum players (3-7, optional)
  - **private**: Make game private (optional)

- `/list-games` - View all available public games

- `/join-game` - Join a game by ID
  - **game-id**: The game ID to join

- `/game-status` - Check your current game status

**Note**: Discord bot users can play alongside web users in the same games!

### Game Types Guide

#### Degens Against Decency
- **Players**: 3-8 recommended
- **Rounds**: 10 rounds (configurable)
- **Gameplay**: Submit funniest answer card to match the question
- **Scoring**: Card Czar picks winning submission
- **AI**: Generates fresh question and answer cards

#### 2 Truths and a Lie
- **Players**: 3+ (more is better)
- **Rounds**: Based on number of players
- **Gameplay**: Create believable lies, guess others' lies
- **Scoring**: Points for correct guesses and successful deception
- **AI**: Provides creative prompts and categories

#### Poker (5-Card Stud)
- **Players**: 2-8
- **Rounds**: Single hand completion
- **Gameplay**: Traditional poker betting and hand evaluation
- **Scoring**: Winner takes the pot
- **Features**: Blinds, betting rounds, fold/call/raise

## 🛠️ Technical Architecture

### Backend
- **Framework**: Express.js with Socket.IO
- **Authentication**: Passport.js with Discord strategy
- **Session Management**: Express-session
- **Real-time**: WebSocket connections
- **AI Integration**: OpenAI API for content generation

### Frontend
- **Vanilla JavaScript**: No framework dependencies
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **WebSocket Client**: Real-time game state updates
- **Responsive Design**: Works on desktop and mobile

### Game Engine
- **Modular Architecture**: Base game class with specialized implementations
- **State Management**: Centralized game state with real-time sync
- **Player Management**: Session-based player tracking
- **AI Content**: Dynamic content generation with fallbacks

## 📁 Project Structure

```
DegensAgainstDecencyCardBot/
├── server.js                 # Main server file
├── package.json              # Dependencies and scripts
├── .env.example              # Environment template
├── src/
│   ├── GameManager.js        # Central game management
│   ├── AICardGenerator.js    # AI content generation
│   └── games/
│       ├── BaseGame.js       # Base game class
│       ├── DegensAgainstDecencyGame.js
│       ├── TwoTruthsAndALieGame.js
│       └── PokerGame.js
└── public/
    ├── index.html            # Landing page
    ├── arena.html           # Game lobby
    ├── game.html            # Game interface
    ├── styles/
    │   ├── main.css         # Global styles
    │   └── game.css         # Game-specific styles
    └── scripts/
        ├── auth.js          # Authentication handling
        ├── arena.js         # Lobby functionality
        └── game.js          # Game client logic
```

## 🔧 Development

### Running in Development Mode
Set `NODE_ENV=development` to enable:
- Bypass Discord authentication
- Demo user for testing
- Enhanced error logging

### Adding New Games
1. Create game class extending `BaseGame`
2. Implement required methods: `initializeGame()`, `handleAction()`, `getGameState()`
3. Add game renderer in `game.js`
4. Register in `GameManager.js`

### API Endpoints
- `GET /` - Landing page
- `GET /arena` - Game lobby (auth required)
- `GET /game/:gameId` - Game interface (auth required)
- `GET /api/user` - Current user info
- `GET /api/games` - List public games
- `POST /api/games` - Create new game
- `GET /auth/discord` - Discord OAuth initiation
- `GET /auth/discord/callback` - OAuth callback
- `GET /auth/logout` - Logout

### WebSocket Events
- `join-lobby` - Join game lobby
- `join-game` - Join specific game
- `leave-game` - Leave current game
- `game-action` - Send game-specific action
- `chat-message` - Send chat message
- `game-update` - Receive game state updates
- `lobby-games` - Receive lobby game list

## 🎨 Customization

### Themes and Styling
- Modify `/public/styles/main.css` for global styling
- Game-specific styles in `/public/styles/game.css`
- CSS custom properties for easy color scheme changes

### AI Content
- Adjust prompts in `AICardGenerator.js`
- Configure content generation parameters
- Add fallback content collections

### Game Rules
- Modify scoring systems in individual game classes
- Adjust round limits and player counts
- Customize game flow and phases

## 🚀 Deployment

### GitHub Pages (Static Demo Only)

For a quick static demo without backend functionality:

1. Fork this repository
2. Enable GitHub Pages in Settings → Pages
3. Select "main" branch and "/ (root)" folder
4. Visit `https://yourusername.github.io/DegensAgainstDecency/`

**Note**: GitHub Pages only shows the UI demo. For real multiplayer games, deploy the full server below.

See [GITHUB_PAGES.md](GITHUB_PAGES.md) for detailed instructions.

### Quick Deploy to Vercel (Recommended for Full Features)

The easiest way to deploy this app is using Vercel:

1. **Install Vercel CLI** (optional):
```bash
npm i -g vercel
```

2. **Deploy via Vercel Dashboard** (recommended):
   - Fork/clone this repository to your GitHub account
   - Visit [Vercel](https://vercel.com) and sign in with GitHub
   - Click "New Project" and import this repository
   - Configure environment variables (see below)
   - Deploy!

3. **Configure Environment Variables in Vercel**:
   - Go to your project settings → Environment Variables
   - Add the following variables:
   
   **Required:**
   ```
   NODE_ENV=production
   SESSION_SECRET=[generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
   ```
   
   **Optional (for Discord OAuth):**
   ```
   DISCORD_CLIENT_ID=your_discord_client_id
   DISCORD_CLIENT_SECRET=your_discord_client_secret
   DISCORD_CALLBACK_URL=https://yourdomain.vercel.app/auth/discord/callback
   ```
   
   **Optional (for Discord Bot):**
   ```
   DISCORD_BOT_TOKEN=your_discord_bot_token
   ```
   
   **Optional (for AI features):**
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Update Discord OAuth Redirect URI**:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Select your application
   - Go to OAuth2 → General
   - Add redirect URI: `https://yourdomain.vercel.app/auth/discord/callback`
   - Replace `yourdomain` with your actual Vercel domain

5. **Test Your Deployment**:
   - Visit your Vercel URL
   - The app works without Discord OAuth (guest mode)
   - Try creating and joining games

### Alternative: Deploy to Other Platforms

The app also works on:
- **Heroku**: Add Procfile with `web: node server.js`
- **Railway**: Just connect your GitHub repo
- **DigitalOcean App Platform**: Configure as Node.js app
- **Render**: Use `npm start` as start command

### Traditional Server Deployment

For VPS or dedicated server:

1. Set `NODE_ENV=production`
2. Configure secure session secrets
3. Set up HTTPS (required for Discord OAuth)
4. Configure reverse proxy (nginx recommended)
5. Set up process manager (PM2 recommended)

### Environment Variables (Production)
```env
NODE_ENV=production
SESSION_SECRET=secure_random_string_change_this
DISCORD_CALLBACK_URL=https://yourdomain.com/auth/discord/callback
```

### Important Notes for Production

⚠️ **Discord OAuth is optional** - The app works in guest mode without Discord authentication

⚠️ **WebSockets on Vercel** - Note that Vercel has limitations with WebSocket connections. For best real-time performance, consider using:
- Railway (best WebSocket support)
- Heroku
- Traditional VPS

⚠️ **Session Storage** - For production at scale, use Redis for session storage instead of in-memory sessions

## 🔧 Troubleshooting

### Login/Signup Issues

**Problem**: Can't login or signup  
**Solutions**:
1. **Check if Discord OAuth is configured**
   - The app works in guest mode without Discord OAuth
   - Visit `/arena` directly to use guest mode
   - If Discord OAuth fails, check your environment variables

2. **Verify Discord Application Setup**
   - Ensure `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` are set
   - Confirm redirect URI matches your deployment URL
   - Check that your Discord app has the correct OAuth scopes

3. **Session Secret**
   - Make sure `SESSION_SECRET` is set in environment variables
   - Generate a secure secret for production

### API Errors

**Problem**: "Failed to create game" or "Failed to retrieve games"  
**Solutions**:
1. Check browser console for specific error messages
2. Verify the server is running (check Vercel logs or server logs)
3. Ensure all required environment variables are set
4. Try refreshing the page and clearing browser cache

### Connection Issues

**Problem**: "Unable to connect to server" or WebSocket failures  
**Solutions**:
1. **On Vercel**: WebSocket support is limited, consider alternative hosting
2. **Check CORS**: Ensure your deployment allows WebSocket connections
3. **Firewall**: Check if WebSocket ports are blocked
4. **Browser Console**: Look for specific connection errors

### Build/Deployment Issues

**Problem**: Build fails or app doesn't start  
**Solutions**:
1. Run `npm install` to ensure dependencies are installed
2. Run `npm run build` locally to test
3. Check Node.js version (requires 16+)
4. Review Vercel build logs for specific errors
5. Ensure `vercel.json` is present in repository root

### Guest Mode Not Working

**Problem**: Can't access app without Discord login  
**Solutions**:
1. Navigate directly to `/arena` instead of home page
2. Check that `NODE_ENV` is properly set
3. Clear browser cookies and try again
4. Check server logs for authentication errors

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**: Ensure code follows the existing style
4. **Test locally**: Run `npm start` and test your changes
5. **Update documentation**: If you add features, update the README
6. **Submit a pull request**: Describe your changes clearly

Please read our [**Contributing Guide**](CONTRIBUTING.md) for detailed guidelines and [**Code of Conduct**](CODE_OF_CONDUCT.md) for community standards.

For security issues, see our [**Security Policy**](SECURITY.md).

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2024 Degens Against Decency. All rights reserved.

## 🎉 Credits

Made by degens for degens ❤️ Special thanks to:
- Discord for OAuth integration
- OpenAI for AI content generation
- Socket.IO for real-time communication
- The original Cards Against Humanity creators

## 🐛 Known Issues & Roadmap

### Known Issues
- WebSocket support on Vercel is limited (use Railway/Heroku for better real-time features)
- Mobile UI could be optimized further
- AI content rate limiting not implemented
- In-memory session storage (use Redis for production scale)
- `passport-discord` package is deprecated (still functional, but consider migrating to maintained alternatives like `discord-strategy` or `passport-discord-auth` in future updates)

### Roadmap
- [ ] User statistics and game history
- [ ] Tournament mode and brackets  
- [ ] Custom card creation and sharing
- [ ] More game types (Charades, Pictionary, etc.)
- [ ] Voice chat integration
- [ ] Advanced AI personality modes
- [ ] Mobile app development

---

**Ready to party? Start your Degens Against Decency arena now!** 🎮🎉
