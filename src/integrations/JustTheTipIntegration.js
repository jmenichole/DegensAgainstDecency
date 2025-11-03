/**
 * JustTheTip Integration for Degens Against Decency
 * 
 * Enables cryptocurrency tipping functionality in games using Solana smart contracts.
 * Non-custodial design - users maintain full control of their wallets.
 * 
 * Copyright (c) 2024 Degens Against Decency
 * Licensed under the MIT License
 */

const axios = require('axios');

class JustTheTipIntegration {
  constructor() {
    this.enabled = process.env.JUSTTHETIP_ENABLED === 'true';
    this.apiUrl = process.env.JUSTTHETIP_API_URL;
    this.discordBotToken = process.env.JUSTTHETIP_BOT_TOKEN;
    this.registeredWallets = new Map();
    this.tipHistory = [];
    
    if (this.enabled && !this.discordBotToken) {
      console.warn('⚠️  JustTheTip enabled but no bot token provided');
      this.enabled = false;
    }
    
    if (this.enabled) {
      console.log('✅ JustTheTip integration enabled');
    }
  }

  /**
   * Check if running in demo mode
   * @returns {boolean} Is demo mode
   */
  isDemoMode() {
    return process.env.NODE_ENV === 'development' || 
           !this.discordBotToken || 
           this.discordBotToken === 'demo';
  }

