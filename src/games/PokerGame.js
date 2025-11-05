/**
 * Poker Game - 5-Card Stud poker implementation
 * 
 * Copyright (c) 2024 Degens Against Decency
 * Licensed under the MIT License
 * See LICENSE file in the project root for full license information.
 */

const BaseGame = require('./BaseGame');

class PokerGame extends BaseGame {
  constructor(id, creator, isPrivate, maxPlayers) {
    super(id, creator, isPrivate, maxPlayers);
    this.type = 'poker';
    this.variant = '5-card-stud'; // Could be extended to Texas Hold'em
    
    this.deck = [];
    this.playerHands = new Map();
    this.playerBets = new Map();
    this.currentBet = 0;
    this.pot = 0;
    this.currentPlayer = null;
    this.dealerIndex = 0;
    this.bettingRound = 1;
    this.maxBettingRounds = 4;
    this.smallBlind = 5;
    this.bigBlind = 10;
    this.foldedPlayers = new Set();
  }

  initializeGame() {
    this.createDeck();
    this.shuffleDeck();
    this.setDealer();
    this.postBlinds();
    this.dealInitialCards();
    this.setCurrentPlayer();
  }

  createDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    this.deck = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        this.deck.push({ 
          suit, 
          rank, 
          value: this.getCardValue(rank),
          id: `${rank}-${suit}`
        });
      }
    }
  }

  getCardValue(rank) {
    const values = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
    return values[rank];
  }

  shuffleDeck() {
    this.deck = this.deck.sort(() => Math.random() - 0.5);
  }

  setDealer() {
    this.dealerIndex = Math.floor(Math.random() * this.players.length);
  }

  postBlinds() {
    if (this.players.length < 2) return;

    const smallBlindIndex = (this.dealerIndex + 1) % this.players.length;
    const bigBlindIndex = (this.dealerIndex + 2) % this.players.length;

    this.playerBets.set(this.players[smallBlindIndex].id, this.smallBlind);
    this.playerBets.set(this.players[bigBlindIndex].id, this.bigBlind);
    
    this.currentBet = this.bigBlind;
    this.pot = this.smallBlind + this.bigBlind;
  }

  dealInitialCards() {
    // Deal 2 cards to each player (5-card stud starts with 2)
    for (const player of this.players) {
      const hand = [];
      for (let i = 0; i < 2; i++) {
        if (this.deck.length > 0) {
          hand.push(this.deck.pop());
        }
      }
      this.playerHands.set(player.id, hand);
    }
  }

  setCurrentPlayer() {
    // Start with player after big blind
    const startIndex = (this.dealerIndex + 3) % this.players.length;
    this.currentPlayer = this.players[startIndex];
  }

  handleAction(userId, action) {
    switch (action.type) {
      case 'start-game':
        return this.startGame();
      
      case 'fold':
        return this.fold(userId);
      
      case 'call':
        return this.call(userId);
      
      case 'raise':
        return this.raise(userId, action.amount);
      
      case 'check':
        return this.check(userId);
      
      default:
        return { success: false, error: 'Unknown action' };
    }
  }

  fold(userId) {
    if (userId !== this.currentPlayer.id) {
      return { success: false, error: 'Not your turn' };
    }

    this.foldedPlayers.add(userId);
    this.nextPlayer();

    // Check if only one player remains
    const activePlayers = this.players.filter(p => !this.foldedPlayers.has(p.id));
    if (activePlayers.length === 1) {
      this.endHand(activePlayers[0].id);
    }

    return { success: true };
  }

  call(userId) {
    if (userId !== this.currentPlayer.id) {
      return { success: false, error: 'Not your turn' };
    }

    const currentPlayerBet = this.playerBets.get(userId) || 0;
    const callAmount = this.currentBet - currentPlayerBet;

    this.playerBets.set(userId, this.currentBet);
    this.pot += callAmount;

    this.nextPlayer();
    return { success: true, amount: callAmount };
  }

  raise(userId, raiseAmount) {
    if (userId !== this.currentPlayer.id) {
      return { success: false, error: 'Not your turn' };
    }

    if (!raiseAmount || raiseAmount <= 0) {
      return { success: false, error: 'Invalid raise amount' };
    }

    const currentPlayerBet = this.playerBets.get(userId) || 0;
    const totalAmount = this.currentBet + raiseAmount;
    const actualRaise = totalAmount - currentPlayerBet;

    this.playerBets.set(userId, totalAmount);
    this.pot += actualRaise;
    this.currentBet = totalAmount;

    this.nextPlayer();
    return { success: true, amount: actualRaise, newBet: totalAmount };
  }

  check(userId) {
    if (userId !== this.currentPlayer.id) {
      return { success: false, error: 'Not your turn' };
    }

    const currentPlayerBet = this.playerBets.get(userId) || 0;
    if (currentPlayerBet < this.currentBet) {
      return { success: false, error: 'Cannot check, must call or fold' };
    }

    this.nextPlayer();
    return { success: true };
  }

  nextPlayer() {
    // Find next active player
    let nextIndex = (this.players.findIndex(p => p.id === this.currentPlayer.id) + 1) % this.players.length;
    
    while (this.foldedPlayers.has(this.players[nextIndex].id)) {
      nextIndex = (nextIndex + 1) % this.players.length;
    }

    this.currentPlayer = this.players[nextIndex];

    // Check if betting round is complete
    if (this.isBettingRoundComplete()) {
      this.nextBettingRound();
    }
  }

  isBettingRoundComplete() {
    const activePlayers = this.players.filter(p => !this.foldedPlayers.has(p.id));
    return activePlayers.every(player => {
      const playerBet = this.playerBets.get(player.id) || 0;
      return playerBet === this.currentBet;
    });
  }

  nextBettingRound() {
    this.bettingRound++;

    if (this.bettingRound > this.maxBettingRounds) {
      this.showdown();
      return;
    }

    // Deal additional cards for 5-card stud
    if (this.bettingRound <= 4) {
      for (const player of this.players) {
        if (!this.foldedPlayers.has(player.id) && this.deck.length > 0) {
          const hand = this.playerHands.get(player.id);
          hand.push(this.deck.pop());
        }
      }
    }

    // Reset for next betting round
    this.currentBet = 0;
    this.playerBets.clear();
    this.setCurrentPlayerForNewRound();
  }

  setCurrentPlayerForNewRound() {
    // Start with first active player after dealer
    let index = (this.dealerIndex + 1) % this.players.length;
    while (this.foldedPlayers.has(this.players[index].id)) {
      index = (index + 1) % this.players.length;
    }
    this.currentPlayer = this.players[index];
  }

  showdown() {
    const activePlayers = this.players.filter(p => !this.foldedPlayers.has(p.id));
    const handRankings = activePlayers.map(player => ({
      playerId: player.id,
      hand: this.playerHands.get(player.id),
      ranking: this.evaluateHand(this.playerHands.get(player.id))
    }));

    // Sort by hand ranking (higher is better)
    handRankings.sort((a, b) => b.ranking.value - a.ranking.value);
    
    const winner = handRankings[0];
    this.endHand(winner.playerId, handRankings);
  }

  evaluateHand(cards) {
    if (!cards || cards.length < 5) {
      return { type: 'incomplete', value: 0, description: 'Incomplete hand' };
    }

    // Sort cards by value (descending)
    const sorted = [...cards].sort((a, b) => b.value - a.value);
    
    // Check for flush
    const isFlush = cards.every(card => card.suit === cards[0].suit);
    
    // Check for straight
    const values = sorted.map(c => c.value);
    const isStraight = this.checkStraight(values);
    
    // Special case: A-2-3-4-5 straight (wheel)
    const isWheelStraight = values[0] === 14 && values[1] === 5 && values[2] === 4 && 
                            values[3] === 3 && values[4] === 2;
    
    // Count ranks
    const rankCounts = new Map();
    for (const card of cards) {
      rankCounts.set(card.value, (rankCounts.get(card.value) || 0) + 1);
    }
    
    const counts = Array.from(rankCounts.values()).sort((a, b) => b - a);
    const ranksWithCounts = Array.from(rankCounts.entries())
      .sort((a, b) => b[1] - a[1] || b[0] - a[0]);
    
    // Straight Flush
    if (isFlush && (isStraight || isWheelStraight)) {
      const highValue = isWheelStraight ? 5 : sorted[0].value;
      return {
        type: 'straight-flush',
        value: 8000000 + highValue,
        description: `Straight flush, ${this.getCardName(highValue)} high`
      };
    }
    
    // Four of a Kind
    if (counts[0] === 4) {
      const quadValue = ranksWithCounts[0][0];
      const kicker = ranksWithCounts[1][0];
      return {
        type: 'four-of-a-kind',
        value: 7000000 + quadValue * 100 + kicker,
        description: `Four ${this.getCardName(quadValue)}s`
      };
    }
    
    // Full House
    if (counts[0] === 3 && counts[1] === 2) {
      const tripValue = ranksWithCounts[0][0];
      const pairValue = ranksWithCounts[1][0];
      return {
        type: 'full-house',
        value: 6000000 + tripValue * 100 + pairValue,
        description: `Full house, ${this.getCardName(tripValue)}s over ${this.getCardName(pairValue)}s`
      };
    }
    
    // Flush
    if (isFlush) {
      const value = sorted.reduce((sum, card, idx) => sum + card.value * Math.pow(100, 4 - idx), 5000000);
      return {
        type: 'flush',
        value: value,
        description: `Flush, ${this.getCardName(sorted[0].value)} high`
      };
    }
    
    // Straight
    if (isStraight || isWheelStraight) {
      const highValue = isWheelStraight ? 5 : sorted[0].value;
      return {
        type: 'straight',
        value: 4000000 + highValue,
        description: `Straight, ${this.getCardName(highValue)} high`
      };
    }
    
    // Three of a Kind
    if (counts[0] === 3) {
      const tripValue = ranksWithCounts[0][0];
      const kickers = ranksWithCounts.slice(1).map(r => r[0]);
      return {
        type: 'three-of-a-kind',
        value: 3000000 + tripValue * 10000 + kickers[0] * 100 + kickers[1],
        description: `Three ${this.getCardName(tripValue)}s`
      };
    }
    
    // Two Pair
    if (counts[0] === 2 && counts[1] === 2) {
      const highPair = ranksWithCounts[0][0];
      const lowPair = ranksWithCounts[1][0];
      const kicker = ranksWithCounts[2][0];
      return {
        type: 'two-pair',
        value: 2000000 + highPair * 10000 + lowPair * 100 + kicker,
        description: `Two pair, ${this.getCardName(highPair)}s and ${this.getCardName(lowPair)}s`
      };
    }
    
    // One Pair
    if (counts[0] === 2) {
      const pairValue = ranksWithCounts[0][0];
      const kickers = ranksWithCounts.slice(1).map(r => r[0]);
      return {
        type: 'pair',
        value: 1000000 + pairValue * 10000 + kickers[0] * 100 + kickers[1],
        description: `Pair of ${this.getCardName(pairValue)}s`
      };
    }
    
    // High Card
    const value = sorted.reduce((sum, card, idx) => sum + card.value * Math.pow(100, 4 - idx), 0);
    return {
      type: 'high-card',
      value: value,
      description: `High card ${this.getCardName(sorted[0].value)}`
    };
  }

  checkStraight(values) {
    for (let i = 0; i < values.length - 1; i++) {
      if (values[i] - values[i + 1] !== 1) {
        return false;
      }
    }
    return true;
  }

  getCardName(value) {
    // Reverse mapping of card values to names
    const names = {
      14: 'Ace',
      13: 'King',
      12: 'Queen',
      11: 'Jack',
      10: 'Ten',
      9: 'Nine',
      8: 'Eight',
      7: 'Seven',
      6: 'Six',
      5: 'Five',
      4: 'Four',
      3: 'Three',
      2: 'Two'
    };
    return names[value] || value.toString();
  }

  // Static method for hand evaluation to avoid instantiation
  static evaluateHandStatic(cards) {
    const tempGame = new PokerGame('temp', { id: 'temp', username: 'temp' }, false, 2);
    return tempGame.evaluateHand(cards);
  }

  endHand(winnerId, handRankings = null) {
    // Award pot to winner
    const currentScore = this.scores.get(winnerId) || 0;
    this.scores.set(winnerId, currentScore + this.pot);

    this.status = 'finished';
    this.winner = winnerId;
    this.finalHandRankings = handRankings;
  }

  getGameState() {
    const baseState = super.getGameState();
    return {
      ...baseState,
      variant: this.variant,
      pot: this.pot,
      currentBet: this.currentBet,
      bettingRound: this.bettingRound,
      maxBettingRounds: this.maxBettingRounds,
      currentPlayer: this.currentPlayer ? {
        id: this.currentPlayer.id,
        username: this.currentPlayer.username
      } : null,
      playerBets: Object.fromEntries(this.playerBets),
      foldedPlayers: Array.from(this.foldedPlayers),
      playerHands: Object.fromEntries(
        Array.from(this.playerHands.entries()).map(([playerId, hand]) => [
          playerId,
          hand.map(card => ({ suit: card.suit, rank: card.rank }))
        ])
      ),
      winner: this.winner,
      finalHandRankings: this.finalHandRankings || []
    };
  }
}

module.exports = PokerGame;