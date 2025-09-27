const { v4: uuidv4 } = require('uuid');
const DegensAgainstDecencyGame = require('./games/DegensAgainstDecencyGame');
const TwoTruthsAndALieGame = require('./games/TwoTruthsAndALieGame');
const PokerGame = require('./games/PokerGame');

class GameManager {
  constructor(io) {
    this.io = io;
    this.games = new Map();
    this.discordBot = null; // Will be set by server.js
    this.demoBot = null; // Will be set by server.js
    this.gameTypes = {
      'degens-against-decency': DegensAgainstDecencyGame,
      '2-truths-and-a-lie': TwoTruthsAndALieGame,
      'poker': PokerGame
    };
  }

  setDiscordBot(discordBot) {
    this.discordBot = discordBot;
  }

  setDemoBot(demoBot) {
    this.demoBot = demoBot;
  }

  createGame(gameType, creator, isPrivate = false, maxPlayers = 7) {
    if (!this.gameTypes[gameType]) {
      throw new Error('Invalid game type');
    }

    // Enforce player limits: 3-7 players
    maxPlayers = Math.max(3, Math.min(maxPlayers, 7));

    const gameId = uuidv4();
    const GameClass = this.gameTypes[gameType];
    const game = new GameClass(gameId, creator, isPrivate, maxPlayers);
    
    this.games.set(gameId, game);
    
    // Notify lobby of new public game
    if (!isPrivate) {
      this.io.to('lobby').emit('lobby-games', this.getPublicGames());
    }

    // Start demo mode in development environment
    if (process.env.NODE_ENV === 'development' && this.demoBot) {
      console.log(`🎮 Starting demo mode for new game ${gameId}`);
      setTimeout(() => {
        this.demoBot.startDemo(gameId);
      }, 2000); // Small delay to allow creator to join
    }

    return {
      id: gameId,
      type: gameType,
      creator: creator.username,
      isPrivate,
      maxPlayers,
      currentPlayers: 1,
      status: 'waiting',
      inviteLink: isPrivate ? `${process.env.BASE_URL || 'http://localhost:3000'}/game/${gameId}?invite=true` : null
    };
  }

  getGame(gameId) {
    return this.games.get(gameId);
  }

  getPublicGames() {
    const publicGames = [];
    for (const [id, game] of this.games) {
      if (!game.isPrivate && game.status !== 'finished') {
        publicGames.push({
          id,
          type: game.type,
          creator: game.creator.username,
          currentPlayers: game.players.length,
          maxPlayers: game.maxPlayers,
          status: game.status
        });
      }
    }
    return publicGames;
  }

  joinGame(gameId, userId, socket) {
    const game = this.games.get(gameId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    const result = game.addPlayer(userId, socket);
    if (result.success) {
      // Update lobby with current games
      this.io.to('lobby').emit('lobby-games', this.getPublicGames());
      return { success: true, game: game.getGameState() };
    }

    return result;
  }

  leaveGame(gameId, userId) {
    const game = this.games.get(gameId);
    if (!game) return;

    game.removePlayer(userId);
    
    // If game is empty, remove it
    if (game.players.length === 0) {
      this.games.delete(gameId);
    }

    // Update lobby
    this.io.to('lobby').emit('lobby-games', this.getPublicGames());
  }

  handleGameAction(gameId, userId, action) {
    const game = this.games.get(gameId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    const result = game.handleAction(userId, action);
    
    // Send Discord notifications for game events
    if (result.success && this.discordBot) {
      if (action.type === 'start-game') {
        this.discordBot.notifyGameStart(gameId, game);
      } else if (result.gameEnded) {
        // Find winner based on game type
        let winner = null;
        if (game.scores && game.scores.size > 0) {
          const maxScore = Math.max(...game.scores.values());
          for (const [playerId, score] of game.scores) {
            if (score === maxScore) {
              winner = game.players.find(p => p.id === playerId);
              break;
            }
          }
        }
        this.discordBot.notifyGameEnd(gameId, game, winner);
      }
    }
    
    if (result.success) {
      return { success: true, game: game.getGameState() };
    }

    return result;
  }
}

module.exports = GameManager;