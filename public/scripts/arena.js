/**
 * Arena management and game lobby
 * 
 * Copyright (c) 2024 Degens Against Decency
 * Licensed under the MIT License
 * See LICENSE file in the project root for full license information.
 */

class ArenaManager {
  constructor() {
    this.socket = null;
    this.user = null;
    this.games = [];
    this.init();
  }

  async init() {
    await this.loadUser();
    this.setupSocket();
    this.setupEventListeners();
  }

  async loadUser() {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        this.user = await response.json();
        this.updateUserDisplay();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to load user:', errorData);
        alert(`Authentication error: ${errorData.message || errorData.error || 'Failed to authenticate. Please try again.'}`);
        // Still allow guest access in production
        if (response.status === 401 || response.status === 403) {
          // Try to proceed as guest
          this.user = {
            id: `guest-${Date.now()}`,
            username: 'Guest',
            discriminator: '0000',
            isGuest: true
          };
          this.updateUserDisplay();
        } else {
          window.location.href = '/';
        }
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      alert(`Network error: Unable to connect to server. Please check your connection and try again.`);
      // Redirect to home page after showing error
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
  }

  setupSocket() {
    this.socket = io();

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.socket.emit('join-lobby', this.user.id);
    });

    this.socket.on('lobby-games', (games) => {
      this.games = games;
      this.renderGames();
    });

    this.socket.on('game-created', (game) => {
      // Redirect to the new game
      window.location.href = `/game/${game.id}`;
    });

    this.socket.on('error', (error) => {
      alert(`Error: ${error}`);
    });
  }

  setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('/auth/logout');
        window.location.href = '/';
      } catch (error) {
        console.error('Logout failed:', error);
      }
    });

    // Create game form
    const createGameForm = document.getElementById('create-game-form');
    createGameForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.createGame();
    });

    // Modal close
    const modalClose = document.querySelector('.modal-close');
    const modal = document.getElementById('game-modal');
    
    modalClose.addEventListener('click', () => {
      modal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  }

  updateUserDisplay() {
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');

    if (userName && this.user) {
      userName.textContent = `${this.user.username}#${this.user.discriminator}`;
    }

    if (userAvatar && this.user) {
      if (this.user.avatar) {
        userAvatar.src = `https://cdn.discordapp.com/avatars/${this.user.id}/${this.user.avatar}.png?size=128`;
      } else {
        const defaultAvatarIndex = parseInt(this.user.discriminator) % 5;
        userAvatar.src = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`;
      }
    }
  }

  renderGames() {
    const gamesList = document.getElementById('games-list');
    
    if (this.games.length === 0) {
      gamesList.innerHTML = '<div class="loading">No active games. Create one to get started!</div>';
      return;
    }

    gamesList.innerHTML = this.games.map(game => `
      <div class="game-item ${game.status} ${game.currentPlayers >= game.maxPlayers ? 'full' : ''}" 
           data-game-id="${game.id}" onclick="arenaManager.joinGame('${game.id}')">
        <div class="game-type">${this.formatGameType(game.type)}</div>
        <div class="game-players">${game.currentPlayers}/${game.maxPlayers} players</div>
        <div class="game-meta">
          <span>Created by ${game.creator}</span>
          <span class="game-status ${game.status}">${this.formatStatus(game.status)}</span>
        </div>
      </div>
    `).join('');
  }

  formatGameType(type) {
    const types = {
      'degens-against-decency': 'Degens Against Decency',
      '2-truths-and-a-lie': '2 Truths and a Lie',
      'poker': 'Poker (5-Card Stud)'
    };
    return types[type] || type;
  }

  formatStatus(status) {
    const statuses = {
      'waiting': 'Waiting for Players',
      'playing': 'In Progress',
      'finished': 'Finished'
    };
    return statuses[status] || status;
  }

  async createGame() {
    const form = document.getElementById('create-game-form');
    const formData = new FormData(form);
    
    const gameData = {
      gameType: formData.get('gameType'),
      maxPlayers: parseInt(formData.get('maxPlayers')),
      isPrivate: formData.get('isPrivate') === 'on'
    };

    // Validate game type is selected
    if (!gameData.gameType) {
      alert('Please select a game type');
      return;
    }

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(gameData)
      });

      if (response.ok) {
        const game = await response.json();
        
        // If it's a private game, show the invite link
        if (game.isPrivate && game.inviteLink) {
          const shareInvite = confirm(`Private game created! Click OK to copy the invite link to share with friends.\n\nInvite Link: ${game.inviteLink}`);
          if (shareInvite) {
            navigator.clipboard.writeText(game.inviteLink).then(() => {
              alert('Invite link copied to clipboard!');
            }).catch(() => {
              // Fallback if clipboard API fails
              prompt('Copy this invite link:', game.inviteLink);
            });
          }
        }
        
        // Redirect to the new game
        window.location.href = `/game/${game.id}`;
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        alert(`Failed to create game: ${errorData.message || errorData.error || 'Please try again'}`);
      }
    } catch (error) {
      console.error('Failed to create game:', error);
      alert('Network error: Unable to create game. Please check your connection and try again.');
    }
  }

  joinGame(gameId) {
    const game = this.games.find(g => g.id === gameId);
    if (!game) return;

    if (game.currentPlayers >= game.maxPlayers) {
      alert('This game is full!');
      return;
    }

    // Redirect to game page
    window.location.href = `/game/${gameId}`;
  }
}

// Initialize arena manager when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.arenaManager = new ArenaManager();
});