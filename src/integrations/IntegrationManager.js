/**
 * Integration Manager for External Services
 * 
 * Manages integrations with TiltCheck and JustTheTip services
 * 
 * Copyright (c) 2024 Degens Against Decency
 * Licensed under the MIT License
 */

const TiltCheckIntegration = require('./TiltCheckIntegration');
const JustTheTipIntegration = require('./JustTheTipIntegration');

class IntegrationManager {
  constructor() {
    this.tiltCheck = new TiltCheckIntegration();
    this.justTheTip = new JustTheTipIntegration();
    
    console.log('📦 Integration Manager initialized');
    console.log(`   - TiltCheck: ${this.tiltCheck.enabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   - JustTheTip: ${this.justTheTip.enabled ? '✅ Enabled' : '❌ Disabled'}`);
  }

  /**
   * Handle player joining a game
   * @param {Object} player - Player object
   * @param {Object} gameContext - Game context
   */
  async onPlayerJoinGame(player, gameContext) {
    const promises = [];

    // Track with TiltCheck if enabled
    if (this.tiltCheck.enabled) {
      promises.push(
        this.tiltCheck.trackPlayer(player.id, {
          initialStake: 100, // Default starting stake for tracking
          riskProfile: 'medium',
          gameType: gameContext.gameType,
          sessionId: gameContext.gameId
        })
      );
    }

    await Promise.all(promises);
  }

  /**
   * Handle player leaving a game
   * @param {string} playerId - Player ID
   */
  async onPlayerLeaveGame(playerId) {
    const promises = [];

    // Stop TiltCheck tracking
    if (this.tiltCheck.enabled) {
      promises.push(this.tiltCheck.stopTracking(playerId));
    }

    await Promise.all(promises);
  }

  /**
   * Handle game action (bet, win, loss)
   * @param {string} playerId - Player ID
   * @param {Object} action - Action data
   */
  async onGameAction(playerId, action) {
    if (this.tiltCheck.enabled && action.type) {
      await this.tiltCheck.updatePlayerActivity(playerId, {
        type: action.type,
        amount: action.amount || 0,
        currentStake: action.currentStake || 100,
        gameType: action.gameType
      });
    }
  }

  /**
   * Get player statistics
   * @param {string} playerId - Player ID
   * @returns {Object} Combined statistics from all integrations
   */
  async getPlayerStats(playerId) {
    const stats = {};

    if (this.tiltCheck.enabled) {
      stats.tiltCheck = await this.tiltCheck.getPlayerStats(playerId);
    }

    if (this.justTheTip.enabled) {
      stats.tipStats = this.justTheTip.getUserTipStats(playerId);
    }

    return stats;
  }

  /**
   * Check if integrations are healthy
   * @returns {Object} Health status
   */
  getHealthStatus() {
    return {
      tiltCheck: {
        enabled: this.tiltCheck.enabled,
        activePlayers: this.tiltCheck.activePlayers.size
      },
      justTheTip: {
        enabled: this.justTheTip.enabled,
        registeredWallets: this.justTheTip.registeredWallets.size,
        tipHistory: this.justTheTip.tipHistory.length
      }
    };
  }
}

module.exports = IntegrationManager;
