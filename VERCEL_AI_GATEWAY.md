# Vercel AI Gateway Integration Guide

## Overview

Vercel AI Gateway provides a unified API endpoint to access hundreds of AI models from multiple providers (OpenAI, Anthropic, Google, xAI, etc.) with automatic failover, load balancing, and cost monitoring. This guide explores use cases for integrating Vercel AI Gateway into the Degens Against Decency game platform.

## What is Vercel AI Gateway?

Vercel AI Gateway is a production-ready infrastructure layer that:
- **Unifies AI Access**: Single REST endpoint for all major AI providers
- **Ensures Reliability**: Automatic failover and load balancing across providers
- **Reduces Costs**: Transparent "bring your own key" pricing with no markup
- **Improves Performance**: Low latency (~20ms) with global edge deployment
- **Provides Insights**: Unified observability, usage analytics, and cost tracking
- **Prevents Lock-in**: Provider-agnostic architecture for easy model switching

## Use Cases for Degens Against Decency

### 1. **AI Card Generation with Multi-Provider Support**

**Current State**: The game currently uses either a custom card generator API or direct OpenAI integration with fallback to static content.

**With AI Gateway**:
- Generate game cards using multiple AI providers (OpenAI GPT-4, Anthropic Claude, Google Gemini)
- Automatically switch providers if one is down or rate-limited
- Compare quality and cost across different models for optimal card generation
- Handle traffic spikes with load balancing

**Benefits**:
- 99.9% uptime for AI card generation
- Cost optimization by using different models for different card types
- Faster response times with intelligent routing
- No more failed card generation due to single provider issues

### 2. **Dynamic Content Moderation**

**Use Case**: Ensure generated cards and user-submitted content are appropriate for the game context.

**Implementation**:
- Use AI models to analyze card text for inappropriate content
- Multiple provider validation for higher accuracy
- Automatic fallback if moderation API is unavailable
- Real-time content filtering before cards are added to games

**Benefits**:
- Safer gaming environment
- Reduced manual moderation overhead
- Consistent content quality across games
- Multiple model consensus for edge cases

### 3. **Intelligent Game Master / AI Player**

**Use Case**: Create an AI-powered player that can participate in games when human players are unavailable.

**Implementation**:
- AI evaluates cards and makes strategic choices
- Different AI models provide diverse playing styles
- Real-time decision making with low latency
- Fallback to different providers ensures AI player always available

**Benefits**:
- Players can practice against AI
- Games can start with fewer human players
- Dynamic difficulty adjustment using different models
- Enhanced single-player experience

### 4. **Personalized Card Generation**

**Use Case**: Generate custom cards based on player preferences, play history, and game themes.

**Implementation**:
- Analyze player's past card choices and wins
- Generate personalized cards matching player's humor style
- Use different AI models for different humor types
- A/B test card quality across providers

**Benefits**:
- Increased player engagement
- More relevant and funny content
- Better replayability
- Data-driven content optimization

### 5. **Real-time Chat Moderation and Enhancement**

**Use Case**: Moderate in-game chat and suggest witty responses.

**Implementation**:
- Real-time chat analysis for toxicity
- AI-suggested comebacks and jokes
- Auto-translate messages for international players
- Context-aware chat assistance

**Benefits**:
- Healthier community
- Language barrier reduction
- Enhanced social interaction
- Safer environment for all players

### 6. **Cost Optimization and Analytics**

**Use Case**: Track and optimize AI usage costs across the platform.

**Implementation**:
- Monitor token usage per game type
- Compare costs across different providers
- Set budget limits and alerts
- Automatic provider switching based on cost thresholds

**Benefits**:
- Predictable AI costs
- Data-driven provider selection
- Budget control and forecasting
- ROI measurement for AI features

### 7. **Game Difficulty Adjustment**

**Use Case**: Dynamically adjust card difficulty and complexity based on player skill level.

**Implementation**:
- Use different AI models for beginner vs. expert content
- Simpler models (faster/cheaper) for casual games
- Advanced models (GPT-4, Claude) for expert games
- Automatic quality scaling based on game settings

