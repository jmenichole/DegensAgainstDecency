/**
 * Degens Against Decency Game - Main game implementation
 * 
 * Copyright (c) 2024 Degens Against Decency
 * Licensed under the MIT License
 * See LICENSE file in the project root for full license information.
 */

const BaseGame = require('./BaseGame');
const AICardGenerator = require('../AICardGenerator');

class DegensAgainstDecencyGame extends BaseGame {
  constructor(id, creator, isPrivate, maxPlayers) {
    super(id, creator, isPrivate, maxPlayers);
    this.type = 'degens-against-decency';
    this.aiCardGenerator = new AICardGenerator();
    
    this.questionCards = [];
    this.answerCards = [];
    this.currentQuestion = null;
    this.submissions = new Map();
    this.playerHands = new Map();
    this.cardCzar = null;
    this.cardsPerHand = 7;
    this.maxRounds = 10;
  }

  async initializeGame() {
    try {
      // Generate cards using AI
      const cards = await this.aiCardGenerator.generateDegensCards(50);
      
      this.questionCards = cards.filter(card => card.type === 'question');
      this.answerCards = cards.filter(card => card.type === 'answer');
      
      // If not enough cards, add fallback cards
      if (this.questionCards.length < 10) {
        const fallbackCards = this.aiCardGenerator.getFallbackDegensCards();
        this.questionCards.push(...fallbackCards.filter(card => card.type === 'question'));
        this.answerCards.push(...fallbackCards.filter(card => card.type === 'answer'));
      }
      
      this.shuffleCards();
      this.dealInitialHands();
      this.selectCardCzar();
      this.drawQuestion();
      
    } catch (error) {
      console.error('Error initializing Degens game:', error);
      // Use fallback cards if AI fails
      const fallbackCards = this.aiCardGenerator.getFallbackDegensCards();
      this.questionCards = fallbackCards.filter(card => card.type === 'question');
      this.answerCards = fallbackCards.filter(card => card.type === 'answer');
      this.shuffleCards();
      this.dealInitialHands();
      this.selectCardCzar();
      this.drawQuestion();
    }
  }

  shuffleCards() {
    this.answerCards = this.answerCards.sort(() => Math.random() - 0.5);
    this.questionCards = this.questionCards.sort(() => Math.random() - 0.5);
  }

  dealInitialHands() {
    for (const player of this.players) {
      const hand = [];
      for (let i = 0; i < this.cardsPerHand; i++) {
        if (this.answerCards.length > 0) {
          hand.push(this.answerCards.pop());
        }
      }
      this.playerHands.set(player.id, hand);
    }
  }

  selectCardCzar() {
    const currentCzarIndex = this.players.findIndex(p => p.id === this.cardCzar?.id) || 0;
    const nextIndex = (currentCzarIndex + 1) % this.players.length;
    this.cardCzar = this.players[nextIndex];
  }

  drawQuestion() {
    if (this.questionCards.length > 0) {
      this.currentQuestion = this.questionCards.pop();
      this.submissions.clear();
    }
  }

  handleAction(userId, action) {
    switch (action.type) {
      case 'start-game':
        return this.startGame();
      
      case 'submit-card':
        return this.submitCard(userId, action.cardId);
      
      case 'judge-submission':
        if (userId === this.cardCzar.id) {
          return this.judgeSubmission(action.playerId);
        }
        return { success: false, error: 'Only the Card Czar can judge submissions' };
      
      case 'next-round':
        if (userId === this.cardCzar.id) {
          return this.nextRound();
        }
        return { success: false, error: 'Only the Card Czar can advance rounds' };
      
      default:
        return { success: false, error: 'Unknown action' };
    }
  }

  submitCard(userId, cardId) {
    if (userId === this.cardCzar.id) {
      return { success: false, error: 'Card Czar cannot submit cards' };
    }

    if (this.submissions.has(userId)) {
      return { success: false, error: 'You have already submitted a card this round' };
    }

    const playerHand = this.playerHands.get(userId);
    const cardIndex = playerHand.findIndex(card => card.id === cardId);
    
    if (cardIndex === -1) {
      return { success: false, error: 'Card not found in your hand' };
    }

    const submittedCard = playerHand.splice(cardIndex, 1)[0];
    this.submissions.set(userId, submittedCard);

    // Draw a new card
    if (this.answerCards.length > 0) {
      playerHand.push(this.answerCards.pop());
    }

    return { success: true };
  }

  judgeSubmission(winnerId) {
    if (!this.submissions.has(winnerId)) {
      return { success: false, error: 'Invalid winner selection' };
    }

    // Award point to winner
    const currentScore = this.scores.get(winnerId) || 0;
    this.scores.set(winnerId, currentScore + 1);

    return { success: true, winner: winnerId };
  }

  nextRound() {
    this.currentRound++;
    
    if (this.currentRound > this.maxRounds) {
      this.endGame();
      return { success: true, gameEnded: true };
    }

    this.selectCardCzar();
    this.drawQuestion();
    this.submissions.clear();

    return { success: true };
  }

  endGame() {
    this.status = 'finished';
    
    // Find winner(s)
    let maxScore = 0;
    const winners = [];
    
    for (const [playerId, score] of this.scores) {
      if (score > maxScore) {
        maxScore = score;
        winners.length = 0;
        winners.push(playerId);
      } else if (score === maxScore) {
        winners.push(playerId);
      }
    }

    this.winners = winners;
  }

  getGameState() {
    const baseState = super.getGameState();
    return {
      ...baseState,
      currentQuestion: this.currentQuestion,
      cardCzar: this.cardCzar ? { id: this.cardCzar.id, username: this.cardCzar.username } : null,
      submissions: Array.from(this.submissions.entries()).map(([playerId, card]) => ({
        playerId,
        card: { id: card.id, text: card.text }
      })),
      playerHands: Object.fromEntries(
        Array.from(this.playerHands.entries()).map(([playerId, hand]) => [
          playerId,
          hand.map(card => ({ id: card.id, text: card.text }))
        ])
      ),
      maxRounds: this.maxRounds,
      winners: this.winners || [],
      allSubmitted: this.submissions.size === this.players.length - 1 // All except card czar
    };
  }
}

module.exports = DegensAgainstDecencyGame;