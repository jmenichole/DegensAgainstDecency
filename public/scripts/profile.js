/**
 * Profile Page Script
 * 
 * Copyright (c) 2024 Degens Against Decency
 * Licensed under the MIT License
 * See LICENSE file in the project root for full license information.
 */

class ProfileManager {
  constructor() {
    this.user = null;
    this.integrationHealth = null;
    this.init();
  }

  async init() {
    await this.loadUser();
    this.setupMenuNavigation();
    this.setupIntegrations();
    await this.loadIntegrationHealth();
  }

  async loadUser() {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        this.user = await response.json();
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  }

  setupMenuNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all menu items
        menuItems.forEach(mi => mi.classList.remove('active'));
        item.classList.add('active');
        
        // Get target section from href
        const target = item.getAttribute('href').substring(1);
        this.showSection(target);
      });
    });
  }

  showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.profile-section');
    sections.forEach(section => section.classList.add('hidden'));
    
    // Show target section
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
      targetSection.classList.remove('hidden');
    } else {
      // If section doesn't exist yet, show the default profile card
      const profileCard = document.querySelector('.profile-card');
      if (profileCard) {
        profileCard.style.display = 'flex';
      }
    }

    // Special handling for integrations section
    if (sectionId === 'integrations') {
      this.loadIntegrationData();
    }
  }

  setupIntegrations() {
    // Wallet registration form
    const walletForm = document.getElementById('wallet-registration-form');
    if (walletForm) {
      walletForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.registerWallet();
      });
    }

    // Refresh balance button
    const refreshBalanceBtn = document.getElementById('refresh-balance-btn');
    if (refreshBalanceBtn) {
      refreshBalanceBtn.addEventListener('click', async () => {
        await this.loadWalletBalance();
      });
    }
  }

  async loadIntegrationHealth() {
    try {
      const response = await fetch('/api/integrations/health');
      if (response.ok) {
        this.integrationHealth = await response.json();
        this.displayIntegrationHealth();
      }
    } catch (error) {
      console.error('Failed to load integration health:', error);
      this.displayIntegrationHealthError();
    }
  }

  displayIntegrationHealth() {
    const healthStatusEl = document.getElementById('integration-health-status');
    if (!healthStatusEl || !this.integrationHealth) return;

    const tiltCheckStatus = this.integrationHealth.tiltCheck || {};
    const justTheTipStatus = this.integrationHealth.justTheTip || {};

    healthStatusEl.innerHTML = `
      <div class="health-status-item">
        <h4>TiltCheck</h4>
        <p><strong>Status:</strong> ${tiltCheckStatus.enabled ? '✅ Enabled' : '❌ Disabled'}</p>
        ${tiltCheckStatus.enabled ? `<p><strong>Active Players:</strong> ${tiltCheckStatus.activePlayers || 0}</p>` : ''}
      </div>
      <div class="health-status-item">
        <h4>JustTheTip</h4>
        <p><strong>Status:</strong> ${justTheTipStatus.enabled ? '✅ Enabled' : '❌ Disabled'}</p>
        ${justTheTipStatus.enabled ? `<p><strong>Registered Wallets:</strong> ${justTheTipStatus.registeredWallets || 0}</p>` : ''}
        ${justTheTipStatus.enabled ? `<p><strong>Total Tips:</strong> ${justTheTipStatus.tipHistory || 0}</p>` : ''}
      </div>
    `;

    // Update status badges
    this.updateStatusBadge('tiltcheck-status', tiltCheckStatus.enabled);
    this.updateStatusBadge('justthetip-status', justTheTipStatus.enabled);
  }

  displayIntegrationHealthError() {
    const healthStatusEl = document.getElementById('integration-health-status');
    if (healthStatusEl) {
      healthStatusEl.innerHTML = '<div class="loading">Failed to load integration status</div>';
    }
  }

  updateStatusBadge(elementId, enabled) {
    const statusEl = document.getElementById(elementId);
    if (statusEl) {
      const badge = statusEl.querySelector('.status-badge');
      if (badge) {
        badge.className = `status-badge ${enabled ? 'enabled' : 'disabled'}`;
        badge.textContent = enabled ? 'Enabled' : 'Disabled';
      }
    }
  }

  async loadIntegrationData() {
    if (!this.user) return;

    // Load TiltCheck stats if enabled
    if (this.integrationHealth?.tiltCheck?.enabled) {
      await this.loadTiltCheckStats();
    }

    // Load JustTheTip data if enabled
    if (this.integrationHealth?.justTheTip?.enabled) {
      await this.loadJustTheTipData();
    }
  }

  async loadTiltCheckStats() {
    try {
      const response = await fetch(`/api/integrations/tiltcheck/stats/${this.user.id}`);
      if (response.ok) {
        const stats = await response.json();
        this.displayTiltCheckStats(stats);
      }
    } catch (error) {
      console.error('Failed to load TiltCheck stats:', error);
    }
  }

  displayTiltCheckStats(stats) {
    if (!stats || stats.error) {
      // No stats available
      document.getElementById('tiltcheck-session').textContent = 'N/A';
      document.getElementById('tiltcheck-actions').textContent = 'N/A';
      document.getElementById('tiltcheck-winrate').textContent = 'N/A';
      document.getElementById('tiltcheck-alerts').textContent = '0';
      return;
    }

    // Display session duration
    const duration = this.formatDuration(stats.sessionDuration);
    document.getElementById('tiltcheck-session').textContent = duration;

    // Display actions
    document.getElementById('tiltcheck-actions').textContent = stats.totalActions || 0;

    // Display win rate
    document.getElementById('tiltcheck-winrate').textContent = `${stats.winRate || 0}%`;

    // Display alerts
    const alertCount = stats.alerts?.length || 0;
    document.getElementById('tiltcheck-alerts').textContent = alertCount;

    // Display alert list
    if (stats.alerts && stats.alerts.length > 0) {
      this.displayTiltCheckAlerts(stats.alerts);
    }
  }

  displayTiltCheckAlerts(alerts) {
    const alertsList = document.getElementById('tiltcheck-alerts-list');
    if (!alertsList) return;

    alertsList.innerHTML = alerts.map(alert => `
      <div class="alert-item ${alert.severity}">
        <div class="alert-message">${alert.message}</div>
        <div class="alert-severity">Severity: ${alert.severity}</div>
      </div>
    `).join('');
  }

  formatDuration(seconds) {
    if (!seconds || seconds === 0) return '0s';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  async loadJustTheTipData() {
    // Check if wallet is registered
    // For now, show registration form by default
    // In a real implementation, you'd check the backend for registered wallet
    
    // Try to load balance (will fail if no wallet registered)
    try {
      const response = await fetch(`/api/integrations/justthetip/balance/${this.user.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Wallet is registered
          this.showWalletInfo(data);
        }
      }
    } catch (error) {
      console.log('No wallet registered yet');
    }
  }

  async registerWallet() {
    const walletAddress = document.getElementById('wallet-address').value;
    if (!walletAddress) {
      alert('Please enter a wallet address');
      return;
    }

    try {
      const response = await fetch('/api/integrations/justthetip/register-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: this.user.id,
          walletAddress: walletAddress
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Wallet registered successfully!');
        
        // Hide registration form, show wallet info
        document.getElementById('wallet-registration').classList.add('hidden');
        document.getElementById('wallet-info').classList.remove('hidden');
        
        // Load wallet data
        await this.loadWalletBalance();
      } else {
        alert(`Failed to register wallet: ${result.error}`);
      }
    } catch (error) {
      console.error('Wallet registration error:', error);
      alert('Failed to register wallet. Please try again.');
    }
  }

  async loadWalletBalance() {
    try {
      const response = await fetch(`/api/integrations/justthetip/balance/${this.user.id}`);
      const data = await response.json();
      
      if (data.success) {
        this.showWalletInfo(data);
      } else {
        console.error('Failed to load balance:', data.error);
      }
    } catch (error) {
      console.error('Error loading wallet balance:', error);
    }
  }

  showWalletInfo(data) {
    // Hide registration form
    document.getElementById('wallet-registration').classList.add('hidden');
    document.getElementById('wallet-info').classList.remove('hidden');

    // Display wallet address
    document.getElementById('registered-wallet-address').textContent = data.walletAddress;

    // Display balances
    const balanceEl = document.getElementById('wallet-balance');
    if (balanceEl && data.balances) {
      balanceEl.innerHTML = Object.entries(data.balances).map(([currency, amount]) => `
        <div class="balance-item">
          <div class="currency">${currency}</div>
          <div class="amount">${amount.toFixed(4)}</div>
        </div>
      `).join('');
    }

    // Load tip stats
    this.loadTipStats();
  }

  async loadTipStats() {
    try {
      const stats = await this.integrationHealth?.justTheTip;
      // For now, display mock data
      // In a real implementation, you'd have an endpoint for tip stats
      document.getElementById('tips-sent').textContent = '0';
      document.getElementById('tips-received').textContent = '0';
      document.getElementById('amount-sent').textContent = '0 SOL';
      document.getElementById('amount-received').textContent = '0 SOL';
    } catch (error) {
      console.error('Failed to load tip stats:', error);
    }
  }
}

// Initialize profile manager when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.profileManager = new ProfileManager();
});
