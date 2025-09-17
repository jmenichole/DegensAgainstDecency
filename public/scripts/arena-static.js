// Static-friendly arena management for GitHub Pages
class StaticArenaManager {
  constructor() {
    this.games = [];
    this.user = this.getDemoUser();
    this.init();
  }

  init() {
    this.setupUI();
    this.setupEventListeners();
    this.loadDemoGames();
  }

  getDemoUser() {
    // Try to get demo user from the auth manager or create one
    if (window.authManager && window.authManager.getUser()) {
      return window.authManager.getUser();
    }
    return {
      id: 'demo-user-123',
      username: 'DemoPlayer',
      discriminator: '0001',
      avatar: null
    };
  }

  setupUI() {
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');
    
    if (userName && this.user) {
      userName.textContent = `${this.user.username}#${this.user.discriminator}`;
    }
    
    if (userAvatar && this.user) {
      const defaultAvatarIndex = parseInt(this.user.discriminator) % 5;
      userAvatar.src = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`;
    }

    // Add demo mode banner
    this.addDemoBanner();
  }

  addDemoBanner() {
    const container = document.querySelector('.arena-container');
    if (container && !document.getElementById('demo-banner')) {
      const banner = document.createElement('div');
      banner.id = 'demo-banner';
      banner.style.cssText = `
        background: linear-gradient(135deg, #ff6b6b, #feca57);
        color: white;
        text-align: center;
        padding: 10px;
        font-weight: bold;
        margin-bottom: 20px;
        border-radius: 5px;
      `;
      banner.innerHTML = '🚀 GitHub Pages Demo Mode - Real multiplayer requires server deployment';
      container.insertBefore(banner, container.firstChild);
    }
  }

  setupEventListeners() {
    const createGameForm = document.getElementById('create-game-form');
    const logoutBtn = document.getElementById('logout-btn');

    if (createGameForm) {
      createGameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.createDemoGame(e);
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    }
  }

  loadDemoGames() {
    const demoGames = [
      {
        id: 'demo-game-1',
        type: 'degens-against-decency',
        creator: 'GameMaster',
        currentPlayers: 3,
        maxPlayers: 6,
        status: 'waiting'
      },
      {
        id: 'demo-game-2',
        type: '2-truths-and-a-lie',
        creator: 'TruthTeller',
        currentPlayers: 2,
        maxPlayers: 4,
        status: 'playing'
      },
      {
        id: 'demo-game-3',
        type: 'poker',
        creator: 'PokerFace',
        currentPlayers: 5,
        maxPlayers: 8,
        status: 'waiting'
      }
    ];

    this.games = demoGames;
    this.updateGamesList();
  }

  updateGamesList() {
    const gamesList = document.getElementById('games-list');
    if (!gamesList) return;

    if (this.games.length === 0) {
      gamesList.innerHTML = `
        <div class="no-games">
          <p>🎮 No games available</p>
          <p>Create a new game to get started!</p>
        </div>
      `;
      return;
    }

    gamesList.innerHTML = this.games.map(game => `
      <div class="game-item" data-game-id="${game.id}">
        <div class="game-info">
          <h3>${this.formatGameType(game.type)}</h3>
          <p>Created by: ${game.creator}</p>
          <p>Players: ${game.currentPlayers}/${game.maxPlayers}</p>
          <span class="status status-${game.status}">${this.formatStatus(game.status)}</span>
        </div>
        <div class="game-actions">
          <button class="join-btn ${game.status === 'playing' ? 'disabled' : ''}" 
                  onclick="arenaManager.joinDemoGame('${game.id}')"
                  ${game.status === 'playing' ? 'disabled' : ''}>
            ${game.status === 'waiting' ? 'Join Game' : 'Spectate'}
          </button>
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
      'finished': 'Game Finished'
    };
    return statuses[status] || status;
  }

  createDemoGame(event) {
    const formData = new FormData(event.target);
    const gameData = {
      type: formData.get('gameType'),
      maxPlayers: parseInt(formData.get('maxPlayers')),
      isPrivate: formData.get('isPrivate') === 'on'
    };

    if (!gameData.type) {
      alert('Please select a game type!');
      return;
    }

    // Show demo message
    alert(`🎮 Demo Game Created!

In a full deployment, this would:
• Create a real multiplayer game
• Generate a unique game ID  
• Allow other players to join
• Enable real-time gameplay

Game Type: ${this.formatGameType(gameData.type)}
Max Players: ${gameData.maxPlayers}
Private: ${gameData.isPrivate ? 'Yes' : 'No'}

Try joining one of the existing demo games!`);

    // Add the game to our demo list
    const newGame = {
      id: `demo-game-${Date.now()}`,
      type: gameData.type,
      creator: this.user.username,
      currentPlayers: 1,
      maxPlayers: gameData.maxPlayers,
      status: 'waiting'
    };

    this.games.unshift(newGame);
    this.updateGamesList();
    event.target.reset();
  }

  joinDemoGame(gameId) {
    const game = this.games.find(g => g.id === gameId);
    if (!game) return;

    if (game.status === 'playing') {
      alert('🎮 Game in Progress\n\nIn a full deployment, you could spectate this game!');
      return;
    }

    // Show demo message and redirect to game page
    alert(`🎮 Joining Demo Game!

Game: ${this.formatGameType(game.type)}
Creator: ${game.creator}
Players: ${game.currentPlayers}/${game.maxPlayers}

In a full deployment, you would now join the real multiplayer game.
Redirecting to game interface demo...`);

    // Redirect to game page with demo parameters
    window.location.href = `game.html?demo=true&type=${game.type}&gameId=${gameId}`;
  }
}

// Initialize arena manager when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.arenaManager = new StaticArenaManager();
});

// Add some CSS for the game list styling
const style = document.createElement('style');
style.textContent = `
  .game-list {
    display: grid;
    gap: 15px;
    margin-top: 20px;
  }

  .game-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.1);
    padding: 20px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .game-info h3 {
    margin: 0 0 5px 0;
    color: #fff;
  }

  .game-info p {
    margin: 2px 0;
    color: #ccc;
    font-size: 0.9em;
  }

  .status {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    font-weight: bold;
    margin-top: 5px;
  }

  .status-waiting {
    background: rgba(40, 167, 69, 0.3);
    color: #28a745;
    border: 1px solid #28a745;
  }

  .status-playing {
    background: rgba(255, 193, 7, 0.3);
    color: #ffc107;
    border: 1px solid #ffc107;
  }

  .join-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
  }

  .join-btn:hover:not(.disabled) {
    background: #0056b3;
  }

  .join-btn.disabled {
    background: #6c757d;
    cursor: not-allowed;
  }

  .no-games {
    text-align: center;
    padding: 40px;
    color: #ccc;
  }
`;
document.head.appendChild(style);