/**
 * AI Card Generator - Dynamic content generation using OpenAI
 * 
 * Copyright (c) 2024 Degens Against Decency
 * Licensed under the MIT License
 * See LICENSE file in the project root for full license information.
 */

const axios = require('axios');

class AICardGenerator {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1/chat/completions';
  }

  async generateDegensCards(count = 10, theme = 'general') {
    try {
      const prompt = `Generate ${count} Cards Against Humanity style cards for a game called "Degens Against Decency". 
      Create ${Math.floor(count/2)} question cards (with blank spaces marked by ___) and ${Math.ceil(count/2)} answer cards.
      Keep them slightly edgy but not offensive or harmful. Theme: ${theme}.
      Return as JSON array with objects having "type" (question/answer), "text", and "category" fields.`;

      const response = await this.makeAPICall(prompt);
      return this.parseCardResponse(response, 'degens');
    } catch (error) {
      console.error('Error generating Degens cards:', error.message);
      return this.getFallbackDegensCards();
    }
  }

  async generateTwoTruthsPrompts(count = 5, difficulty = 'medium') {
    try {
      const prompt = `Generate ${count} creative prompts for a "2 Truths and a Lie" game.
      Each prompt should be a category or theme that players can use to create their statements.
      Difficulty level: ${difficulty}. Make them engaging and fun.
      Return as JSON array with objects having "prompt", "difficulty", and "example" fields.`;

      const response = await this.makeAPICall(prompt);
      return this.parseTwoTruthsResponse(response);
    } catch (error) {
      console.error('Error generating 2 Truths prompts:', error.message);
      return this.getFallbackTwoTruthsPrompts();
    }
  }

  async makeAPICall(prompt) {
    if (!this.apiKey || this.apiKey.startsWith('sk-fake')) {
      throw new Error('No valid OpenAI API key provided');
    }

    const response = await axios.post(this.baseURL, {
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

    return response.data.choices[0].message.content;
  }

  parseCardResponse(response, gameType) {
    try {
      const cards = JSON.parse(response);
      return cards.map(card => ({
        id: Date.now() + Math.random(),
        type: card.type,
        text: card.text,
        category: card.category || 'general',
        gameType,
        aiGenerated: true
      }));
    } catch (error) {
      console.error('Error parsing AI response:', error.message);
      return [];
    }
  }

  parseTwoTruthsResponse(response) {
    try {
      const prompts = JSON.parse(response);
      return prompts.map(prompt => ({
        id: Date.now() + Math.random(),
        prompt: prompt.prompt,
        difficulty: prompt.difficulty,
        example: prompt.example,
        aiGenerated: true
      }));
    } catch (error) {
      console.error('Error parsing 2 Truths response:', error.message);
      return [];
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