// Static-friendly game interface for GitHub Pages
class StaticGameManager {
  constructor() {
    this.gameType = this.getGameTypeFromURL();
    this.gameId = this.getGameIdFromURL();
    this.user = this.getDemoUser();
    this.isDemo = true;
    this.init();
  }

  init() {
    this.setupUI();
    this.setupEventListeners();
    this.loadDemoGame();
  }

  getGameTypeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('type') || 'degens-against-decency';
  }

  getGameIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('gameId') || 'demo-game-1';
  }

  getDemoUser() {
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
    const gameTitle = document.getElementById('game-title');
    const playerName = document.getElementById('player-name');
    const playerAvatar = document.getElementById('player-avatar');

    if (gameTitle) {
      gameTitle.textContent = `${this.formatGameType(this.gameType)} (Demo)`;
    }

    if (playerName && this.user) {
      playerName.textContent = `${this.user.username}#${this.user.discriminator}`;
    }

    if (playerAvatar && this.user) {
      const defaultAvatarIndex = parseInt(this.user.discriminator) % 5;
      playerAvatar.src = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`;
    }

    this.addDemoBanner();
  }

  addDemoBanner() {
    const container = document.querySelector('.game-container');
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
        position: relative;
        z-index: 1000;
      `;
      banner.innerHTML = '🎮 Demo Mode - Simulated gameplay for GitHub Pages';
      container.insertBefore(banner, container.firstChild);
    }
  }

  setupEventListeners() {
    const leaveGame = document.getElementById('leave-game');
    const sendChat = document.getElementById('send-chat');
    const chatInput = document.getElementById('chat-input');

    if (leaveGame) {
      leaveGame.addEventListener('click', () => {
        if (confirm('Leave this demo game?')) {
          window.location.href = 'arena.html';
        }
      });
    }

    if (sendChat && chatInput) {
      const sendMessage = () => {
        const message = chatInput.value.trim();
        if (message) {
          this.addChatMessage({
            sender: this.user.username,
            text: message,
            timestamp: new Date()
          });
          chatInput.value = '';
        }
      };

      sendChat.addEventListener('click', sendMessage);
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          sendMessage();
        }
      });
    }
  }

  loadDemoGame() {
    // Load demo players
    this.loadDemoPlayers();
    
    // Load game-specific content
    this.loadGameContent();
    
    // Add some demo chat messages
    this.addDemoChatMessages();
    
    // Update game status
    this.updateGameStatus();
  }

  loadDemoPlayers() {
    const playersList = document.getElementById('players-list');
    if (!playersList) return;

    const demoPlayers = [
      { id: 'demo-user-123', username: 'DemoPlayer', discriminator: '0001', score: 0 },
      { id: 'demo-user-456', username: 'TestPlayer', discriminator: '0002', score: 2 },
      { id: 'demo-user-789', username: 'GameMaster', discriminator: '0003', score: 1 },
      { id: 'demo-user-012', username: 'ChaosBringer', discriminator: '0004', score: 3 }
    ];

    playersList.innerHTML = demoPlayers.map(player => `
      <div class="player-item ${player.id === this.user.id ? 'current-player' : ''}">
        <img src="https://cdn.discordapp.com/embed/avatars/${parseInt(player.discriminator) % 5}.png" 
             alt="${player.username}" />
        <div class="player-name">${player.username}</div>
        <div class="player-score">${player.score}</div>
      </div>
    `).join('');
  }

  loadGameContent() {
    const gameContent = document.getElementById('game-content');
    const gameActions = document.getElementById('game-actions');
    
    if (!gameContent || !gameActions) return;

    switch (this.gameType) {
      case 'degens-against-decency':
        this.loadDegensContent(gameContent, gameActions);
        break;
      case '2-truths-and-a-lie':
        this.loadTwoTruthsContent(gameContent, gameActions);
        break;
      case 'poker':
        this.loadPokerContent(gameContent, gameActions);
        break;
      default:
        this.loadDefaultContent(gameContent, gameActions);
    }
  }

  loadDegensContent(gameContent, gameActions) {
    gameContent.innerHTML = `
      <div class="card-game-area">
        <div class="prompt-card">
          <h3>Current Prompt</h3>
          <p class="prompt-text">"When I'm feeling down, I like to _____ while thinking about _____."</p>
        </div>
        
        <div class="hand-cards">
          <h4>Your Cards (Select 2)</h4>
          <div class="cards-grid">
            <div class="answer-card selectable" onclick="gameManager.toggleCard(this)">Eat questionable leftovers</div>
            <div class="answer-card selectable" onclick="gameManager.toggleCard(this)">Scream into the void</div>
            <div class="answer-card selectable" onclick="gameManager.toggleCard(this)">My collection of rubber ducks</div>
            <div class="answer-card selectable" onclick="gameManager.toggleCard(this)">The inevitable heat death of the universe</div>
            <div class="answer-card selectable" onclick="gameManager.toggleCard(this)">Dance badly to 90s music</div>
          </div>
        </div>
      </div>
    `;

    gameActions.innerHTML = `
      <button class="cta-button" onclick="gameManager.demoSubmitCards()">
        Submit Selected Cards
      </button>
      <button class="secondary-button" onclick="gameManager.showDemoHelp()">
        How to Play
      </button>
    `;
  }

  loadTwoTruthsContent(gameContent, gameActions) {
    gameContent.innerHTML = `
      <div class="truths-game-area">
        <div class="current-player-turn">
          <h3>TestPlayer's Turn</h3>
          <div class="statements">
            <div class="statement-item">
              <span class="number">1.</span>
              <span class="text">I once ate a spider on a dare</span>
            </div>
            <div class="statement-item">
              <span class="number">2.</span>
              <span class="text">I can speak fluent Klingon</span>
            </div>
            <div class="statement-item selectable" onclick="gameManager.selectLie(3)">
              <span class="number">3.</span>
              <span class="text">I have never seen Star Wars</span>
            </div>
          </div>
        </div>
      </div>
    `;

    gameActions.innerHTML = `
      <button class="cta-button" onclick="gameManager.demoGuessLie()">
        That's the lie!
      </button>
      <button class="secondary-button" onclick="gameManager.showDemoHelp()">
        How to Play
      </button>
    `;
  }

  loadPokerContent(gameContent, gameActions) {
    gameContent.innerHTML = `
      <div class="poker-game-area">
        <div class="poker-table">
          <div class="community-cards">
            <h4>Community Cards</h4>
            <div class="cards-row">
              <div class="playing-card">K♠</div>
              <div class="playing-card">Q♥</div>
              <div class="playing-card">J♦</div>
              <div class="card-back">?</div>
              <div class="card-back">?</div>
            </div>
          </div>
          
          <div class="your-hand">
            <h4>Your Hand</h4>
            <div class="cards-row">
              <div class="playing-card">A♠</div>
              <div class="playing-card">10♠</div>
            </div>
            <p class="hand-strength">Possible Royal Flush!</p>
          </div>
        </div>
      </div>
    `;

    gameActions.innerHTML = `
      <div class="poker-actions">
        <button class="poker-btn fold" onclick="gameManager.demoPokerAction('fold')">Fold</button>
        <button class="poker-btn call" onclick="gameManager.demoPokerAction('call')">Call (50)</button>
        <button class="poker-btn raise" onclick="gameManager.demoPokerAction('raise')">Raise</button>
      </div>
    `;
  }

  loadDefaultContent(gameContent, gameActions) {
    gameContent.innerHTML = `
      <div class="demo-content">
        <h3>🎮 ${this.formatGameType(this.gameType)} Demo</h3>
        <p>This is a demo of the game interface. In a full deployment, you would see:</p>
        <ul>
          <li>Real-time multiplayer gameplay</li>
          <li>Interactive game mechanics</li>
          <li>Live chat and communication</li>
          <li>Score tracking and progression</li>
        </ul>
      </div>
    `;

    gameActions.innerHTML = `
      <button class="cta-button" onclick="gameManager.showDemoHelp()">
        Learn More
      </button>
    `;
  }

  addDemoChatMessages() {
    const demoMessages = [
      { sender: 'GameMaster', text: 'Welcome to the game!', timestamp: new Date(Date.now() - 120000) },
      { sender: 'TestPlayer', text: 'This is so much fun!', timestamp: new Date(Date.now() - 60000) },
      { sender: 'ChaosBringer', text: 'Ready for chaos! 😈', timestamp: new Date(Date.now() - 30000) }
    ];

    demoMessages.forEach(message => this.addChatMessage(message));
  }

  addChatMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';
    messageElement.innerHTML = `
      <div class="sender">${message.sender}</div>
      <div class="text">${message.text}</div>
      <div class="timestamp">${message.timestamp.toLocaleTimeString()}</div>
    `;

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  updateGameStatus() {
    const gameStatus = document.getElementById('game-status');
    const gameRound = document.getElementById('game-round');

    if (gameStatus) {
      gameStatus.textContent = 'Demo Mode - Simulated gameplay';
    }

    if (gameRound) {
      gameRound.textContent = 'Round 1 (Demo)';
    }
  }

  formatGameType(type) {
    const types = {
      'degens-against-decency': 'Degens Against Decency',
      '2-truths-and-a-lie': '2 Truths and a Lie',
      'poker': 'Poker (5-Card Stud)'
    };
    return types[type] || type;
  }

  // Demo action methods
  toggleCard(cardElement) {
    const isSelected = cardElement.classList.contains('selected');
    const selectedCards = document.querySelectorAll('.answer-card.selected');
    
    if (isSelected) {
      // Deselect the card
      cardElement.classList.remove('selected');
    } else if (selectedCards.length < 2) {
      // Select the card if less than 2 are selected
      cardElement.classList.add('selected');
    } else {
      // Maximum cards already selected
      alert('You can only select 2 cards! Deselect one first.');
    }
  }

  demoSubmitCards() {
    const selectedCards = document.querySelectorAll('.answer-card.selected');
    if (selectedCards.length !== 2) {
      alert('Please select exactly 2 cards!');
      return;
    }
    alert('🎉 Cards submitted!\n\nIn a real game, your cards would be sent to other players for voting.');
  }

  demoGuessLie() {
    alert('🎯 Good guess!\n\nIn this demo, #3 was indeed the lie.\n\n"I have never seen Star Wars" - Nobody born after 1977 can claim this! 😄');
  }

  demoPokerAction(action) {
    const messages = {
      'fold': '💔 You folded!\n\nYou forfeit this round but keep your remaining chips.',
      'call': '✅ You called!\n\nMatched the current bet. Waiting for other players...',
      'raise': '🚀 You raised!\n\nIncreased the bet! Other players must call or fold.'
    };
    alert(messages[action] || 'Action completed!');
  }

  showDemoHelp() {
    const helpText = `🎮 Game Demo Help

This is a demonstration of the game interface running on GitHub Pages.

🚀 For Full Functionality:
• Deploy the Node.js server to Heroku, Railway, or similar
• This enables real multiplayer, Discord auth, and live gameplay

🎯 Current Demo Features:
• UI/UX demonstration
• Static game layouts
• Simulated interactions

💡 Try the different game types from the arena to see various interfaces!`;

    alert(helpText);
  }

  selectLie(statementNumber) {
    // Remove previous selections
    document.querySelectorAll('.statement-item').forEach(item => {
      item.classList.remove('selected');
    });
    
    // Select clicked statement
    event.target.closest('.statement-item').classList.add('selected');
  }
}

