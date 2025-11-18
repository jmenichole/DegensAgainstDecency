/**
 * AI Card Generator - Dynamic content generation
 * 
 * Copyright (c) 2024 Degens Against Decency
 * Licensed under the MIT License
 * See LICENSE file in the project root for full license information.
 */

const axios = require('axios');
const VercelAIGateway = require('./AIGateway');

class AICardGenerator {
  constructor() {
    this.baseURL = process.env.CARD_GENERATOR_URL || 'https://degenscardbot.vercel.app/api/generate';
    this.apiKey = process.env.OPENAI_API_KEY; // Still support direct OpenAI as fallback
    this.autonomaApiKey = process.env.AUTONOMA_API_KEY; // Autonoma API key for card generation service
    
    // Initialize AI Gateway
    this.aiGateway = new VercelAIGateway();
    this.useGateway = this.aiGateway.isEnabled();
    
    if (this.useGateway) {
      console.log('🎮 AICardGenerator: Using Vercel AI Gateway for multi-provider support');
    } else if (this.autonomaApiKey) {
      console.log('🎮 AICardGenerator: Using Autonoma API for card generation');
    } else {
      console.log('🎮 AICardGenerator: Using legacy card generation (AI Gateway disabled)');
    }
  }
  
  /**
   * Get AI Gateway statistics
   */
  getAIGatewayStats() {
    return this.aiGateway.getStatistics();
  }

  async generateDegensCards(count = 10, theme = 'general') {
    // Use AI Gateway if enabled
    if (this.useGateway) {
      try {
        return await this.generateDegensCardsWithGateway(count, theme);
      } catch (gatewayError) {
        console.error('AI Gateway failed, falling back to legacy methods:', gatewayError.message);
      }
    }
    
    // Legacy method 1: Try using the card bot API first
    try {
      const requestConfig = {
        timeout: 10000
      };
      
      // Add Autonoma API key to headers if available
      if (this.autonomaApiKey) {
        requestConfig.headers = {
          'Authorization': `Bearer ${this.autonomaApiKey}`,
          'X-API-Key': this.autonomaApiKey
        };
      }
      
      const response = await axios.post(this.baseURL, {
        count,
        theme,
        gameType: 'degens-against-decency'
      }, requestConfig);

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
      
      // Legacy method 2: Fallback to direct OpenAI if available
      if (this.apiKey && !this.apiKey.startsWith('sk-fake')) {
        try {
          return await this.generateWithOpenAI(count, theme);
        } catch (openaiError) {
          console.error('Error with OpenAI fallback:', openaiError.message);
        }
      }
      
      // Final fallback: Static cards
      return this.getFallbackDegensCards();
    }
  }

  /**
   * Generate Degens cards using AI Gateway with multi-provider support
   */
  async generateDegensCardsWithGateway(count = 10, theme = 'general') {
    const questionCount = Math.floor(count / 2);
    const answerCount = Math.ceil(count / 2);
    
    const prompt = `Generate ${count} Cards Against Humanity style cards for a game called "Degens Against Decency". 
Theme: ${theme}

Create exactly ${questionCount} question cards (prompts with blank spaces marked by ___) and ${answerCount} answer cards (responses).
Keep them slightly edgy but not offensive or harmful.

Return a valid JSON array with this exact structure:
[
  {"type": "question", "text": "What did I bring to the party? ___.", "category": "${theme}"},
  {"type": "answer", "text": "My questionable life choices", "category": "${theme}"}
]

Important: Ensure the JSON is properly formatted and parseable.`;

    try {
      const result = await this.aiGateway.generateText(prompt, {
        provider: process.env.AI_GATEWAY_DEFAULT_PROVIDER || 'openai',
        model: process.env.AI_GATEWAY_DEFAULT_MODEL || 'gpt-3.5-turbo',
        maxTokens: 1500,
        temperature: 0.9,
        systemPrompt: 'You are a creative game content generator. Always respond with valid, parseable JSON only. Do not include any explanatory text or markdown formatting.',
        responseFormat: 'json'
      });

      // Parse the AI response
      let cards;
      try {
        // Try to parse the response directly
        cards = JSON.parse(result.text);
      } catch (parseError) {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = result.text.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
        if (jsonMatch) {
          cards = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Failed to parse AI response as JSON');
        }
      }

      if (!Array.isArray(cards)) {
        throw new Error('AI response is not an array');
      }

      // Format cards with metadata
      return cards.map(card => ({
        id: Date.now() + Math.random(),
        type: card.type,
        text: card.text,
        category: card.category || theme,
        gameType: 'degens',
        aiGenerated: true,
        provider: result.provider,
        model: result.model
      }));
    } catch (error) {
      console.error('AI Gateway card generation failed:', error);
      throw error;
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
    // Use AI Gateway if enabled
    if (this.useGateway) {
      try {
        return await this.generateTwoTruthsPromptsWithGateway(count, difficulty);
      } catch (gatewayError) {
        console.error('AI Gateway failed for 2 Truths prompts, falling back:', gatewayError.message);
      }
    }
    
    // Legacy method: Try card bot API
    try {
      const requestConfig = {
        timeout: 10000
      };
      
      // Add Autonoma API key to headers if available
      if (this.autonomaApiKey) {
        requestConfig.headers = {
          'Authorization': `Bearer ${this.autonomaApiKey}`,
          'X-API-Key': this.autonomaApiKey
        };
      }
      
      const response = await axios.post(this.baseURL, {
        count,
        difficulty,
        gameType: '2-truths-and-a-lie'
      }, requestConfig);

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

  /**
   * Generate Two Truths and a Lie prompts using AI Gateway
   */
  async generateTwoTruthsPromptsWithGateway(count = 5, difficulty = 'medium') {
    const prompt = `Generate ${count} creative prompts for the game "Two Truths and a Lie".
Difficulty level: ${difficulty}

Each prompt should inspire players to create interesting truths and a believable lie.

Return a valid JSON array with this exact structure:
[
  {
    "prompt": "Tell us about an unusual food you've eaten",
    "difficulty": "${difficulty}",
    "example": "I once ate chocolate-covered insects at a festival"
  }
]

Important: Ensure the JSON is properly formatted and parseable.`;

    try {
      const result = await this.aiGateway.generateText(prompt, {
        provider: process.env.AI_GATEWAY_DEFAULT_PROVIDER || 'openai',
        model: process.env.AI_GATEWAY_DEFAULT_MODEL || 'gpt-3.5-turbo',
        maxTokens: 800,
        temperature: 0.8,
        systemPrompt: 'You are a creative game content generator. Always respond with valid, parseable JSON only.',
        responseFormat: 'json'
      });

      // Parse the AI response
      let prompts;
      try {
        prompts = JSON.parse(result.text);
      } catch (parseError) {
        const jsonMatch = result.text.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
        if (jsonMatch) {
          prompts = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Failed to parse AI response as JSON');
        }
      }

      return prompts.map(prompt => ({
        id: Date.now() + Math.random(),
        prompt: prompt.prompt,
        difficulty: prompt.difficulty,
        example: prompt.example,
        aiGenerated: true,
        provider: result.provider,
        model: result.model
      }));
    } catch (error) {
      console.error('AI Gateway 2 Truths prompt generation failed:', error);
      throw error;
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