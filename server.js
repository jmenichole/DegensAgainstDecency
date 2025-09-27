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

// Initialize game systems
const gameManager = new GameManager(io);
const aiCardGenerator = new AICardGenerator();
const discordBot = new DiscordBot(gameManager, io);
const demoBot = new DemoBot(gameManager, io);

// Connect bots to game manager
gameManager.setDiscordBot(discordBot);
gameManager.setDemoBot(demoBot);

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
    passport.authenticate('discord', { failureRedirect: '/' }),
    (req, res) => res.redirect('/arena')
  );
} else {
  // Fallback routes for development without Discord
  app.get('/auth/discord', (req, res) => {
    res.status(501).json({ error: 'Discord authentication not configured' });
  });
  app.get('/auth/discord/callback', (req, res) => {
    res.redirect('/arena');
  });
}

app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// API routes
app.get('/api/user', (req, res) => {
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
    const guestId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    res.json({
      id: guestId,
      username: `Guest_${guestId.slice(-6)}`,
      discriminator: '0000',
      avatar: null,
      email: null,
      isGuest: true
    });
  }
});

app.get('/api/games', (req, res) => {
  res.json(gameManager.getPublicGames());
});

app.get('/api/games/:gameId', (req, res) => {
  const game = gameManager.getGame(req.params.gameId);
  const isInvite = req.query.invite === 'true';
  
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  // Allow access to private games via invite link
  if (game.isPrivate && !isInvite && !req.isAuthenticated() && process.env.NODE_ENV !== 'development') {
    return res.status(401).json({ error: 'Not authorized to view this private game' });
  }
  
  res.json(game.getGameState());
});

app.post('/api/games', (req, res) => {
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
      const guestId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      user = {
        id: guestId,
        username: `Guest_${guestId.slice(-6)}`,
        discriminator: '0000',
        isGuest: true
      };
    }
  }
  
  const { gameType, isPrivate, maxPlayers } = req.body;
  
  try {
    const game = gameManager.createGame(gameType, user, isPrivate, maxPlayers);
    res.json(game);
  } catch (error) {
    res.status(400).json({ error: error.message });
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

  socket.on('join-game', (gameId) => {
    const result = gameManager.joinGame(gameId, socket.userId, socket);
    if (result.success) {
      socket.join(gameId);
      socket.gameId = gameId;
      io.to(gameId).emit('game-update', result.game);
    } else {
      socket.emit('error', result.error);
    }
  });

  socket.on('leave-game', () => {
    if (socket.gameId) {
      gameManager.leaveGame(socket.gameId, socket.userId);
      socket.leave(socket.gameId);
      io.to(socket.gameId).emit('game-update', gameManager.getGame(socket.gameId));
      socket.gameId = null;
    }
  });

  socket.on('game-action', (data) => {
    if (socket.gameId) {
      const result = gameManager.handleGameAction(socket.gameId, socket.userId, data);
      if (result.success) {
        io.to(socket.gameId).emit('game-update', result.game);
      } else {
        socket.emit('error', result.error);
      }
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
      gameManager.leaveGame(socket.gameId, socket.userId);
      io.to(socket.gameId).emit('game-update', gameManager.getGame(socket.gameId));
    }
  });
});

server.listen(PORT, () => {
  console.log(`🎮 Degens Against Decency Arena running on http://localhost:${PORT}`);
  console.log('🔗 Visit http://localhost:3000 to start playing!');
});
