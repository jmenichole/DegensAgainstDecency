/**
 * Vercel AI Gateway Integration
 * 
 * Provides unified access to multiple AI providers with automatic failover,
 * load balancing, and cost tracking.
 * 
 * Copyright (c) 2024 Degens Against Decency
 * Licensed under the MIT License
 */

const axios = require('axios');

class VercelAIGateway {
  constructor() {
    // AI Gateway configuration
    this.enabled = process.env.USE_AI_GATEWAY === 'true';
    this.gatewayURL = process.env.AI_GATEWAY_URL || 'https://gateway.ai.cloudflare.com/v1';
    
    // Provider configurations
    this.providers = {
      openai: {
        enabled: !!process.env.OPENAI_API_KEY,
        apiKey: process.env.OPENAI_API_KEY,
        models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
        defaultModel: 'gpt-3.5-turbo',
        endpoint: 'openai',
        costPer1kTokens: {
          'gpt-4': 0.03,
          'gpt-4-turbo': 0.01,
          'gpt-3.5-turbo': 0.0015
        }
      },
      anthropic: {
        enabled: !!process.env.ANTHROPIC_API_KEY,
        apiKey: process.env.ANTHROPIC_API_KEY,
        models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
        defaultModel: 'claude-3-sonnet-20240229',
        endpoint: 'anthropic',
        costPer1kTokens: {
          'claude-3-opus-20240229': 0.015,
          'claude-3-sonnet-20240229': 0.003,
          'claude-3-haiku-20240307': 0.00025
        }
      },
      google: {
        enabled: !!process.env.GOOGLE_AI_KEY,
        apiKey: process.env.GOOGLE_AI_KEY,
        models: ['gemini-pro', 'gemini-pro-vision'],
        defaultModel: 'gemini-pro',
        endpoint: 'google',
        costPer1kTokens: {
          'gemini-pro': 0.00025,
          'gemini-pro-vision': 0.00025
        }
      },
      xai: {
        enabled: !!process.env.XAI_API_KEY,
        apiKey: process.env.XAI_API_KEY,
        models: ['grok-beta'],
        defaultModel: 'grok-beta',
        endpoint: 'xai',
        costPer1kTokens: {
          'grok-beta': 0.002
        }
      }
    };

    // Get list of enabled providers
    this.enabledProviders = Object.keys(this.providers)
      .filter(key => this.providers[key].enabled);

    // Default provider
    this.defaultProvider = process.env.AI_GATEWAY_DEFAULT_PROVIDER || 
      (this.enabledProviders.length > 0 ? this.enabledProviders[0] : 'openai');

    // Cost tracking and usage statistics
    this.statistics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      providerStats: {},
      failoverEvents: 0,
      lastReset: new Date()
    };

    // Initialize provider stats
    Object.keys(this.providers).forEach(provider => {
      this.statistics.providerStats[provider] = {
        requests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        tokens: 0,
        estimatedCost: 0,
        averageLatency: 0,
        totalLatency: 0
      };
    });

    // Cost limits
    this.costLimits = {
      daily: parseFloat(process.env.AI_GATEWAY_COST_LIMIT_DAILY) || 10.0,
      perRequest: parseFloat(process.env.AI_GATEWAY_COST_LIMIT_REQUEST) || 0.10
    };

    // Fallback configuration
    this.fallbackEnabled = process.env.AI_GATEWAY_FALLBACK_ENABLED !== 'false';

