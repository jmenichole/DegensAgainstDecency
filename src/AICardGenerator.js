/**
 * AI Card Generator - Dynamic content generation
 * 
 * Copyright (c) 2024 Degens Against Decency
 * Licensed under the MIT License
 * See LICENSE file in the project root for full license information.
 */

const axios = require('axios');

class AICardGenerator {
  constructor() {
    this.baseURL = process.env.CARD_GENERATOR_URL || 'https://degenscardbot.vercel.app/api/generate';
    this.apiKey = process.env.OPENAI_API_KEY; // Still support direct OpenAI as fallback
  }

  async generateDegensCards(count = 10, theme = 'general') {
    try {
      // Try using the card bot API first
      const response = await axios.post(this.baseURL, {
        count,
        theme,
        gameType: 'degens-against-decency'
      }, {
        timeout: 10000
      });

      if (response.data && response.data.cards) {
        return response.data.cards.map(card => ({
          id: Date.now() + Math.random(),
          type: card.type,
          text: card.text,
          category: card.category || 'general',
          gameType: 'degens',
          aiGenerated: true
        }));
      }

      throw new Error('Invalid response from card generator');
    } catch (error) {
      console.error('Error generating Degens cards from card bot:', error.message);
      
      // Fallback to direct OpenAI if available
      if (this.apiKey && !this.apiKey.startsWith('sk-fake')) {
        try {
          return await this.generateWithOpenAI(count, theme);
        } catch (openaiError) {
          console.error('Error with OpenAI fallback:', openaiError.message);
        }
      }
      
      return this.getFallbackDegensCards();
    }
  }

  async generateWithOpenAI(count, theme) {
    const prompt = `Generate ${count} Cards Against Humanity style cards for a game called "Degens Against Decency". 
    Create ${Math.floor(count/2)} question cards (with blank spaces marked by ___) and ${Math.ceil(count/2)} answer cards.
    Keep them slightly edgy but not offensive or harmful. Theme: ${theme}.
    Return as JSON array with objects having "type" (question/answer), "text", and "category" fields.`;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a creative game content generator. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.8
    }, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const cards = JSON.parse(response.data.choices[0].message.content);
    return cards.map(card => ({
      id: Date.now() + Math.random(),
      type: card.type,
      text: card.text,
      category: card.category || 'general',
      gameType: 'degens',
      aiGenerated: true
    }));
  }

  async generateTwoTruthsPrompts(count = 5, difficulty = 'medium') {
    try {
      const response = await axios.post(this.baseURL, {
        count,
        difficulty,
        gameType: '2-truths-and-a-lie'
      }, {
        timeout: 10000
      });

      if (response.data && response.data.prompts) {
        return response.data.prompts.map(prompt => ({
          id: Date.now() + Math.random(),
          prompt: prompt.prompt,
          difficulty: prompt.difficulty,
          example: prompt.example,
          aiGenerated: true
        }));
      }

      throw new Error('Invalid response from card generator');
    } catch (error) {
      console.error('Error generating 2 Truths prompts:', error.message);
      return this.getFallbackTwoTruthsPrompts();
    }
  }

  getFallbackDegensCards() {
    return [
      { id: 1, type: 'question', text: 'What did I eat for breakfast that made everyone leave the room?', category: 'food', gameType: 'degens', aiGenerated: false },
      { id: 2, type: 'answer', text: 'My dignity', category: 'general', gameType: 'degens', aiGenerated: false },
      { id: 3, type: 'question', text: 'The real reason I got fired was ___.', category: 'work', gameType: 'degens', aiGenerated: false },
      { id: 4, type: 'answer', text: 'Showing up in pajamas', category: 'general', gameType: 'degens', aiGenerated: false },
      { id: 5, type: 'question', text: 'My dating profile would be complete with ___.', category: 'dating', gameType: 'degens', aiGenerated: false },
      { id: 6, type: 'answer', text: 'A warning label', category: 'general', gameType: 'degens', aiGenerated: false }
    ];
  }

  getFallbackTwoTruthsPrompts() {
    return [
      { id: 1, prompt: 'Tell us about an unusual food you\'ve eaten', difficulty: 'easy', example: 'I once ate chocolate-covered insects' },
      { id: 2, prompt: 'Share a weird talent or skill you have', difficulty: 'medium', example: 'I can juggle while riding a unicycle' },
      { id: 3, prompt: 'Describe an awkward encounter with a celebrity', difficulty: 'hard', example: 'I accidentally spilled coffee on a famous actor' },
      { id: 4, prompt: 'Tell us about a strange place you\'ve been', difficulty: 'medium', example: 'I once got lost in a corn maze for 3 hours' },
      { id: 5, prompt: 'Share a funny childhood misconception', difficulty: 'easy', example: 'I thought clouds were made of cotton candy until I was 8' }
    ];
  }
}

module.exports = AICardGenerator;