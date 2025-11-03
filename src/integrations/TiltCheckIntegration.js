/**
 * TiltCheck Integration for Degens Against Decency
 * 
 * Monitors player behavior during games to detect tilt patterns
 * and provide responsible gaming interventions.
 * 
 * Copyright (c) 2024 Degens Against Decency
 * Licensed under the MIT License
 */

const axios = require('axios');

class TiltCheckIntegration {
  constructor() {
    this.enabled = process.env.TILTCHECK_ENABLED === 'true';
    this.apiKey = process.env.TILTCHECK_API_KEY;
    this.apiUrl = process.env.TILTCHECK_API_URL || 'https://api.tiltcheck.it.com';
    this.activePlayers = new Map();
    
    if (this.enabled && !this.apiKey) {
      console.warn('⚠️  TiltCheck enabled but no API key provided');
      this.enabled = false;
    }
    
    if (this.enabled) {
      console.log('✅ TiltCheck integration enabled');
    }
  }

  /**
   * Track a player joining a game
   * @param {string} playerId - Unique player identifier
   * @param {Object} options - Player tracking options
   */
  async trackPlayer(playerId, options = {}) {
    if (!this.enabled) return null;

    try {
      const playerData = {
        playerId,
        initialStake: options.initialStake || 0,
        riskProfile: options.riskProfile || 'medium',
        gameType: options.gameType || 'card-game',
        sessionId: options.sessionId,
        timestamp: Date.now()
      };

      this.activePlayers.set(playerId, {
        ...playerData,
        startTime: Date.now(),
        actions: [],
        alerts: []
      });

      // In demo mode, simulate tracking without API call
      const isDemoMode = process.env.NODE_ENV === 'development' || 
                         !this.apiKey || 
                         this.apiKey === 'demo';
      
      if (isDemoMode) {
        console.log(`🎯 TiltCheck tracking player: ${playerId} (demo mode)`);
        return playerData;
      }

      // Make API call to TiltCheck service
      const response = await axios.post(
        `${this.apiUrl}/api/track-player`,
        playerData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      return response.data;
    } catch (error) {
      console.error('TiltCheck tracking error:', error.message);
      return null;
    }
  }

  /**
   * Update player activity (betting, winning, losing)
   * @param {string} playerId - Player identifier
   * @param {Object} activity - Activity data
   */
  async updatePlayerActivity(playerId, activity) {
    if (!this.enabled) return null;

    const playerSession = this.activePlayers.get(playerId);
    if (!playerSession) {
      console.warn(`Player ${playerId} not tracked`);
      return null;
    }

    try {
      // Track activity locally
      playerSession.actions.push({
        ...activity,
        timestamp: Date.now()
      });

      // Calculate session metrics
      const sessionDuration = Math.floor((Date.now() - playerSession.startTime) / 1000);
      const activityData = {
        playerId,
        type: activity.type,
        amount: activity.amount,
        currentStake: activity.currentStake,
        sessionDuration,
        actionCount: playerSession.actions.length,
        timestamp: Date.now()
      };

      // Check for local tilt indicators
      const tiltCheck = this.checkLocalTiltIndicators(playerId, activityData);
      if (tiltCheck.alert) {
        playerSession.alerts.push(tiltCheck);
        console.log(`⚠️  Tilt alert for player ${playerId}: ${tiltCheck.message}`);
      }

      // Demo mode - skip API call
      const isDemoMode = process.env.NODE_ENV === 'development' || 
                         !this.apiKey || 
                         this.apiKey === 'demo';
      
      if (isDemoMode) {
        return { success: true, tiltCheck };
      }

      // Send to TiltCheck API
      const response = await axios.post(
        `${this.apiUrl}/api/update-activity`,
        activityData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      return response.data;
    } catch (error) {
      console.error('TiltCheck activity update error:', error.message);
      return null;
    }
  }

  /**
   * Check for local tilt indicators without API call
   * @param {string} playerId - Player identifier
   * @param {Object} activity - Current activity
   * @returns {Object} Tilt check result
   */
  checkLocalTiltIndicators(playerId, activity) {
    const playerSession = this.activePlayers.get(playerId);
    if (!playerSession) return { alert: false };

    const recentActions = playerSession.actions.slice(-10);
    
    // Check for rapid betting (10+ actions in 60 seconds)
    const rapidBetting = recentActions.filter(
      a => Date.now() - a.timestamp < 60000
    ).length >= 10;

    // Check for consecutive losses
    const consecutiveLosses = recentActions
      .slice(-5)
      .every(a => a.type === 'loss');

    // Check for excessive session time (> 2 hours)
    const excessiveTime = activity.sessionDuration > 7200;

    // Check for stake depletion (< 20% of initial)
    const stakeDepletion = activity.currentStake < (playerSession.initialStake * 0.2);

    let alert = false;
    let message = '';
    let severity = 'low';

    if (rapidBetting) {
      alert = true;
      message = 'Rapid betting detected - consider taking a break';
      severity = 'medium';
    } else if (consecutiveLosses) {
      alert = true;
      message = 'Multiple consecutive losses - be mindful of tilt';
      severity = 'medium';
    } else if (excessiveTime) {
      alert = true;
      message = 'Long session detected - time for a break?';
      severity = 'low';
    } else if (stakeDepletion) {
      alert = true;
      message = 'Stake significantly depleted - consider stopping';
      severity = 'high';
    }

    return {
      alert,
      message,
      severity,
      indicators: {
        rapidBetting,
        consecutiveLosses,
        excessiveTime,
        stakeDepletion
      }
    };
  }

  /**
   * Get player statistics and recommendations
   * @param {string} playerId - Player identifier
   * @returns {Object} Player stats and recommendations
   */
  async getPlayerStats(playerId) {
    if (!this.enabled) return null;

    const playerSession = this.activePlayers.get(playerId);
    if (!playerSession) return null;

    const sessionDuration = Math.floor((Date.now() - playerSession.startTime) / 1000);
    const totalActions = playerSession.actions.length;
    const wins = playerSession.actions.filter(a => a.type === 'win').length;
    const losses = playerSession.actions.filter(a => a.type === 'loss').length;

    return {
      playerId,
      sessionDuration,
      totalActions,
      wins,
      losses,
      winRate: totalActions > 0 ? (wins / totalActions * 100).toFixed(1) : 0,
      currentStake: playerSession.actions.length > 0 
        ? playerSession.actions[playerSession.actions.length - 1].currentStake 
        : playerSession.initialStake,
      initialStake: playerSession.initialStake,
      alerts: playerSession.alerts
    };
  }

  /**
   * Stop tracking a player
   * @param {string} playerId - Player identifier
   */
  async stopTracking(playerId) {
    if (!this.enabled) return;

    try {
      const playerSession = this.activePlayers.get(playerId);
      if (playerSession) {
        this.activePlayers.delete(playerId);
        
        const isDemoMode = process.env.NODE_ENV === 'development' || 
                           !this.apiKey || 
                           this.apiKey === 'demo';
        
        if (isDemoMode) {
          console.log(`🎯 TiltCheck stopped tracking player: ${playerId}`);
          return;
        }

        // Notify API that session ended
        await axios.post(
          `${this.apiUrl}/api/end-session`,
          { playerId, timestamp: Date.now() },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 5000
          }
        );
      }
    } catch (error) {
      console.error('TiltCheck stop tracking error:', error.message);
    }
  }
}

module.exports = TiltCheckIntegration;
