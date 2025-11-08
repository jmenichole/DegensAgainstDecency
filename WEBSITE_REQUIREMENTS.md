# Website Deployment Requirements

This document lists all requirements needed to run Degens Against Decency fully functional on a website.

## Minimum Requirements (Core Functionality)

### System Requirements
- **Node.js**: Version 16.0.0 or higher
- **NPM**: Version 7.0.0 or higher
- **Operating System**: Linux, macOS, or Windows
- **Memory**: Minimum 512MB RAM (1GB+ recommended for production)
- **Storage**: Minimum 100MB for application and dependencies

### Required Dependencies
All dependencies are automatically installed via `npm install`:

**Core Backend:**
- `express` (^4.18.2) - Web server framework
- `socket.io` (^4.7.2) - Real-time bidirectional communication
- `express-session` (^1.17.3) - Session management
- `dotenv` (^16.3.1) - Environment variable management
- `uuid` (^9.0.0) - Unique identifier generation

**Required for Basic Authentication:**
- `passport` (^0.6.0) - Authentication middleware
- `passport-discord` (^0.1.4) - Discord OAuth strategy (deprecated but functional)

### Required Configuration
Minimum environment variables in `.env` file:

```env
# Session Management (REQUIRED)
SESSION_SECRET=your_super_secret_session_key_here

# Server Configuration (REQUIRED)
PORT=3000
NODE_ENV=production
```

**How to generate SESSION_SECRET:**

Use one of these methods to generate a secure random secret:

**Method 1: Using npm script (recommended)**
```bash
npm run generate-secret
```
This will output: `SESSION_SECRET=<random-hex-string>`

**Method 2: Using Node.js directly**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Method 3: Using OpenSSL**
```bash
openssl rand -hex 32
```

Copy the generated string and set it as your `SESSION_SECRET` in the `.env` file.

### Hosting Requirements
**Option 1: Development/Local**
- No additional requirements
- Run with `npm start`
- Access via `http://localhost:3000`

**Option 2: Production Hosting (Vercel - Recommended)**
- GitHub account (for repository connection)
- Free Vercel account
- HTTPS automatically provided
- Environment variables configured in Vercel dashboard

**Option 3: Traditional Server/VPS**
- HTTPS certificate (required for Discord OAuth and secure sessions)
- Reverse proxy (nginx or Apache recommended)
- Process manager (PM2 recommended)
- Firewall configuration for ports 80/443

---

## Optional Features

### Discord OAuth Authentication
**Purpose:** Allow users to login with their Discord accounts

**Requirements:**
- Discord Developer Application (free)
- Discord Application Client ID
- Discord Application Client Secret

**Environment Variables:**
```env
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_CALLBACK_URL=https://yourdomain.com/auth/discord/callback
```

