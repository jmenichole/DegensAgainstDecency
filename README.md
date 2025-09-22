# 🏟️ Degens Against Decency - Multiplayer Game Arena

A comprehensive real-time multiplayer party game arena featuring Discord authentication, AI-generated content, and competitive gameplay across multiple game modes. Create rooms, challenge friends, and dominate the leaderboards!

## 🏟️ Arena Overview

The **Degens Against Decency Multiplayer Arena** is a comprehensive real-time gaming platform where players can:

- 🎮 **Create Battle Rooms**: Host private games with friends or public matches for anyone to join
- ⚡ **Instant Matchmaking**: Quick-join available games or browse active lobbies
- 🏆 **Competitive Gaming**: Track wins, losses, and dominate leaderboards across all game modes
- 👥 **Social Features**: Chat systems, player profiles, and friend challenges
- 🎯 **Multi-Game Platform**: Seamlessly switch between different party games in one arena
- 🤖 **AI-Enhanced**: Dynamic content generation for fresh gameplay every session

## 🎯 Features

### 🔐 Discord OAuth Authentication
- Secure login via Discord
- User session management
- Avatar and username integration
- Development mode for testing (bypass authentication)

### 🎮 Multi-Game Arena Platform

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

### 🏟️ Arena Infrastructure
- Real-time multiplayer game rooms
- Private and public lobby system  
- Instant matchmaking and room creation
- Live spectator mode and chat systems
- Cross-game player statistics and achievements

### 🌐 Real-time Multiplayer Arena
- WebSocket-based real-time communication
- Game state synchronization
- Live chat during games
- Player presence and status updates

### 🎨 Modern UI/UX
- Responsive design for desktop and mobile
- Dark theme with neon accents
- Smooth animations and transitions
- Intuitive game controls and feedback

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Discord Developer Application
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
3. Go to OAuth2 → General
4. Add redirect URI: `http://localhost:3000/auth/discord/callback`
5. Copy Client ID and Client Secret to your `.env` file

## 🏟️ How to Use the Arena

### Entering the Arena
1. **Login**: Use Discord OAuth to authenticate and enter the arena
2. **Browse Lobbies**: View active games or create your own battle room
3. **Join or Create**: Jump into existing matches or host your own with custom settings
4. **Battle**: Compete in real-time multiplayer matches with friends and rivals!

### Arena Navigation
- **Main Lobby**: Browse all active public games across different game types
- **Private Rooms**: Create password-protected games for friends only
- **Quick Match**: Instantly join the next available game in your preferred mode
- **Spectate**: Watch ongoing matches and learn from top players

### Game Room Management
1. **Login**: Use Discord OAuth to authenticate and enter the arena
2. **Browse Lobbies**: View active games or create your own battle room
3. **Join or Create**: Jump into existing matches or host your own with custom settings
4. **Battle**: Compete in real-time multiplayer matches with friends and rivals!

### Arena Navigation
- **Main Lobby**: Browse all active public games across different game types
- **Private Rooms**: Create password-protected games for friends only
- **Quick Match**: Instantly join the next available game in your preferred mode
- **Spectate**: Watch ongoing matches and learn from top players

### Game Room Management
- **Room Settings**: Configure player limits, game rules, and privacy options
- **Player Management**: Kick disruptive players, invite friends, transfer host
- **Match History**: Review past games and track your arena performance

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

### Production Setup
1. Set `NODE_ENV=production`
2. Configure secure session secrets
3. Set up HTTPS for Discord OAuth
4. Configure reverse proxy (nginx recommended)
5. Set up process manager (PM2 recommended)

### Environment Variables (Production)
```env
NODE_ENV=production
SESSION_SECRET=secure_random_string_change_this
DISCORD_CALLBACK_URL=https://yourdomain.com/auth/discord/callback
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

[Add your license information here]

## 🎉 Credits

Made by degens for degens ❤️ Special thanks to:
- Discord for OAuth integration
- OpenAI for AI content generation
- Socket.IO for real-time communication
- The original Cards Against Humanity creators

## 🐛 Known Issues & Roadmap

### Known Issues
- WebSocket reconnection needs improvement
- Mobile UI could be optimized further
- AI content rate limiting not implemented

### Roadmap
- [ ] **Arena Tournaments**: Bracket-style competitions with multiple rounds
- [ ] **Player Rankings**: Global leaderboards and skill-based matchmaking  
- [ ] **Spectator Mode**: Watch live games with commentary features
- [ ] **Arena Championships**: Seasonal competitions with prizes and titles
- [ ] **Custom Room Themes**: Personalized arena aesthetics and rules
- [ ] **Team Battles**: Clan vs clan matches across multiple game modes
- [ ] **User statistics and game history**
- [ ] **Custom card creation and sharing**
- [ ] **More game types (Charades, Pictionary, etc.)**
- [ ] **Voice chat integration**
- [ ] **Advanced AI personality modes**
- [ ] **Mobile app development**

---

**Ready to dominate the arena? Start your battle now!** 🏟️🎮🏆