**Benefits**:
- Better new player onboarding
- Expert players stay challenged
- Cost optimization (don't use GPT-4 for beginners)
- Improved player retention

### 8. **Multi-language Support**

**Use Case**: Generate and translate game content for international audiences.

**Implementation**:
- Generate cards in multiple languages
- Use provider strengths (e.g., Claude for French, GPT-4 for Spanish)
- Real-time translation with fallback
- Cultural adaptation of humor

**Benefits**:
- Global player base
- Culturally relevant content
- Automatic localization
- Provider redundancy for translation

## Implementation Architecture

### Basic Integration

```javascript
// src/AIGateway.js
const axios = require('axios');

class VercelAIGateway {
  constructor() {
    this.gatewayURL = 'https://gateway.ai.cloudflare.com/v1';
    this.providers = {
      openai: {
        apiKey: process.env.OPENAI_API_KEY,
        models: ['gpt-4', 'gpt-3.5-turbo'],
        endpoint: 'openai'
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY,
        models: ['claude-3-opus', 'claude-3-sonnet'],
        endpoint: 'anthropic'
      },
      google: {
        apiKey: process.env.GOOGLE_AI_KEY,
        models: ['gemini-pro', 'gemini-pro-vision'],
        endpoint: 'google'
      }
    };
    this.costTracking = {
      totalTokens: 0,
      totalCost: 0,
      requestsByProvider: {}
    };
  }

  async generateText(prompt, options = {}) {
    const {
      provider = 'openai',
      model = 'gpt-3.5-turbo',
      maxTokens = 500,
      temperature = 0.8,
      fallbackProviders = ['anthropic', 'google']
    } = options;

    // Try primary provider
    try {
      return await this._makeRequest(provider, model, prompt, {
        maxTokens,
        temperature
      });
    } catch (error) {
      console.log(`Primary provider ${provider} failed, trying fallback...`);
      
      // Try fallback providers
      for (const fallbackProvider of fallbackProviders) {
        try {
          return await this._makeRequest(
            fallbackProvider,
            this.providers[fallbackProvider].models[0],
            prompt,
            { maxTokens, temperature }
          );
        } catch (fallbackError) {
          console.log(`Fallback provider ${fallbackProvider} failed`);
        }
      }
      
      throw new Error('All providers failed');
    }
  }

  async _makeRequest(provider, model, prompt, options) {
    const providerConfig = this.providers[provider];
    if (!providerConfig) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    const response = await axios.post(
      `${this.gatewayURL}/${providerConfig.endpoint}/chat/completions`,
      {
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens,
        temperature: options.temperature
      },
      {
        headers: {
          'Authorization': `Bearer ${providerConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    // Track usage
    this._trackUsage(provider, response.data.usage);

    return response.data.choices[0].message.content;
  }

  _trackUsage(provider, usage) {
    this.costTracking.totalTokens += usage.total_tokens;
    
    if (!this.costTracking.requestsByProvider[provider]) {
      this.costTracking.requestsByProvider[provider] = {
        requests: 0,
        tokens: 0,
        estimatedCost: 0
      };
    }
    
    this.costTracking.requestsByProvider[provider].requests++;
    this.costTracking.requestsByProvider[provider].tokens += usage.total_tokens;
  }

  getUsageStats() {
    return this.costTracking;
  }
}

module.exports = VercelAIGateway;
```

### Enhanced AICardGenerator with AI Gateway

```javascript
// Updated src/AICardGenerator.js
const VercelAIGateway = require('./AIGateway');

class AICardGenerator {
  constructor() {
    this.aiGateway = new VercelAIGateway();
    this.useGateway = process.env.USE_AI_GATEWAY === 'true';
  }

  async generateDegensCards(count = 10, theme = 'general') {
    if (!this.useGateway) {
      // Fallback to existing implementation
      return this.generateCardsLegacy(count, theme);
    }

    try {
      const prompt = `Generate ${count} Cards Against Humanity style cards for "Degens Against Decency". 
      Theme: ${theme}. Create ${Math.floor(count/2)} questions with blanks (___) and ${Math.ceil(count/2)} answers.
      Return as JSON array with objects: {"type": "question"|"answer", "text": "card text", "category": "${theme}"}`;

      const response = await this.aiGateway.generateText(prompt, {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        temperature: 0.9,
        maxTokens: 1000,
        fallbackProviders: ['anthropic', 'google']
      });

      const cards = JSON.parse(response);
      return cards.map(card => ({
        id: Date.now() + Math.random(),
        type: card.type,
        text: card.text,
        category: card.category || theme,
        gameType: 'degens',
        aiGenerated: true,
        provider: 'ai-gateway'
      }));
    } catch (error) {
      console.error('AI Gateway card generation failed:', error);
      return this.getFallbackDegensCards();
    }
  }

  async generateCardsWithQualityTier(count, theme, qualityTier = 'standard') {
    const tierConfig = {
      basic: {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        temperature: 0.7
      },
      standard: {
        provider: 'anthropic',
        model: 'claude-3-sonnet',
        temperature: 0.8
      },
      premium: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: 0.9
      }
    };