    console.log(`🤖 AI Gateway initialized: ${this.enabled ? 'ENABLED' : 'DISABLED'}`);
    console.log(`📊 Enabled providers: ${this.enabledProviders.join(', ') || 'none'}`);
    console.log(`💰 Daily cost limit: $${this.costLimits.daily}`);
  }

  /**
   * Check if AI Gateway is properly configured and enabled
   */
  isEnabled() {
    return this.enabled && this.enabledProviders.length > 0;
  }

  /**
   * Generate text using AI with automatic provider fallback
   * 
   * @param {string} prompt - The prompt to send to the AI
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated text and metadata
   */
  async generateText(prompt, options = {}) {
    if (!this.isEnabled()) {
      throw new Error('AI Gateway is not enabled or no providers configured');
    }

    // Check daily cost limit
    if (this.statistics.totalCost >= this.costLimits.daily) {
      throw new Error(`Daily cost limit of $${this.costLimits.daily} exceeded`);
    }

    const {
      provider = this.defaultProvider,
      model = null, // Auto-select model if not specified
      maxTokens = 500,
      temperature = 0.8,
      systemPrompt = 'You are a creative game content generator. Always respond with valid JSON.',
      fallbackProviders = null, // Auto-determine if not specified
      responseFormat = 'json' // 'json' or 'text'
    } = options;

    // Determine fallback providers if not specified
    const fallbacks = fallbackProviders || 
      this.enabledProviders.filter(p => p !== provider);

    const startTime = Date.now();
    let lastError = null;

    // Try primary provider
    try {
      const result = await this._makeRequest(provider, prompt, {
        model,
        maxTokens,
        temperature,
        systemPrompt,
        responseFormat,
        startTime
      });
      
      this.statistics.successfulRequests++;
      return result;
    } catch (error) {
      console.error(`❌ Primary provider ${provider} failed:`, error.message);
      lastError = error;
      this.statistics.providerStats[provider].failedRequests++;
    }

    // Try fallback providers if enabled
    if (this.fallbackEnabled && fallbacks.length > 0) {
      for (const fallbackProvider of fallbacks) {
        if (!this.providers[fallbackProvider].enabled) {
          continue;
        }

        try {
          console.log(`🔄 Attempting fallback to ${fallbackProvider}...`);
          this.statistics.failoverEvents++;
          
          const result = await this._makeRequest(fallbackProvider, prompt, {
            model: null, // Use default model for fallback
            maxTokens,
            temperature,
            systemPrompt,
            responseFormat,
            startTime
          });
          
          this.statistics.successfulRequests++;
          console.log(`✅ Fallback to ${fallbackProvider} successful`);
          return result;
        } catch (fallbackError) {
          console.error(`❌ Fallback provider ${fallbackProvider} failed:`, fallbackError.message);
          lastError = fallbackError;
          this.statistics.providerStats[fallbackProvider].failedRequests++;
        }
      }
    }

    // All providers failed
    this.statistics.failedRequests++;
    throw new Error(`All AI providers failed. Last error: ${lastError.message}`);
  }

  /**
   * Make a request to a specific AI provider
   * 
   * @private
   */
  async _makeRequest(provider, prompt, options) {
    const providerConfig = this.providers[provider];
    if (!providerConfig || !providerConfig.enabled) {
      throw new Error(`Provider ${provider} is not available`);
    }

    const model = options.model || providerConfig.defaultModel;
    const requestStart = Date.now();

    this.statistics.totalRequests++;
    this.statistics.providerStats[provider].requests++;

    try {
      // Build request based on provider type
      const requestBody = this._buildRequestBody(provider, model, prompt, options);
      const headers = this._buildHeaders(provider, providerConfig);

      // Make the API request
      const response = await axios.post(
        this._getEndpointURL(provider, providerConfig),
        requestBody,
        {
          headers,
          timeout: 30000 // 30 second timeout
        }
      );

      // Extract response data
      const result = this._extractResponse(provider, response.data, options.responseFormat);
      
      // Track usage and costs
      const usage = this._extractUsage(provider, response.data);
      this._trackUsage(provider, model, usage, requestStart);

      return {
        text: result,
        provider,
        model,
        usage,
        latency: Date.now() - requestStart
      };
    } catch (error) {
      const latency = Date.now() - requestStart;
      this._trackFailure(provider, latency);
      
      if (error.response) {
        throw new Error(`${provider} API error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
      } else if (error.request) {
        throw new Error(`${provider} network error: No response received`);
      } else {
        throw new Error(`${provider} request error: ${error.message}`);
      }
    }
  }

  /**
   * Build request body for specific provider
   * 
   * @private
   */
  _buildRequestBody(provider, model, prompt, options) {
    const baseRequest = {
      model,
      max_tokens: options.maxTokens,
      temperature: options.temperature
    };

    // Provider-specific request formatting
    switch (provider) {
      case 'openai':
      case 'xai':
        return {
          ...baseRequest,
          messages: [
            { role: 'system', content: options.systemPrompt },
            { role: 'user', content: prompt }
          ],
          response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined
        };
      
      case 'anthropic':
        return {
          ...baseRequest,
          system: options.systemPrompt,
          messages: [
            { role: 'user', content: prompt }
          ]
        };
      
      case 'google':
        return {
          contents: [{
            parts: [{
              text: `${options.systemPrompt}\n\n${prompt}`
            }]
          }],
          generationConfig: {
            maxOutputTokens: options.maxTokens,
            temperature: options.temperature
          }
        };
      
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Build headers for specific provider
   * 
   * @private
   */
  _buildHeaders(provider, config) {
    switch (provider) {
      case 'openai':
      case 'xai':
        return {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        };
      
      case 'anthropic':
        return {
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        };
      
      case 'google':
        return {
          'Content-Type': 'application/json'
        };
      
      default:
        return {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        };
    }
  }

  /**
   * Get endpoint URL for provider
   * 
   * @private
   */
  _getEndpointURL(provider, config) {
    // If using AI Gateway, route through it
    if (this.enabled && this.gatewayURL) {
      switch (provider) {
        case 'openai':
          return `${this.gatewayURL}/openai/chat/completions`;
        case 'anthropic':
          return `${this.gatewayURL}/anthropic/messages`;
        case 'google':
          return `${this.gatewayURL}/google/generateContent?key=${config.apiKey}`;
        case 'xai':
          return `${this.gatewayURL}/xai/chat/completions`;
        default:
          throw new Error(`Unknown provider endpoint: ${provider}`);
      }
    }

    // Direct provider URLs (fallback when not using gateway)
    switch (provider) {
      case 'openai':
        return 'https://api.openai.com/v1/chat/completions';
      case 'anthropic':
        return 'https://api.anthropic.com/v1/messages';
      case 'google':
        return `https://generativelanguage.googleapis.com/v1/models/${config.defaultModel}:generateContent?key=${config.apiKey}`;
      case 'xai':
        return 'https://api.x.ai/v1/chat/completions';
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Extract response text from provider response
   * 
   * @private
   */
  _extractResponse(provider, data, format) {
    switch (provider) {
      case 'openai':
      case 'xai':
        return data.choices[0].message.content;
      
      case 'anthropic':
        return data.content[0].text;
      
      case 'google':
        return data.candidates[0].content.parts[0].text;
      
      default:
        throw new Error(`Unknown provider response format: ${provider}`);
    }
  }

  /**
   * Extract usage statistics from provider response
   * 
   * @private
   */
  _extractUsage(provider, data) {
    switch (provider) {
      case 'openai':
      case 'xai':
        return {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        };
      
      case 'anthropic':
        return {
          promptTokens: data.usage?.input_tokens || 0,
          completionTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
        };
      
      case 'google':
        // Google doesn't provide detailed token counts in the same way
        return {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        };
      
      default:
        return {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        };
    }
  }

  /**
   * Track usage statistics and costs
   * 
   * @private
   */
  _trackUsage(provider, model, usage, requestStart) {
    const providerConfig = this.providers[provider];
    const stats = this.statistics.providerStats[provider];
    const latency = Date.now() - requestStart;

    // Update token counts
    stats.tokens += usage.totalTokens;
    this.statistics.totalTokens += usage.totalTokens;

    // Calculate cost
    const costPer1k = providerConfig.costPer1kTokens[model] || 0.001;
    const cost = (usage.totalTokens / 1000) * costPer1k;
    
    stats.estimatedCost += cost;
    stats.successfulRequests++;
    this.statistics.totalCost += cost;

    // Update latency stats
    stats.totalLatency += latency;
    stats.averageLatency = stats.totalLatency / stats.successfulRequests;

    console.log(`📊 ${provider}/${model}: ${usage.totalTokens} tokens, $${cost.toFixed(4)}, ${latency}ms`);
  }

  /**
   * Track failed request
   * 
   * @private
   */
  _trackFailure(provider, latency) {
    const stats = this.statistics.providerStats[provider];
    stats.totalLatency += latency;
  }

  /**
   * Get usage statistics
   * 
   * @returns {Object} Usage statistics
   */
  getStatistics() {
    return {
      ...this.statistics,
      uptime: Date.now() - this.statistics.lastReset.getTime(),
      successRate: this.statistics.totalRequests > 0
        ? (this.statistics.successfulRequests / this.statistics.totalRequests * 100).toFixed(2) + '%'
        : 'N/A',
      costRemaining: Math.max(0, this.costLimits.daily - this.statistics.totalCost).toFixed(2),
      enabledProviders: this.enabledProviders
    };
  }

  /**
   * Reset statistics (useful for testing or daily resets)
   */
  resetStatistics() {
    Object.keys(this.statistics.providerStats).forEach(provider => {
      this.statistics.providerStats[provider] = {
        requests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        tokens: 0,
        estimatedCost: 0,
        averageLatency: 0,
        totalLatency: 0
      };
    });

    this.statistics.totalRequests = 0;
    this.statistics.successfulRequests = 0;
    this.statistics.failedRequests = 0;
    this.statistics.totalTokens = 0;
    this.statistics.totalCost = 0;
    this.statistics.failoverEvents = 0;
    this.statistics.lastReset = new Date();

    console.log('📊 Statistics reset');
  }

  /**
   * Check if cost limits would be exceeded
   * 
   * @param {number} estimatedTokens - Estimated tokens for request
   * @param {string} provider - Provider to use
   * @param {string} model - Model to use
   * @returns {boolean} True if within limits
   */
  checkCostLimits(estimatedTokens, provider, model) {
    const providerConfig = this.providers[provider];
    if (!providerConfig) return false;

    const costPer1k = providerConfig.costPer1kTokens[model] || 0.001;
    const estimatedCost = (estimatedTokens / 1000) * costPer1k;

    return (
      this.statistics.totalCost + estimatedCost <= this.costLimits.daily &&
      estimatedCost <= this.costLimits.perRequest
    );
  }
}

module.exports = VercelAIGateway;
