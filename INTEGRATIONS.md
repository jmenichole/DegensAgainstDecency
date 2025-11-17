# Backend Integrations

This document describes the backend integrations available for Degens Against Decency.

## Quick Navigation

- [Overview](#overview)
- [TiltCheck Integration](#tiltcheck-integration)
- [JustTheTip Integration](#justthetip-integration)
- [Client-Side Integration](#client-side-integration)
- [Profile Page Access](#profile-page-access)
- [API Endpoints Reference](#api-endpoints)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Overview

The game arena supports two optional integrations:

1. **TiltCheck** - Player behavior monitoring for responsible gaming
2. **JustTheTip** - Cryptocurrency tipping using Solana smart contracts

Both integrations are **optional** and can be enabled via environment variables. The game works fully without them.

## TiltCheck Integration

### What is TiltCheck?

TiltCheck is a professional player behavior monitoring system that detects "tilt" patterns in gaming environments. It helps promote responsible gaming through:

- Real-time behavior analysis
- Predictive alerts for problematic patterns
- Session tracking and statistics
- Intervention recommendations

### Setup

1. **Get an API Key**
   - Visit [https://tiltcheck.it.com](https://tiltcheck.it.com)
   - Subscribe to a plan (Starter, Professional, or Enterprise)
   - Get your API key from the dashboard

2. **Configure Environment Variables**
   ```bash
   TILTCHECK_ENABLED=true
   TILTCHECK_API_KEY=your_api_key_here
   TILTCHECK_API_URL=https://api.tiltcheck.it.com
   ```

3. **Restart the Server**
   ```bash
   npm start
   ```

### Features

- **Automatic Player Tracking** - Players are automatically tracked when joining games
- **Real-time Monitoring** - Game actions (bets, wins, losses) are monitored
- **Local Tilt Detection** - Basic tilt indicators work even without API access
- **Session Statistics** - View player statistics and recommendations

### API Endpoints

#### Check Integration Health
```
GET /api/integrations/health
```

Response:
```json
{
  "tiltCheck": {
    "enabled": true,
    "activePlayers": 5
  }
}
```

#### Get Player Statistics
```
GET /api/integrations/tiltcheck/stats/:playerId
```

Response:
```json
{
  "playerId": "user-123",
  "sessionDuration": 1800,
  "totalActions": 45,
  "wins": 20,
  "losses": 25,
  "winRate": "44.4",
  "currentStake": 85,
  "initialStake": 100,
  "alerts": [
    {
      "alert": true,
      "message": "Multiple consecutive losses - be mindful of tilt",
      "severity": "medium"
    }
  ]
}
```

### Demo Mode

TiltCheck works in demo mode without an API key:
- Set `NODE_ENV=development`
- Set `TILTCHECK_ENABLED=true`
- Leave `TILTCHECK_API_KEY` empty
- Local tilt detection will work without external API calls

## Profile Page Access

Access TiltCheck statistics and management through the **Profile Page**:

1. Navigate to your profile from the arena: Click **Profile** button
2. In the profile sidebar, click **🔌 Integrations**
3. View TiltCheck status and statistics
4. Monitor active alerts and recommendations

**Direct Link**: `/profile.html#integrations`

## JustTheTip Integration

### What is JustTheTip?

JustTheTip is a professional Solana smart contract platform for cryptocurrency tipping. It enables:

- Non-custodial tipping (users control their keys)
- Solana smart contract transactions
- Multi-currency support (SOL, USDC, LTC)
- Real-time balance queries

### Setup

1. **Configure Environment Variables**
   ```bash
   JUSTTHETIP_ENABLED=true
   JUSTTHETIP_API_URL=https://api.justthetip.io
   JUSTTHETIP_BOT_TOKEN=your_bot_token_here
   ```

2. **Restart the Server**
   ```bash
   npm start
   ```

### Features

- **Wallet Registration** - Users register Solana wallets for tipping
- **In-Game Tipping** - Tip other players during or after games
- **Balance Queries** - Check cryptocurrency balances
- **Airdrop Support** - Create airdrops for game winners
- **Transaction History** - Track all tips and transfers

### API Endpoints

#### Register Wallet
```
POST /api/integrations/justthetip/register-wallet
```

Request:
```json
{
  "userId": "user-123",
  "walletAddress": "8pBX4jYx..."
}
```

Response:
```json
{
  "success": true,
  "walletAddress": "8pBX4jYx...",
  "message": "Wallet registered successfully"
}
```

#### Create Tip
```
POST /api/integrations/justthetip/tip
```

Request:
```json
{
  "fromUserId": "user-123",
  "toUserId": "user-456",
  "amount": 0.1,
  "currency": "SOL",
  "context": {
    "gameId": "game-abc",
    "gameType": "poker",
    "reason": "great_play"
  }
}
```

Response:
```json
{
  "success": true,
  "transaction": {
    "signature": "5j7s...",
    "status": "pending",
    "fromWallet": "8pBX4jYx...",
    "toWallet": "9qCY5kZz...",
    "amount": 0.1,
    "currency": "SOL"
  }
}
```

#### Get Balance
```
GET /api/integrations/justthetip/balance/:userId
```

Response:
```json
{
  "success": true,
  "walletAddress": "8pBX4jYx...",
  "balances": {
    "SOL": 1.5,
    "USDC": 100.0,
    "LTC": 0.5
  },
  "totalUSD": 150.00
}
```

### Demo Mode

JustTheTip works in demo mode without an API:
- Set `NODE_ENV=development`
- Set `JUSTTHETIP_ENABLED=true`
- Leave `JUSTTHETIP_BOT_TOKEN` empty
- Returns mock data for testing

### Profile Page Access

Manage your JustTheTip wallet and tipping through the **Profile Page**:

1. Navigate to your profile from the arena: Click **Profile** button
2. In the profile sidebar, click **🔌 Integrations**
3. Scroll to the JustTheTip section
4. Register your Solana wallet address
5. View balance and tip statistics

**Direct Link**: `/profile.html#integrations`

**Features Available**:
- Wallet registration
- Balance checking (SOL, USDC, LTC)
- Tip statistics (sent/received)
- Transaction history

## Client-Side Integration

### JavaScript Example

```javascript
// Check if integrations are available
fetch('/api/integrations/health')
  .then(res => res.json())
  .then(health => {
    if (health.tiltCheck.enabled) {
      console.log('TiltCheck is available');
    }
    if (health.justTheTip.enabled) {
      console.log('JustTheTip is available');
    }
  });

// Register wallet
async function registerWallet(userId, walletAddress) {
  const response = await fetch('/api/integrations/justthetip/register-wallet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, walletAddress })
  });
  return await response.json();
}

// Send tip
async function sendTip(fromUserId, toUserId, amount) {
  const response = await fetch('/api/integrations/justthetip/tip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fromUserId,
      toUserId,
      amount,
      currency: 'SOL',
      context: {
        gameId: currentGameId,
        reason: 'game_tip'
      }
    })
  });
  return await response.json();
}

// Get player stats
async function getPlayerStats(playerId) {
  const response = await fetch(`/api/integrations/tiltcheck/stats/${playerId}`);
  return await response.json();
}
```

## Deployment

### Vercel (Free Hosting)

Both integrations work with Vercel's free tier:

1. Add environment variables in Vercel Dashboard
2. Deploy as normal
3. Integrations will be available via API endpoints

**Note**: Vercel has WebSocket limitations. For best real-time performance with integrations, consider:
- Railway (recommended)
- Heroku
- Traditional VPS

### Environment Variables for Production

```bash
# TiltCheck (if using)
TILTCHECK_ENABLED=true
TILTCHECK_API_KEY=prod_key_here
TILTCHECK_API_URL=https://api.tiltcheck.it.com

# JustTheTip (if using)
JUSTTHETIP_ENABLED=true
JUSTTHETIP_API_URL=https://api.justthetip.io
JUSTTHETIP_BOT_TOKEN=prod_token_here
```

## Cost Considerations

### TiltCheck Pricing
- **Free**: Demo mode with local detection only
- **Starter**: $299/month (1,000 players)
- **Professional**: $799/month (10,000 players)
- **Enterprise**: Custom pricing

### JustTheTip Costs
- **Integration**: Free (open source SDK)
- **Transaction Fees**: ~0.000005 SOL per transaction (paid by user)
- **No Service Fees**: All transactions are direct on Solana blockchain

## Security Considerations

### TiltCheck
- API keys should be kept secret
- Use environment variables, never commit keys
- API calls are made server-side only

### JustTheTip
- Non-custodial by design - server never handles private keys
- Users sign transactions in their own wallets
- All transactions are on-chain and transparent
- Wallet addresses should be validated before registration

## Support

### TiltCheck Support
- Email: support@tiltcheck.it.com
- Documentation: https://tiltcheck.it.com/docs
- GitHub: https://github.com/jmenichole/TiltCheck

### JustTheTip Support
- GitHub: https://github.com/jmenichole/Justthetip
- Documentation: https://jmenichole.github.io/Justthetip/
- Issues: https://github.com/jmenichole/Justthetip/issues

## Troubleshooting

### TiltCheck Not Working
1. Check `TILTCHECK_ENABLED=true` is set
2. Verify API key is correct
3. Check `/api/integrations/health` endpoint
4. Look for errors in server logs

### JustTheTip Not Working
1. Check `JUSTTHETIP_ENABLED=true` is set
2. Verify Solana addresses are valid (32-44 characters, base58)
3. Check `/api/integrations/health` endpoint
4. Ensure users have registered wallets before tipping

### Demo Mode Issues
- Set `NODE_ENV=development`
- Enable integration without API keys
- Check console logs for demo mode confirmation

## Future Enhancements

- [ ] UI components for tipping in game interface
- [ ] TiltCheck alert notifications in game
- [ ] Automatic airdrops for game winners
- [ ] Leaderboard with tip statistics
- [ ] Tournament mode with prize pools
- [ ] Advanced tilt analytics dashboard
