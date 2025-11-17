/**
 * Degens Against Decency - Game Arena Server
 * 
 * Copyright (c) 2024 Degens Against Decency
 * Licensed under the MIT License
 * See LICENSE file in the project root for full license information.
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 3000;

// Import game modules
const GameManager = require('./src/GameManager');
const AICardGenerator = require('./src/AICardGenerator');
const DiscordBot = require('./src/DiscordBot');
const DemoBot = require('./src/DemoBot');
const IntegrationManager = require('./src/integrations/IntegrationManager');

// Initialize game systems
const gameManager = new GameManager(io);
const aiCardGenerator = new AICardGenerator();
const discordBot = new DiscordBot(gameManager, io);
const demoBot = new DemoBot(gameManager, io);
const integrationManager = new IntegrationManager();

// Connect bots to game manager
gameManager.setDiscordBot(discordBot);
gameManager.setDemoBot(demoBot);
gameManager.setIntegrationManager(integrationManager);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Passport configuration - only if Discord credentials are provided
if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    const user = {
      id: profile.id,
      username: profile.username,
      discriminator: profile.discriminator,
      avatar: profile.avatar,
      email: profile.email
    };
    return done(null, user);
  }));
} else {
  console.log('⚠️  Discord OAuth not configured - running in development mode with guest users');
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Authentication routes - only if Discord is configured
if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  app.get('/auth/discord', passport.authenticate('discord'));
  app.get('/auth/discord/callback', 
    passport.authenticate('discord', { failureRedirect: '/?error=auth_failed' }),
    (req, res) => res.redirect('/arena')
  );
} else {
  // Fallback routes for development without Discord
  app.get('/auth/discord', (req, res) => {
    res.status(501).json({ 
      error: 'Discord authentication not configured', 
      message: 'Discord OAuth is not set up. You can still use the app as a guest user by visiting /arena directly.' 
    });
  });
  app.get('/auth/discord/callback', (req, res) => {
    res.redirect('/arena');
  });
}

app.get('/auth/logout', (req, res) => {
  try {
    req.logout(() => {
      res.redirect('/');
    });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ error: 'Failed to logout', message: error.message });
  }
});

// API routes
app.get('/api/user', (req, res) => {
  try {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else if (process.env.NODE_ENV === 'development') {
      // Demo mode for development
      res.json({
        id: 'demo-user-123',
        username: 'DemoPlayer',
        discriminator: '0001',
        avatar: null,
        email: 'demo@example.com'
      });
    } else {
      // For non-authenticated users, create a guest user
      const guestId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      res.json({
        id: guestId,
        username: `Guest_${guestId.slice(-6)}`,
        discriminator: '0000',
        avatar: null,
        email: null,
        isGuest: true
      });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to retrieve user information', message: error.message });
  }
});

app.get('/api/games', (req, res) => {
  try {
    const games = gameManager.getPublicGames();
    res.json(games || []);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to retrieve games', message: error.message });
  }
});

app.get('/api/games/:gameId', (req, res) => {
  try {
    const game = gameManager.getGame(req.params.gameId);
    const isInvite = req.query.invite === 'true';
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found', message: 'The requested game does not exist or has ended' });
    }
    
    // Allow access to private games via invite link
    if (game.isPrivate && !isInvite && !req.isAuthenticated() && process.env.NODE_ENV !== 'development') {
      return res.status(401).json({ error: 'Not authorized to view this private game', message: 'This is a private game. Use an invite link to join.' });
    }
    
    res.json(game.getGameState());
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ error: 'Failed to retrieve game', message: error.message });
  }
});

app.post('/api/games', (req, res) => {
  try {
    let user = req.user;
    
    // If not authenticated, create a guest user
    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        user = {
          id: 'demo-user-123',
          username: 'DemoPlayer',
          discriminator: '0001'
        };
      } else {
        const guestId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
        user = {
          id: guestId,
          username: `Guest_${guestId.slice(-6)}`,
          discriminator: '0000',
          isGuest: true
        };
      }
    }
    
    const { gameType, isPrivate, maxPlayers } = req.body;
    
    // Validate required fields
    if (!gameType) {
      return res.status(400).json({ error: 'Game type is required', message: 'Please select a game type' });
    }
    
    const game = gameManager.createGame(gameType, user, isPrivate, maxPlayers);
    res.json(game);
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(400).json({ error: 'Failed to create game', message: error.message });
  }
});

// Integration API endpoints
app.get('/api/integrations/health', (req, res) => {
  try {
    const health = integrationManager.getHealthStatus();
    res.json(health);
  } catch (error) {
    console.error('Error fetching integration health:', error);
    res.status(500).json({ error: 'Failed to retrieve integration health', message: error.message });
  }
});

app.post('/api/integrations/tiltcheck/register', async (req, res) => {
  try {
    const { playerId, options } = req.body;
    if (!integrationManager.tiltCheck.enabled) {
      return res.status(503).json({ error: 'TiltCheck integration not enabled' });
    }
    const result = await integrationManager.tiltCheck.trackPlayer(playerId, options);
    res.json(result);
  } catch (error) {
    console.error('TiltCheck registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/integrations/tiltcheck/stats/:playerId', async (req, res) => {
  try {
    if (!integrationManager.tiltCheck.enabled) {
      return res.status(503).json({ error: 'TiltCheck integration not enabled' });
    }
    const stats = await integrationManager.tiltCheck.getPlayerStats(req.params.playerId);
    res.json(stats || { error: 'Player not found' });
  } catch (error) {
    console.error('TiltCheck stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/integrations/justthetip/register-wallet', async (req, res) => {
  try {
    const { userId, walletAddress } = req.body;
    if (!integrationManager.justTheTip.enabled) {
      return res.status(503).json({ error: 'JustTheTip integration not enabled' });
    }
    const result = await integrationManager.justTheTip.registerWallet(userId, walletAddress);
    res.json(result);
  } catch (error) {
    console.error('JustTheTip wallet registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/integrations/justthetip/tip', async (req, res) => {
  try {
    const { fromUserId, toUserId, amount, currency, context } = req.body;
    if (!integrationManager.justTheTip.enabled) {
      return res.status(503).json({ error: 'JustTheTip integration not enabled' });
    }
    const result = await integrationManager.justTheTip.createTip(fromUserId, toUserId, amount, currency, context);
    res.json(result);
  } catch (error) {
    console.error('JustTheTip tip creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/integrations/justthetip/balance/:userId', async (req, res) => {
  try {
    if (!integrationManager.justTheTip.enabled) {
      return res.status(503).json({ error: 'JustTheTip integration not enabled' });
    }
    const balance = await integrationManager.justTheTip.getBalance(req.params.userId);
    res.json(balance);
  } catch (error) {
    console.error('JustTheTip balance query error:', error);
    res.status(500).json({ error: error.message });
  }
});

// AI Gateway statistics endpoint
app.get('/api/ai-gateway/stats', (req, res) => {
  try {
    const stats = aiCardGenerator.getAIGatewayStats();
    res.json(stats);
  } catch (error) {
    console.error('AI Gateway stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve AI Gateway statistics', message: error.message });
  }
});

// Serve different pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/arena', (req, res) => {
  // Allow access to arena for public games, even without authentication
  res.sendFile(path.join(__dirname, 'public', 'arena.html'));
});

app.get('/game/:gameId', (req, res) => {
  const game = gameManager.getGame(req.params.gameId);
  const isInvite = req.query.invite === 'true';
  
  // Allow access to private games via invite link, or if authenticated/dev mode
  if (game && game.isPrivate && isInvite) {
    // Allow access to private game via invite link
    res.sendFile(path.join(__dirname, 'public', 'game.html'));
  } else if (!req.isAuthenticated() && process.env.NODE_ENV !== 'development') {
    return res.redirect('/');
  } else {
    res.sendFile(path.join(__dirname, 'public', 'game.html'));
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-lobby', (userId) => {
    socket.userId = userId;
    socket.join('lobby');
    socket.emit('lobby-games', gameManager.getPublicGames());
  });

  socket.on('request-lobby-update', () => {
    if (socket.userId) {
      socket.emit('lobby-games', gameManager.getPublicGames());
    }
  });

  socket.on('join-game', (gameId) => {
    const result = gameManager.joinGame(gameId, socket.userId, socket);
    if (result.success) {
      socket.join(gameId);
      socket.gameId = gameId;
      socket.isSpectator = false;
      io.to(gameId).emit('game-update', result.game);
      // Update lobby when player joins
      io.to('lobby').emit('lobby-games', gameManager.getPublicGames());
    } else {
      socket.emit('error', result.error);
    }
  });

  socket.on('spectate-game', (gameId) => {
    const result = gameManager.spectateGame(gameId, socket.userId, socket);
    if (result.success) {
      socket.join(gameId);
      socket.gameId = gameId;
      socket.isSpectator = true;
      socket.emit('game-update', result.game);
      socket.emit('spectator-mode', true);
      // Update lobby when spectator joins
      io.to('lobby').emit('lobby-games', gameManager.getPublicGames());
    } else {
      socket.emit('error', result.error);
    }
  });

  socket.on('leave-game', () => {
    if (socket.gameId) {
      if (socket.isSpectator) {
        gameManager.leaveSpectator(socket.gameId, socket.userId);
      } else {
        gameManager.leaveGame(socket.gameId, socket.userId);
      }
      socket.leave(socket.gameId);
      const game = gameManager.getGame(socket.gameId);
      if (game) {
        io.to(socket.gameId).emit('game-update', game.getGameState());
      }
      // Update lobby when player/spectator leaves
      io.to('lobby').emit('lobby-games', gameManager.getPublicGames());
      socket.gameId = null;
      socket.isSpectator = false;
    }
  });

  socket.on('game-action', (data) => {
    if (socket.gameId && !socket.isSpectator) {
      const result = gameManager.handleGameAction(socket.gameId, socket.userId, data);
      if (result.success) {
        io.to(socket.gameId).emit('game-update', result.game);
        // Update lobby when game status changes
        io.to('lobby').emit('lobby-games', gameManager.getPublicGames());
      } else {
        socket.emit('error', result.error);
      }
    } else if (socket.isSpectator) {
      socket.emit('error', 'Spectators cannot perform game actions');
    }
  });

  socket.on('chat-message', (data) => {
    if (socket.gameId) {
      // Broadcast chat message to all players in the game
      io.to(socket.gameId).emit('chat-message', {
        sender: data.sender,
        text: data.message,
        timestamp: new Date()
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.gameId) {
      if (socket.isSpectator) {
        gameManager.leaveSpectator(socket.gameId, socket.userId);
      } else {
        gameManager.leaveGame(socket.gameId, socket.userId);
      }
      const game = gameManager.getGame(socket.gameId);
      if (game) {
        io.to(socket.gameId).emit('game-update', game.getGameState());
      }
      // Update lobby when player/spectator disconnects
      io.to('lobby').emit('lobby-games', gameManager.getPublicGames());
    }
  });
});

server.listen(PORT, () => {
  console.log(`🎮 Degens Against Decency Arena running on http://localhost:${PORT}`);
  console.log('🔗 Visit http://localhost:3000 to start playing!');
});