**Setup Steps:**
1. Visit [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a New Application
3. Go to OAuth2 → General
4. Add redirect URI matching your deployment URL
5. Copy Client ID and Secret to `.env` file

**Note:** App works in guest mode without Discord OAuth

---

### Discord Bot Integration
**Purpose:** Create and manage games from Discord servers via slash commands

**Requirements:**
- Discord Bot Token (from Discord Developer Portal)
- Bot must be added to Discord server(s)
- `discord.js` (^14.22.1) - Already included in dependencies

**Environment Variables:**
```env
DISCORD_BOT_TOKEN=your_discord_bot_token
```

**Setup Steps:**
1. In Discord Developer Portal → Bot section
2. Create a Bot
3. Copy Bot Token
4. Enable necessary permissions (Send Messages, Use Slash Commands)
5. Use OAuth2 URL Generator to add bot to servers
   - Scopes: `bot`, `applications.commands`
   - Permissions: Send Messages, Use Slash Commands

**Bot Features:**
- `/create-game` - Create games from Discord
- `/list-games` - View available games
- `/join-game` - Join games by ID
- `/game-status` - Check game status
- Players can play from Discord alongside web users

---

### AI Card Generation
**Purpose:** Generate dynamic question and answer cards using OpenAI GPT

**Requirements:**
- OpenAI API account (paid service)
- OpenAI API Key
- `axios` (^1.13.2) - Already included for API calls

**Environment Variables:**
```env
OPENAI_API_KEY=your_openai_api_key
```

**Setup Steps:**
1. Create account at [OpenAI Platform](https://platform.openai.com/)
2. Add payment method (API usage is pay-as-you-go)
3. Generate API key from API Keys section
4. Add to `.env` file

**Note:** App has fallback content and works without OpenAI API

**Cost Considerations:**
- Typical cost: $0.002 per card generation (GPT-4)
- Example: 1,000 cards = ~$2.00
- Fallback to curated content if API unavailable

---

### TiltCheck Integration (Responsible Gaming)
**Purpose:** Monitor player behavior for problematic gaming patterns

**Requirements:**
- TiltCheck API subscription (paid service) OR demo mode (free)
- TiltCheck API Key (for production)

**Environment Variables:**
```env
# Production Mode
TILTCHECK_ENABLED=true
TILTCHECK_API_KEY=your_tiltcheck_api_key
TILTCHECK_API_URL=https://api.tiltcheck.it.com

# OR Demo Mode (free, local detection only)
TILTCHECK_ENABLED=true
# Leave API_KEY and API_URL empty
```

**Setup Steps (Production):**
1. Visit [TiltCheck](https://github.com/jmenichole/TiltCheck)
2. Subscribe to a plan:
   - Starter: $299/month (1,000 players)
   - Professional: $799/month (10,000 players)
   - Enterprise: Custom pricing
3. Get API key from dashboard
4. Add to environment variables

**Features:**
- Real-time behavior monitoring
- Tilt pattern detection
- Session statistics
- Intervention recommendations

**Note:** Works in demo mode with local detection only (free)

---

### JustTheTip Integration (Crypto Tipping)
**Purpose:** Enable cryptocurrency tipping between players using Solana blockchain

**Requirements:**
- JustTheTip API/Bot setup OR demo mode (free)
- JustTheTip Bot Token (for production)

**Environment Variables:**
```env
# Production Mode
JUSTTHETIP_ENABLED=true
JUSTTHETIP_API_URL=your_justthetip_api_url
JUSTTHETIP_BOT_TOKEN=your_justthetip_bot_token

# OR Demo Mode (free, mock data)
JUSTTHETIP_ENABLED=true
# Leave API_URL and BOT_TOKEN empty
```

**Setup Steps (Production):**
1. Visit [JustTheTip Repository](https://github.com/jmenichole/Justthetip)
2. Deploy your own instance or use hosted API
3. Get bot token from deployment
4. Add to environment variables

**Features:**
- Non-custodial wallet support
- Solana smart contract integration
- Multi-currency support (SOL, USDC, LTC)
- Real-time balance queries
- Transaction history

**Cost Considerations:**
- Integration: Free (open source)
- Transaction fees: ~0.000005 SOL per transaction (paid by users)
- No service fees

**Note:** Works in demo mode with mock data (free)

---

## Complete Environment Variables Reference

### Minimal Configuration (Guest Mode)
```env
SESSION_SECRET=your_super_secret_session_key
PORT=3000
NODE_ENV=production
```

### Full Configuration (All Features Enabled)
```env
# Core Settings (REQUIRED)
SESSION_SECRET=your_super_secret_session_key
PORT=3000
NODE_ENV=production

# Discord OAuth (Optional - for user authentication)
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_CALLBACK_URL=https://yourdomain.com/auth/discord/callback

# Discord Bot (Optional - for Discord server integration)
DISCORD_BOT_TOKEN=your_discord_bot_token

# OpenAI (Optional - for AI card generation)
OPENAI_API_KEY=your_openai_api_key

# TiltCheck (Optional - for behavior monitoring)
TILTCHECK_ENABLED=true
TILTCHECK_API_KEY=your_tiltcheck_api_key
TILTCHECK_API_URL=https://api.tiltcheck.it.com

# JustTheTip (Optional - for crypto tipping)
JUSTTHETIP_ENABLED=true
JUSTTHETIP_API_URL=your_justthetip_api_url
JUSTTHETIP_BOT_TOKEN=your_justthetip_bot_token
```

---

## Deployment Platforms

### Recommended: Vercel (Free Tier)
**Pros:**
- Free hosting
- Automatic HTTPS
- GitHub integration
- Easy environment variable management
- Zero configuration deployment

**Cons:**
- Limited WebSocket support (real-time features may be affected)
- 100GB bandwidth/month limit
- 100 hours execution time/month

**Best For:** Testing, small-scale production, static demos

**Setup:**
1. Fork/clone repository to GitHub
2. Connect repository to Vercel
3. Add environment variables in dashboard
4. Deploy

### Alternative: Railway
**Pros:**
- Excellent WebSocket support
- Free tier available
- Easy deployment
- Better for real-time features

**Best For:** Production with heavy real-time usage

### Alternative: Traditional VPS
**Pros:**
- Full control
- No limitations on WebSockets
- Scalable
- Custom configuration

**Cons:**
- Requires manual setup
- Need to manage HTTPS certificates
- Need to configure reverse proxy

**Best For:** Large-scale production, custom requirements

---

## Network Requirements

### Ports
- **HTTP**: Port 80 (redirects to HTTPS in production)
- **HTTPS**: Port 443 (required for production)
- **WebSocket**: Uses same port as HTTP/HTTPS
- **Development**: Port 3000 (configurable via PORT environment variable)

### Firewall
- Allow inbound traffic on ports 80 and 443
- Allow outbound traffic for API calls (OpenAI, TiltCheck, JustTheTip)

### CORS
- Configured automatically for same-origin requests
- WebSocket connections use same origin

---

## Security Requirements

### Production Checklist
- [ ] Generate secure SESSION_SECRET (use: `npm run generate-secret`)
- [ ] Enable HTTPS (automatically handled by Vercel/hosting platform)
- [ ] Keep API keys in environment variables (never commit to git)
- [ ] Use `.env` for local development (already in `.gitignore`)
- [ ] Set NODE_ENV=production in production
- [ ] Update Discord OAuth callback URLs to match production domain
- [ ] Validate all environment variables are set correctly
- [ ] Monitor server logs for errors
- [ ] Keep dependencies updated (`npm audit` and `npm update`)

### Data Privacy
- Session data stored in memory (consider Redis for production scale)
- No personal data stored permanently without Discord OAuth
- User data only includes Discord ID, username, and avatar (if OAuth enabled)
- Game data is temporary (cleared when games end)

---

## Performance Recommendations

### For Small-Scale (< 100 concurrent users)
- Vercel free tier is sufficient
- In-memory sessions are adequate
- Default configuration works well

### For Medium-Scale (100-1000 concurrent users)
- Use Railway or VPS for better WebSocket support
- Consider Redis for session storage
- Monitor API rate limits (OpenAI, TiltCheck)
- Scale horizontally if needed

### For Large-Scale (> 1000 concurrent users)
- Use traditional VPS or cloud infrastructure
- Implement Redis for sessions
- Use load balancer for multiple server instances
- Consider CDN for static assets
- Implement rate limiting
- Monitor and optimize database queries

---

## Troubleshooting

### Common Issues

**Problem:** "Session secret is required"
- **Solution:** Set SESSION_SECRET in environment variables

**Problem:** "Can't login with Discord"
- **Solution:** Verify DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET are correct
- **Solution:** Check Discord callback URL matches deployment URL
- **Alternative:** Use guest mode by navigating to `/arena` directly

**Problem:** "Failed to create game"
- **Solution:** Check server logs for specific errors
- **Solution:** Verify server is running properly
- **Solution:** Clear browser cache and cookies

**Problem:** "WebSocket connection failed"
- **Solution:** Use Railway or VPS instead of Vercel for better WebSocket support
- **Solution:** Check firewall allows WebSocket connections
- **Solution:** Verify HTTPS is properly configured

**Problem:** "AI card generation not working"
- **Solution:** App uses fallback content automatically
- **Solution:** To enable AI, add valid OPENAI_API_KEY
- **Solution:** Check OpenAI account has available credits

---

## Development vs Production

### Development Mode
```env
NODE_ENV=development
```
- Bypass Discord authentication (guest mode always available)
- Demo user for testing
- Enhanced error logging
- Hot reload with nodemon (`npm run dev`)

### Production Mode
```env
NODE_ENV=production
```
- Secure session handling
- Error logging to console/service
- Discord OAuth required (unless guest mode used)
- Optimized performance

---

## Quick Start Guide

### Minimal Setup (5 minutes)
1. Clone repository
2. Run `npm install`
3. Create `.env` with SESSION_SECRET
4. Run `npm start`
5. Visit `http://localhost:3000`

### Full Setup with Discord (15 minutes)
1. Complete minimal setup above
2. Create Discord Application
3. Add Discord OAuth credentials to `.env`
4. Create Discord Bot and add token to `.env`
5. Invite bot to Discord server
6. Restart server
7. Login via Discord and use slash commands

### Production Deployment to Vercel (10 minutes)
1. Fork repository to GitHub
2. Create Vercel account
3. Import repository in Vercel
4. Add environment variables in Vercel dashboard
5. Deploy
6. Update Discord callback URL to Vercel domain
7. Test deployment

---

## Support and Resources

### Documentation
- [README.md](README.md) - Main documentation
- [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
- [INTEGRATIONS.md](INTEGRATIONS.md) - TiltCheck and JustTheTip details
- [DEPLOYMENT_INTEGRATIONS.md](DEPLOYMENT_INTEGRATIONS.md) - Integration deployment guide
- [GITHUB_PAGES.md](GITHUB_PAGES.md) - Static demo deployment

### External Services
- [Discord Developer Portal](https://discord.com/developers/applications) - Discord app setup
- [OpenAI Platform](https://platform.openai.com/) - AI API keys
- [TiltCheck](https://github.com/jmenichole/TiltCheck) - Behavior monitoring
- [JustTheTip](https://github.com/jmenichole/Justthetip) - Crypto tipping

### Community
- [GitHub Issues](https://github.com/jmenichole/DegensAgainstDecency/issues) - Bug reports and feature requests
- [Security Policy](SECURITY.md) - Report security issues

---

**Last Updated:** November 7, 2024
