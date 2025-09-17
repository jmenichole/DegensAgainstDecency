// Static-friendly authentication and demo management for GitHub Pages
class StaticAuthManager {
  constructor() {
    this.user = null;
    this.isDemo = true;
    this.init();
  }

  async init() {
    // For GitHub Pages deployment, show demo mode
    this.showDemoMode();
    this.setupEventListeners();
  }

  setupEventListeners() {
    const discordLogin = document.getElementById('discord-login');
    const enterArena = document.getElementById('enter-arena');
    const logout = document.getElementById('logout');
    const demoLogin = document.getElementById('demo-login');

    if (discordLogin) {
      discordLogin.addEventListener('click', () => {
        this.showServerRequiredMessage();
      });
    }

    if (demoLogin) {
      demoLogin.addEventListener('click', () => {
        this.loginAsDemo();
      });
    }

    if (enterArena) {
      enterArena.addEventListener('click', () => {
        if (this.user) {
          window.location.href = 'arena.html';
        } else {
          alert('Please log in first!');
        }
      });
    }

    if (logout) {
      logout.addEventListener('click', () => {
        this.logout();
      });
    }
  }

  showServerRequiredMessage() {
    const message = `
🚀 Full Server Required for Discord Authentication

This GitHub Pages deployment shows the static frontend only. 
For full functionality including Discord authentication and multiplayer features, 
the complete Node.js application needs to be deployed to a service like:

• Heroku
• Railway  
• Render
• Vercel

Try the demo mode to explore the interface!
    `;
    alert(message);
  }

  loginAsDemo() {
    this.user = {
      id: 'demo-user-123',
      username: 'DemoPlayer',
      discriminator: '0001',
      avatar: null,
      email: 'demo@example.com'
    };
    this.showUserInfo();
  }

  logout() {
    this.user = null;
    this.showDemoMode();
  }

  showDemoMode() {
    const userInfo = document.getElementById('user-info');
    const loginPrompt = document.getElementById('login-prompt');

    if (userInfo && loginPrompt) {
      userInfo.classList.add('hidden');
      loginPrompt.classList.remove('hidden');
      
      // Add demo mode indicator if not already present
      if (!document.getElementById('demo-mode-notice')) {
        const demoNotice = document.createElement('div');
        demoNotice.id = 'demo-mode-notice';
        demoNotice.style.cssText = `
          background: rgba(255, 193, 7, 0.2);
          border: 1px solid #ffc107;
          border-radius: 5px;
          padding: 10px;
          margin: 10px 0;
          color: #856404;
          text-align: center;
        `;
        demoNotice.innerHTML = `
          <strong>🏠 GitHub Pages Demo Mode</strong><br>
          Full multiplayer features require server deployment
        `;
        
        // Add demo login button
        const demoButton = document.createElement('button');
        demoButton.id = 'demo-login';
        demoButton.className = 'secondary-button';
        demoButton.style.marginTop = '10px';
        demoButton.textContent = 'Try Demo Mode';
        demoNotice.appendChild(demoButton);
        
        loginPrompt.insertBefore(demoNotice, loginPrompt.firstChild);
        
        // Re-setup event listeners for the new button
        this.setupEventListeners();
      }
    }
  }

  showUserInfo() {
    const userInfo = document.getElementById('user-info');
    const loginPrompt = document.getElementById('login-prompt');
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');

    if (userInfo && loginPrompt && userName && userAvatar && this.user) {
      userName.textContent = `${this.user.username}#${this.user.discriminator} (Demo)`;
      
      // Use a default avatar for demo
      const defaultAvatarIndex = parseInt(this.user.discriminator) % 5;
      userAvatar.src = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`;
      
      userInfo.classList.remove('hidden');
      loginPrompt.classList.add('hidden');
    }
  }

  getUser() {
    return this.user;
  }
}

// Initialize auth manager when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on GitHub Pages or have a server
  const isGitHubPages = window.location.hostname.includes('github.io');
  
  if (isGitHubPages || window.location.protocol === 'file:') {
    window.authManager = new StaticAuthManager();
  } else {
    // Try to load the original auth manager for server deployments
    window.authManager = new StaticAuthManager(); // Fallback to static for now
  }
});