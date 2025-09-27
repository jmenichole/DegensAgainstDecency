class DemoBot {
  constructor(gameManager, io) {
    this.gameManager = gameManager;
    this.io = io;
    this.bots = new Map(); // gameId -> bot state
    this.demoActions = new Map(); // gameId -> interval
    this.botNames = [
      'DemoBot_Alpha', 
      'DemoBot_Beta', 
      'DemoBot_Gamma', 
      'DemoBot_Delta',
      'DemoBot_Echo'
    ];
  }

  // Start demo mode for a game
  startDemo(gameId) {
    console.log(`🤖 Starting demo mode for game ${gameId}`);
    
    const game = this.gameManager.getGame(gameId);
    if (!game) return;

    // Add demo bots to reach minimum players
    this.addDemoBots(gameId);
    
    // Start automated actions after a delay
    setTimeout(() => {
      this.startAutomatedActions(gameId);
    }, 3000);
  }

  addDemoBots(gameId) {
    const game = this.gameManager.getGame(gameId);
    if (!game) return;

    const botsNeeded = Math.max(0, 3 - game.players.length);
    console.log(`🤖 Adding ${botsNeeded} demo bots to game ${gameId}`);

    for (let i = 0; i < botsNeeded; i++) {
      const botUser = {
        id: `demo-bot-${Date.now()}-${i}`,
        username: this.botNames[i % this.botNames.length],
        discriminator: String(1000 + i).padStart(4, '0'),
        avatar: null,
        isBot: true
      };

      // Create a mock socket for the bot
      const mockSocket = {
        id: `bot-socket-${i}`,
        emit: () => {},
        join: () => {},
        leave: () => {}
      };

      const result = this.gameManager.joinGame(gameId, botUser, mockSocket);
      if (result.success) {
        console.log(`🤖 Bot ${botUser.username} joined game ${gameId}`);
      }
    }

    // Emit game update
    this.io.to(gameId).emit('game-update', game.getGameState());
  }

  startAutomatedActions(gameId) {
    const game = this.gameManager.getGame(gameId);
    if (!game || game.status === 'finished') return;

    // Start the game if we're still waiting
    if (game.status === 'waiting' && game.players.length >= 3) {
      console.log(`🤖 Auto-starting game ${gameId}`);
      const result = this.gameManager.handleGameAction(gameId, game.creator.id, { type: 'start-game' });
      if (result.success) {
        this.io.to(gameId).emit('game-update', result.game);
      }
    }

    // Set up periodic actions based on game type
    const actionInterval = setInterval(() => {
      this.performDemoAction(gameId);
    }, 5000); // Every 5 seconds

    this.demoActions.set(gameId, actionInterval);

    // Clean up after a demo period
    setTimeout(() => {
      this.stopDemo(gameId);
    }, 120000); // 2 minutes of demo
  }

  performDemoAction(gameId) {
    const game = this.gameManager.getGame(gameId);
    if (!game || game.status === 'finished') {
      this.stopDemo(gameId);
      return;
    }

    switch (game.type) {
      case 'degens-against-decency':
        this.performDegensAction(gameId, game);
        break;
      case '2-truths-and-a-lie':
        this.performTwoTruthsAction(gameId, game);
        break;
      case 'poker':
        this.performPokerAction(gameId, game);
        break;
    }
  }

  performDegensAction(gameId, game) {
    if (game.status !== 'playing') return;

    // Find bots that haven't submitted cards yet
    const bots = game.players.filter(p => p.isBot);
    const gameState = game.getGameState();

    for (const bot of bots) {
      // Check if bot hasn't submitted and it's not the card czar
      const hasSubmitted = gameState.submissions.some(sub => sub.playerId === bot.id);
      
      if (!hasSubmitted && gameState.cardCzar?.id !== bot.id) {
        const botHand = gameState.playerHands[bot.id];
        if (botHand && botHand.length > 0) {
          // Submit a random card
          const randomCard = botHand[Math.floor(Math.random() * botHand.length)];
          console.log(`🤖 Bot ${bot.username} submitting card`);
          
          const result = this.gameManager.handleGameAction(gameId, bot.id, {
            type: 'submit-card',
            cardId: randomCard.id
          });
          
          if (result.success) {
            this.io.to(gameId).emit('game-update', result.game);
          }
          break; // Only one action per cycle
        }
      }
    }

    // If all players have submitted, have card czar judge
    if (gameState.allSubmitted && gameState.cardCzar?.isBot) {
      if (gameState.submissions.length > 0) {
        const randomWinner = gameState.submissions[Math.floor(Math.random() * gameState.submissions.length)];
        console.log(`🤖 Card Czar ${gameState.cardCzar.username} judging submission`);
        
        const result = this.gameManager.handleGameAction(gameId, gameState.cardCzar.id, {
          type: 'judge-submission',
          playerId: randomWinner.playerId
        });
        
        if (result.success) {
          this.io.to(gameId).emit('game-update', result.game);
        }
      }
    }
  }

  performTwoTruthsAction(gameId, game) {
    const gameState = game.getGameState();
    
    // If it's a bot's turn to create statements
    if (gameState.currentPlayer?.isBot && gameState.status === 'playing') {
      const sampleStatements = [
        "I once ate 15 hamburgers in one sitting",
        "I have been to 12 different countries",
        "I can speak 4 languages fluently",
        "I have never broken a bone in my body",
        "I once met a famous celebrity at a coffee shop",
        "I have run a marathon in under 3 hours"
      ];

      // Generate 3 random statements (2 truths, 1 lie)
      const shuffled = [...sampleStatements].sort(() => Math.random() - 0.5);
      const statements = shuffled.slice(0, 3);
      
      console.log(`🤖 Bot ${gameState.currentPlayer.username} submitting statements`);
      
      const result = this.gameManager.handleGameAction(gameId, gameState.currentPlayer.id, {
        type: 'submit-statements',
        statements: statements
      });
      
      if (result.success) {
        this.io.to(gameId).emit('game-update', result.game);
      }
    }

    // Have bots make guesses
    const bots = game.players.filter(p => p.isBot && p.id !== gameState.currentPlayer?.id);
    for (const bot of bots) {
      // Check if bot hasn't guessed yet
      const hasGuessed = gameState.guesses && Object.prototype.hasOwnProperty.call(gameState.guesses, bot.id);
      
      if (!hasGuessed && gameState.statements && gameState.statements.length > 0) {
        const randomGuess = Math.floor(Math.random() * 3); // 0, 1, or 2
        console.log(`🤖 Bot ${bot.username} making guess: ${randomGuess}`);
        
        const result = this.gameManager.handleGameAction(gameId, bot.id, {
          type: 'submit-guess',
          lieIndex: randomGuess
        });
        
        if (result.success) {
          this.io.to(gameId).emit('game-update', result.game);
        }
        break; // One action per cycle
      }
    }
  }

  performPokerAction(gameId, game) {
    const gameState = game.getGameState();
    
    if (gameState.currentPlayer?.isBot && gameState.status === 'playing') {
      const actions = ['fold', 'call', 'check'];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      console.log(`🤖 Bot ${gameState.currentPlayer.username} performing: ${randomAction}`);
      
      const result = this.gameManager.handleGameAction(gameId, gameState.currentPlayer.id, {
        type: randomAction
      });
      
      if (result.success) {
        this.io.to(gameId).emit('game-update', result.game);
      }
    }
  }

  stopDemo(gameId) {
    console.log(`🤖 Stopping demo for game ${gameId}`);
    
    // Clear intervals
    const interval = this.demoActions.get(gameId);
    if (interval) {
      clearInterval(interval);
      this.demoActions.delete(gameId);
    }

    // Remove bot state
    this.bots.delete(gameId);

    // Optionally restart the demo cycle
    setTimeout(() => {
      const game = this.gameManager.getGame(gameId);
      if (game && game.status !== 'finished') {
        this.restartDemo(gameId);
      }
    }, 10000); // Wait 10 seconds before restarting
  }

  restartDemo(gameId) {
    console.log(`🤖 Restarting demo for game ${gameId}`);
    
    const game = this.gameManager.getGame(gameId);
    if (!game) return;

    // Reset game state for continuous demo
    game.status = 'waiting';
    game.currentRound = 0;
    
    // Emit update and restart
    this.io.to(gameId).emit('game-update', game.getGameState());
    
    setTimeout(() => {
      this.startDemo(gameId);
    }, 2000);
  }
}

module.exports = DemoBot;