class BaseGame {
  constructor(id, creator, isPrivate = false, maxPlayers = 8) {
    this.id = id;
    this.creator = creator;
    this.isPrivate = isPrivate;
    this.maxPlayers = maxPlayers;
    this.players = [creator];
    this.status = 'waiting'; // waiting, playing, finished
    this.createdAt = new Date();
    this.currentRound = 0;
    this.scores = new Map();
  }

  addPlayer(userId, socket) {
    if (this.players.length >= this.maxPlayers) {
      return { success: false, error: 'Game is full' };
    }

    if (this.players.find(p => p.id === userId)) {
      return { success: false, error: 'Player already in game' };
    }

    if (this.status !== 'waiting') {
      return { success: false, error: 'Game already started' };
    }

    const user = { id: userId, socket };
    this.players.push(user);
    this.scores.set(userId, 0);

    return { success: true };
  }

  removePlayer(userId) {
    this.players = this.players.filter(p => p.id !== userId);
    this.scores.delete(userId);

    if (this.players.length === 0) {
      this.status = 'finished';
    }
  }

  startGame() {
    if (this.players.length < 2) {
      return { success: false, error: 'Need at least 2 players to start' };
    }

    this.status = 'playing';
    this.currentRound = 1;
    this.initializeGame();
    
    return { success: true };
  }

  // Override in subclasses
  initializeGame() {}
  handleAction(userId, action) {}
  getGameState() {
    return {
      id: this.id,
      type: this.type,
      creator: this.creator,
      isPrivate: this.isPrivate,
      maxPlayers: this.maxPlayers,
      players: this.players.map(p => ({ id: p.id, username: p.username || 'Player' })),
      status: this.status,
      currentRound: this.currentRound,
      scores: Object.fromEntries(this.scores)
    };
  }
}

module.exports = BaseGame;