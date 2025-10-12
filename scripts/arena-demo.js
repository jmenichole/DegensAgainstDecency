/**
 * Static demo version for GitHub Pages
 * 
 * Copyright (c) 2024 Degens Against Decency
 * Licensed under the MIT License
 * See LICENSE file in the project root for full license information.
 */

class ArenaDemo {
  constructor() {
    this.user = {
      id: 'demo-user',
      username: 'DemoUser',
      discriminator: '1234',
      avatar: 'https://via.placeholder.com/50x50/ff00ff/ffffff?text=U'
    };
    
    this.demoGames = [
      {
        id: 'demo-1',
        type: 'degens-against-decency',
        creator: 'CyberGamer',
        currentPlayers: 3,
        maxPlayers: 6,
        status: 'waiting',
        isPrivate: false
      },
      {
        id: 'demo-2',
        type: '2-truths-and-a-lie',
        creator: 'NeonPlayer',
        currentPlayers: 4,
        maxPlayers: 5,
        status: 'playing',
        isPrivate: false
      },
      {
        id: 'demo-3',
        type: 'poker',
        creator: 'HighStakes',
        currentPlayers: 7,
        maxPlayers: 7,
        status: 'full',
        isPrivate: false
      }
    ];
    
    this.init();
  }

  init() {
    this.updateUserDisplay();
    this.setupEventListeners();
    this.renderGames();
  }

  updateUserDisplay() {
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    
    if (userAvatar) {
      userAvatar.src = this.user.avatar;
    }
    
    if (userName) {
      userName.textContent = `${this.user.username}#${this.user.discriminator}`;
    }
  }

  setupEventListeners() {
    // Create game form
    const createGameForm = document.getElementById('create-game-form');
    if (createGameForm) {
      createGameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.createDemoGame();
      });
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        alert('This is a demo version. In the full version, this would log you out.');
      });
    }

    // Modal close
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
      modalClose.addEventListener('click', () => {
        this.closeModal();
      });
    }

    // Click outside modal to close
    const modal = document.getElementById('game-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    }
  }

  renderGames() {
    const gamesList = document.getElementById('games-list');
    if (!gamesList) return;

    // Keep existing demo games in HTML, just update if needed
    console.log('Demo arena loaded with', this.demoGames.length, 'demo games');
  }

  formatGameType(type) {
    const gameTypes = {
      'degens-against-decency': 'Degens Against Decency',
      '2-truths-and-a-lie': '2 Truths and a Lie',
      'poker': 'Poker (5-Card Stud)'
    };
    return gameTypes[type] || type;
  }

  formatStatus(status) {
    const statuses = {
      'waiting': 'Waiting',
      'playing': 'In Progress',
      'full': 'Full'
    };
    return statuses[status] || status;
  }

  createDemoGame() {
    const gameType = document.getElementById('game-type').value;
    const maxPlayers = parseInt(document.getElementById('max-players').value);
    const isPrivate = document.getElementById('private-game').checked;

    if (!gameType) {
      alert('Please select a game type');
      return;
    }

    // Show demo message
    const demoMessage = `
🎮 Demo Game Created!

Game Type: ${this.formatGameType(gameType)}
Max Players: ${maxPlayers}
Private: ${isPrivate ? 'Yes' : 'No'}

⚠️ This is a static demo for GitHub Pages.
For real multiplayer functionality, you need to:

1. Deploy the Node.js server from this repository
2. Configure Discord OAuth (optional)
3. Set up a hosting service that supports WebSockets

The full version includes:
✅ Real-time multiplayer games
✅ Discord integration
✅ AI-powered content generation
✅ Live chat and game state synchronization
    `;

    alert(demoMessage);

    // Add a demo game to the list
    this.addDemoGameToList(gameType, maxPlayers, isPrivate);
  }

  addDemoGameToList(gameType, maxPlayers, isPrivate) {
    const gamesList = document.getElementById('games-list');
    if (!gamesList) return;

    // Remove any "no games" message
    const noGamesMsg = gamesList.querySelector('.loading');
    if (noGamesMsg && noGamesMsg.textContent.includes('No active games')) {
      noGamesMsg.remove();
    }

    const gameItem = document.createElement('div');
    gameItem.className = 'game-item waiting';
    gameItem.onclick = () => alert('This is a demo game. Click would normally join the game.');
    
    gameItem.innerHTML = `
      <div class="game-type">${this.formatGameType(gameType)}</div>
      <div class="game-players">1/${maxPlayers} players</div>
      <div class="game-meta">
        <span>Created by ${this.user.username}</span>
        <span class="game-status waiting">Waiting</span>
      </div>
    `;
    
    gamesList.appendChild(gameItem);

    // Reset form
    document.getElementById('create-game-form').reset();
  }

  closeModal() {
    const modal = document.getElementById('game-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }
}

// Initialize demo when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.arenaDemo = new ArenaDemo();
});