// Initialize game manager when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.gameManager = new StaticGameManager();
});

// Add CSS for better demo styling
const style = document.createElement('style');
style.textContent = `
  .selectable {
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .selectable:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }

  .selected {
    border: 2px solid #007bff !important;
    background: rgba(0, 123, 255, 0.2) !important;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
    margin-top: 15px;
  }

  .answer-card, .playing-card {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    color: white;
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .playing-card {
    width: 60px;
    height: 80px;
    font-size: 16px;
    font-weight: bold;
    margin: 5px;
  }

  .card-back {
    width: 60px;
    height: 80px;
    background: #4a5568;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin: 5px;
  }

  .cards-row {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }

  .poker-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
  }

  .poker-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
  }

  .poker-btn.fold { background: #dc3545; color: white; }
  .poker-btn.call { background: #28a745; color: white; }
  .poker-btn.raise { background: #ffc107; color: #212529; }

  .statement-item {
    display: flex;
    align-items: center;
    padding: 15px;
    margin: 10px 0;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .statement-item .number {
    font-weight: bold;
    margin-right: 15px;
    color: #007bff;
  }

  .chat-message {
    margin-bottom: 10px;
    padding: 8px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 5px;
  }

  .chat-message .sender {
    font-weight: bold;
    color: #007bff;
    font-size: 0.9em;
  }

  .chat-message .text {
    margin: 2px 0;
  }

  .chat-message .timestamp {
    font-size: 0.8em;
    color: #999;
  }
`;
document.head.appendChild(style);