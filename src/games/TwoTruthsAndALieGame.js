const BaseGame = require('./BaseGame');
const AICardGenerator = require('../AICardGenerator');

class TwoTruthsAndALieGame extends BaseGame {
  constructor(id, creator, isPrivate, maxPlayers) {
    super(id, creator, isPrivate, maxPlayers);
    this.type = '2-truths-and-a-lie';
    this.aiCardGenerator = new AICardGenerator();
    
    this.prompts = [];
    this.currentPrompt = null;
    this.currentPlayer = null;
    this.statements = [];
    this.guesses = new Map();
    this.maxRounds = 5;
    this.pointsForCorrectGuess = 10;
    this.pointsForFoolingOthers = 5;
  }

  async initializeGame() {
    try {
      // Generate prompts using AI
      this.prompts = await this.aiCardGenerator.generateTwoTruthsPrompts(this.maxRounds * 2);
      
      // Add fallback prompts if needed
      if (this.prompts.length < this.maxRounds) {
        const fallback = this.aiCardGenerator.getFallbackTwoTruthsPrompts();
        this.prompts.push(...fallback);
      }
      
      this.shufflePrompts();
      this.selectCurrentPlayer();
      this.drawPrompt();
      
    } catch (error) {
      console.error('Error initializing 2 Truths game:', error);
      // Use fallback prompts
      this.prompts = this.aiCardGenerator.getFallbackTwoTruthsPrompts();
      this.shufflePrompts();
      this.selectCurrentPlayer();
      this.drawPrompt();
    }
  }

  shufflePrompts() {
    this.prompts = this.prompts.sort(() => Math.random() - 0.5);
  }

  selectCurrentPlayer() {
    if (!this.currentPlayer) {
      this.currentPlayer = this.players[0];
    } else {
      const currentIndex = this.players.findIndex(p => p.id === this.currentPlayer.id);
      const nextIndex = (currentIndex + 1) % this.players.length;
      this.currentPlayer = this.players[nextIndex];
    }
  }

  drawPrompt() {
    if (this.prompts.length > 0) {
      this.currentPrompt = this.prompts.pop();
    }
  }

  handleAction(userId, action) {
    switch (action.type) {
      case 'start-game':
        return this.startGame();
      
      case 'submit-statements':
        if (userId === this.currentPlayer.id) {
          return this.submitStatements(action.statements);
        }
        return { success: false, error: 'Only the current player can submit statements' };
      
      case 'make-guess':
        if (userId !== this.currentPlayer.id) {
          return this.makeGuess(userId, action.lieIndex);
        }
        return { success: false, error: 'The current player cannot guess' };
      
      case 'reveal-results':
        if (userId === this.currentPlayer.id) {
          return this.revealResults(action.lieIndex);
        }
        return { success: false, error: 'Only the current player can reveal results' };
      
      case 'next-turn':
        return this.nextTurn();
      
      default:
        return { success: false, error: 'Unknown action' };
    }
  }

  submitStatements(statements) {
    if (!statements || statements.length !== 3) {
      return { success: false, error: 'Must submit exactly 3 statements' };
    }

    // Validate statements aren't empty
    for (const statement of statements) {
      if (!statement.trim()) {
        return { success: false, error: 'All statements must have content' };
      }
    }

    // Shuffle the statements so the lie position is random
    const shuffledStatements = [...statements].sort(() => Math.random() - 0.5);
    
    this.statements = shuffledStatements.map((text, index) => ({
      id: index,
      text,
      isLie: statements.indexOf(text) === statements.findIndex(s => s === statements[2]) // Assume last is lie
    }));

    this.guesses.clear();
    return { success: true };
  }

  makeGuess(userId, lieIndex) {
    if (lieIndex < 0 || lieIndex >= this.statements.length) {
      return { success: false, error: 'Invalid lie index' };
    }

    if (this.guesses.has(userId)) {
      return { success: false, error: 'You have already made your guess' };
    }

    this.guesses.set(userId, lieIndex);
    return { success: true };
  }

  revealResults(actualLieIndex) {
    if (actualLieIndex < 0 || actualLieIndex >= this.statements.length) {
      return { success: false, error: 'Invalid lie index' };
    }

    // Calculate scores
    let correctGuesses = 0;
    const results = [];

    for (const [playerId, guess] of this.guesses) {
      const wasCorrect = guess === actualLieIndex;
      if (wasCorrect) {
        correctGuesses++;
        const currentScore = this.scores.get(playerId) || 0;
        this.scores.set(playerId, currentScore + this.pointsForCorrectGuess);
      }

      results.push({
        playerId,
        guess,
        wasCorrect
      });
    }

    // Award points to current player for fooling others
    const incorrectGuesses = this.guesses.size - correctGuesses;
    if (incorrectGuesses > 0) {
      const currentScore = this.scores.get(this.currentPlayer.id) || 0;
      this.scores.set(this.currentPlayer.id, currentScore + (incorrectGuesses * this.pointsForFoolingOthers));
    }

    return { 
      success: true, 
      results,
      actualLieIndex,
      pointsAwarded: {
        forCorrectGuesses: correctGuesses * this.pointsForCorrectGuess,
        forFoolingOthers: incorrectGuesses * this.pointsForFoolingOthers
      }
    };
  }

  nextTurn() {
    // Check if all players have had their turn this round
    const playersPerRound = this.players.length;
    const currentTurnInRound = (this.currentRound - 1) * playersPerRound + 
      (this.players.findIndex(p => p.id === this.currentPlayer.id) + 1);

    if (currentTurnInRound >= this.maxRounds * playersPerRound) {
      this.endGame();
      return { success: true, gameEnded: true };
    }

    // Check if round is complete
    if ((currentTurnInRound % playersPerRound) === 0) {
      this.currentRound++;
    }

    this.selectCurrentPlayer();
    this.drawPrompt();
    this.statements = [];
    this.guesses.clear();

    return { success: true };
  }

  endGame() {
    this.status = 'finished';
    
    // Find winner(s)
    let maxScore = 0;
    const winners = [];
    
    for (const [playerId, score] of this.scores) {
      if (score > maxScore) {
        maxScore = score;
        winners.length = 0;
        winners.push(playerId);
      } else if (score === maxScore) {
        winners.push(playerId);
      }
    }

    this.winners = winners;
  }

  getGameState() {
    const baseState = super.getGameState();
    return {
      ...baseState,
      currentPrompt: this.currentPrompt,
      currentPlayer: this.currentPlayer ? { 
        id: this.currentPlayer.id, 
        username: this.currentPlayer.username 
      } : null,
      statements: this.statements,
      guesses: Array.from(this.guesses.entries()).map(([playerId, guess]) => ({
        playerId,
        guess,
        playerName: this.players.find(p => p.id === playerId)?.username || 'Unknown'
      })),
      maxRounds: this.maxRounds,
      winners: this.winners || [],
      allGuessed: this.guesses.size === this.players.length - 1, // All except current player
      phase: this.statements.length === 0 ? 'waiting-for-statements' : 
             this.guesses.size < this.players.length - 1 ? 'guessing' : 'reveal'
    };
  }
}

module.exports = TwoTruthsAndALieGame;