  /**
   * Register a user's Solana wallet for tipping
   * @param {string} userId - User ID
   * @param {string} walletAddress - Solana wallet address
   * @returns {Object} Registration result
   */
  async registerWallet(userId, walletAddress) {
    if (!this.enabled) {
      return { success: false, error: 'JustTheTip integration not enabled' };
    }

    try {
      // Validate Solana address format (basic check)
      if (!this.isValidSolanaAddress(walletAddress)) {
        return { success: false, error: 'Invalid Solana address format' };
      }

      // Store wallet registration locally
      this.registeredWallets.set(userId, {
        walletAddress,
        registeredAt: Date.now()
      });

      // Demo mode - skip API call
      if (this.isDemoMode()) {
        console.log(`💎 Registered wallet for user ${userId}: ${walletAddress} (demo mode)`);
        return {
          success: true,
          walletAddress,
          message: 'Wallet registered successfully (demo mode)'
        };
      }

      // Register with JustTheTip API
      const response = await axios.post(
        `${this.apiUrl}/api/register-wallet`,
        {
          userId,
          walletAddress,
          source: 'DegensAgainstDecency'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.discordBotToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('JustTheTip wallet registration error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a tip transaction
   * @param {string} fromUserId - Sender user ID
   * @param {string} toUserId - Recipient user ID
   * @param {number} amount - Amount in SOL
   * @param {string} currency - Currency type (SOL, USDC, etc.)
   * @param {Object} context - Additional context (game, reason, etc.)
   * @returns {Object} Tip transaction result
   */
  async createTip(fromUserId, toUserId, amount, currency = 'SOL', context = {}) {
    if (!this.enabled) {
      return { success: false, error: 'JustTheTip integration not enabled' };
    }

    try {
      const fromWallet = this.registeredWallets.get(fromUserId);
      const toWallet = this.registeredWallets.get(toUserId);

      if (!fromWallet) {
        return {
          success: false,
          error: 'Sender wallet not registered. Use /register-wallet first.'
        };
      }

      if (!toWallet) {
        return {
          success: false,
          error: 'Recipient wallet not registered'
        };
      }

      const tipData = {
        fromUserId,
        toUserId,
        fromWallet: fromWallet.walletAddress,
        toWallet: toWallet.walletAddress,
        amount,
        currency,
        gameId: context.gameId,
        gameType: context.gameType,
        reason: context.reason || 'game_tip',
        timestamp: Date.now()
      };

      // Store tip in history
      this.tipHistory.push(tipData);

      // Demo mode - return mock transaction
      if (this.isDemoMode()) {
        console.log(`💰 Tip created: ${amount} ${currency} from ${fromUserId} to ${toUserId} (demo mode)`);
        return {
          success: true,
          transaction: {
            ...tipData,
            signature: 'demo_signature_' + Date.now(),
            status: 'pending',
            message: 'Demo transaction created. In production, users would sign this with their wallet.'
          }
        };
      }

      // Create smart contract instruction via API
      const response = await axios.post(
        `${this.apiUrl}/api/create-tip`,
        tipData,
        {
          headers: {
            'Authorization': `Bearer ${this.discordBotToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('JustTheTip create tip error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user's wallet balance
   * @param {string} userId - User ID
   * @returns {Object} Balance information
   */
  async getBalance(userId) {
    if (!this.enabled) return null;

    try {
      const wallet = this.registeredWallets.get(userId);
      if (!wallet) {
        return {
          success: false,
          error: 'Wallet not registered'
        };
      }

      // Demo mode - return mock balance
      if (this.isDemoMode()) {
        return {
          success: true,
          walletAddress: wallet.walletAddress,
          balances: {
            SOL: 1.5,
            USDC: 100.0,
            LTC: 0.5
          },
          totalUSD: 150.00,
          demoMode: true
        };
      }

      // Query balance from API
      const response = await axios.get(
        `${this.apiUrl}/api/balance/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.discordBotToken}`
          },
          timeout: 5000
        }
      );

      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('JustTheTip balance query error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get tip history for a game
   * @param {string} gameId - Game ID
   * @returns {Array} Tip history
   */
  getTipHistoryForGame(gameId) {
    if (!this.enabled) return [];
    return this.tipHistory.filter(tip => tip.gameId === gameId);
  }

  /**
   * Get tip statistics for a user
   * @param {string} userId - User ID
   * @returns {Object} Tip statistics
   */
  getUserTipStats(userId) {
    if (!this.enabled) return null;

    const sent = this.tipHistory.filter(tip => tip.fromUserId === userId);
    const received = this.tipHistory.filter(tip => tip.toUserId === userId);

    return {
      totalSent: sent.length,
      totalReceived: received.length,
      amountSent: sent.reduce((sum, tip) => sum + tip.amount, 0),
      amountReceived: received.reduce((sum, tip) => sum + tip.amount, 0)
    };
  }

  /**
   * Validate Solana address format
   * @param {string} address - Address to validate
   * @returns {boolean} Is valid
   * 
   * Note: Solana addresses are Base58-encoded public keys (32 bytes).
   * Valid characters: 1-9, A-H, J-N, P-Z, a-k, m-z (excludes 0, O, I, l)
   * Length: 32-44 characters
   */
  isValidSolanaAddress(address) {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  }

  /**
   * Create an airdrop for game winners
   * @param {string} creatorUserId - Creator user ID
   * @param {Array} recipients - Array of recipient user IDs
   * @param {number} amountPerRecipient - Amount per recipient
   * @param {string} currency - Currency type
   * @param {Object} context - Game context
   * @returns {Object} Airdrop result
   */
  async createAirdrop(creatorUserId, recipients, amountPerRecipient, currency = 'SOL', context = {}) {
    if (!this.enabled) {
      return { success: false, error: 'JustTheTip integration not enabled' };
    }

    try {
      const creatorWallet = this.registeredWallets.get(creatorUserId);
      if (!creatorWallet) {
        return {
          success: false,
          error: 'Creator wallet not registered'
        };
      }

      const airdropData = {
        creatorUserId,
        recipients: recipients.map(userId => ({
          userId,
          walletAddress: this.registeredWallets.get(userId)?.walletAddress
        })).filter(r => r.walletAddress),
        amountPerRecipient,
        currency,
        totalAmount: amountPerRecipient * recipients.length,
        gameId: context.gameId,
        reason: context.reason || 'game_winners',
        timestamp: Date.now()
      };

      // Demo mode
      if (this.isDemoMode()) {
        console.log(`🎁 Airdrop created: ${airdropData.totalAmount} ${currency} to ${recipients.length} recipients (demo mode)`);
        return {
          success: true,
          airdrop: airdropData,
          message: 'Demo airdrop created'
        };
      }

      // Create airdrop via API
      const response = await axios.post(
        `${this.apiUrl}/api/create-airdrop`,
        airdropData,
        {
          headers: {
            'Authorization': `Bearer ${this.discordBotToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('JustTheTip airdrop creation error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = JustTheTipIntegration;
