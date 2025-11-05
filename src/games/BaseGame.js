/**
 * Base Game - Base class for all game types
 * 
 * Copyright (c) 2024 Degens Against Decency
 * Licensed under the MIT License
 * See LICENSE file in the project root for full license information.
 */

class BaseGame {
  constructor(id, creator, isPrivate = false, maxPlayers = 7) {
    this.id = id;
    this.creator = creator;
    this.isPrivate = isPrivate;
    this.maxPlayers = Math.min(maxPlayers, 7); // Enforce maximum of 7 players
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

    if (this.status !== 'waiting') {
      return { success: false, error: 'Game already started' };
    }

    // Handle different types of users
    let user;
    
    if (typeof userId === 'object') {
      // Discord user object passed directly
      // Check for duplicate by ID
      if (this.players.find(p => p.id === userId.id)) {
        return { success: false, error: 'Player already in game' };
      }
      user = { 
        ...userId,
        socketId: socket ? socket.id : null
      };
    } else if (!userId) {
      // Generate userId if not provided (for socket connections without proper user setup)
      const guestId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      user = { 
        id: guestId, 
        username: `Guest_${guestId.slice(-6)}`,
        socketId: socket ? socket.id : null
      };
    } else {
      // Regular userId string
      // Check for duplicate by ID
      if (this.players.find(p => p.id === userId)) {
        return { success: false, error: 'Player already in game' };
      }
      user = { 
        id: userId, 
        username: userId.startsWith('guest-') ? `Guest_${userId.slice(-6)}` : `Player_${userId.slice(-4)}`,
        socketId: socket ? socket.id : null
      };
    }
    
    this.players.push(user);
    this.scores.set(user.id, 0);

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
    // Allow 2 players in development mode for testing
    const minPlayers = process.env.NODE_ENV === 'development' ? 2 : 3;
    if (this.players.length < minPlayers) {
      return { success: false, error: `Need at least ${minPlayers} players to start` };
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