    const config = tierConfig[qualityTier] || tierConfig.standard;
    
    const prompt = `Generate ${count} high-quality Cards Against Humanity style cards...`;
    
    const response = await this.aiGateway.generateText(prompt, config);
    // Parse and return cards...
  }
}
```

## Configuration

### Environment Variables

Add to `.env`:

```bash
# Vercel AI Gateway Configuration
USE_AI_GATEWAY=true
AI_GATEWAY_URL=https://gateway.ai.cloudflare.com/v1

# Provider API Keys (bring your own)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_KEY=...
XAI_API_KEY=...

# AI Gateway Settings
AI_GATEWAY_DEFAULT_PROVIDER=openai
AI_GATEWAY_FALLBACK_ENABLED=true
AI_GATEWAY_COST_LIMIT_DAILY=10.00
AI_GATEWAY_ENABLE_TRACKING=true
```

### Deployment on Vercel

1. **Enable AI Gateway** in Vercel Dashboard:
   - Go to Project Settings → AI Gateway
   - Enable AI Gateway for your project
   - Configure provider API keys

2. **Set Environment Variables** in Vercel:
   - Add all provider API keys
   - Set `USE_AI_GATEWAY=true`
   - Configure cost limits and monitoring

3. **Deploy**: Vercel automatically routes AI requests through the gateway

## Monitoring and Analytics

### Usage Dashboard

Access real-time metrics:
- Requests per provider
- Token usage and costs
- Success/failure rates
- Average latency
- Failover events

### Cost Tracking API

```javascript
// GET /api/ai-gateway/stats
app.get('/api/ai-gateway/stats', (req, res) => {
  const stats = aiGateway.getUsageStats();
  res.json({
    totalRequests: Object.values(stats.requestsByProvider)
      .reduce((sum, p) => sum + p.requests, 0),
    totalTokens: stats.totalTokens,
    estimatedCost: stats.totalCost,
    byProvider: stats.requestsByProvider
  });
});
```

## Best Practices

1. **Always Enable Fallbacks**: Configure multiple providers for high availability
2. **Monitor Costs**: Set up alerts for budget thresholds
3. **Test Provider Performance**: A/B test different models for your use case
4. **Cache Common Requests**: Store frequently requested card generations
5. **Rate Limit User Requests**: Prevent abuse with rate limiting
6. **Log Provider Usage**: Track which providers work best for your needs
7. **Optimize Model Selection**: Use cheaper models for simple tasks, premium for complex

## Cost Comparison

| Use Case | Without AI Gateway | With AI Gateway |
|----------|-------------------|-----------------|
| Single provider outage | 100% downtime | 0% downtime (failover) |
| Provider cost increase | Locked in | Switch provider instantly |
| Traffic spike handling | Manual scaling | Automatic load balancing |
| Cost monitoring | Manual tracking | Real-time dashboard |
| Model experimentation | Code changes required | Config change only |

## Migration Path

### Phase 1: Enable AI Gateway (Week 1)
- Set up Vercel AI Gateway
- Configure provider API keys
- Test card generation with gateway
- Monitor costs and performance

### Phase 2: Add Fallbacks (Week 2)
- Configure multi-provider fallback
- Test failover scenarios
- Implement cost tracking
- Set up monitoring alerts

### Phase 3: Advanced Features (Week 3-4)
- Personalized card generation
- AI game master
- Dynamic difficulty adjustment
- Multi-language support

## Security Considerations

1. **API Key Management**: Store keys securely in Vercel environment variables
2. **Rate Limiting**: Implement per-user rate limits to prevent abuse
3. **Input Validation**: Sanitize all prompts before sending to AI
4. **Content Filtering**: Validate AI responses before showing to users
5. **Cost Limits**: Set hard limits to prevent unexpected charges
6. **Audit Logging**: Log all AI requests for security and debugging

## Support and Resources

- **Vercel AI Gateway Docs**: https://vercel.com/docs/ai-gateway
- **Vercel AI SDK**: https://sdk.vercel.ai/
- **GitHub Issues**: Report bugs and request features
- **Community Discord**: Get help from other developers

## Conclusion

Vercel AI Gateway transforms the Degens Against Decency platform from single-provider AI to a robust, multi-provider architecture with automatic failover, cost optimization, and enhanced reliability. By implementing these use cases, the game can deliver a better experience to players while maintaining operational efficiency and cost control.

---

**Ready to integrate AI Gateway?** Follow the implementation guide above or contact the development team for assistance.
