# Vercel AI Gateway - Example Configurations

This file provides example configurations for different AI Gateway deployment scenarios. Choose the configuration that best matches your needs and add the environment variables to your `.env` file or deployment platform.

## Configuration 1: Basic Setup (Single Provider - OpenAI)

**Best for**: Getting started, testing, small projects

```bash
# Enable AI Gateway
USE_AI_GATEWAY=true
AI_GATEWAY_URL=https://gateway.ai.cloudflare.com/v1

# OpenAI as primary provider
OPENAI_API_KEY=sk-your-openai-key-here
AI_GATEWAY_DEFAULT_PROVIDER=openai
AI_GATEWAY_DEFAULT_MODEL=gpt-3.5-turbo

# Basic cost controls
AI_GATEWAY_FALLBACK_ENABLED=false  # No fallback with single provider
AI_GATEWAY_COST_LIMIT_DAILY=5.00
AI_GATEWAY_COST_LIMIT_REQUEST=0.05
```

**Cost Estimate**: $0.002 per card generation (gpt-3.5-turbo)
- 100 card generations/day ≈ $0.20/day
- 2,500 card generations/day ≈ $5.00/day (daily limit reached)

---

## Configuration 2: High Availability (OpenAI + Anthropic)

**Best for**: Production deployments requiring reliability

```bash
# Enable AI Gateway with fallback
USE_AI_GATEWAY=true
AI_GATEWAY_URL=https://gateway.ai.cloudflare.com/v1

# Primary: OpenAI (faster, cheaper for simple tasks)
OPENAI_API_KEY=sk-your-openai-key-here
AI_GATEWAY_DEFAULT_PROVIDER=openai
AI_GATEWAY_DEFAULT_MODEL=gpt-3.5-turbo

# Fallback: Anthropic (higher quality, more reliable)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Enable automatic failover
AI_GATEWAY_FALLBACK_ENABLED=true

# Higher cost limits for production
AI_GATEWAY_COST_LIMIT_DAILY=20.00
AI_GATEWAY_COST_LIMIT_REQUEST=0.10
```

**Benefits**:
- ✅ 99.9%+ uptime with automatic failover
- ✅ OpenAI handles most requests (cheaper)
- ✅ Anthropic as backup when OpenAI is unavailable
- ✅ No service disruption for users

---

## Configuration 3: Cost-Optimized (Multiple Providers)

**Best for**: Balancing cost and quality

```bash
# Enable AI Gateway
USE_AI_GATEWAY=true
AI_GATEWAY_URL=https://gateway.ai.cloudflare.com/v1

# Primary: Google Gemini (cheapest option)
GOOGLE_AI_KEY=your-google-ai-key-here
AI_GATEWAY_DEFAULT_PROVIDER=google
AI_GATEWAY_DEFAULT_MODEL=gemini-pro

# Fallback options
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Enable fallback
AI_GATEWAY_FALLBACK_ENABLED=true

# Aggressive cost limits
AI_GATEWAY_COST_LIMIT_DAILY=10.00
AI_GATEWAY_COST_LIMIT_REQUEST=0.05
```

**Cost Estimate**:
- Gemini Pro: $0.00025 per 1K tokens (cheapest)
- Falls back to OpenAI/Anthropic if Gemini unavailable
- Can handle 40,000+ card generations for $10

---

## Configuration 4: Premium Quality (Claude-focused)

**Best for**: High-quality content generation, creative applications

```bash
# Enable AI Gateway
USE_AI_GATEWAY=true
AI_GATEWAY_URL=https://gateway.ai.cloudflare.com/v1

# Primary: Anthropic Claude (best quality)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
AI_GATEWAY_DEFAULT_PROVIDER=anthropic
AI_GATEWAY_DEFAULT_MODEL=claude-3-sonnet-20240229

# Fallback: OpenAI GPT-4
OPENAI_API_KEY=sk-your-openai-key-here

# Enable fallback
AI_GATEWAY_FALLBACK_ENABLED=true

# Higher cost tolerance for quality
AI_GATEWAY_COST_LIMIT_DAILY=30.00
AI_GATEWAY_COST_LIMIT_REQUEST=0.15
```

**Benefits**:
- ✅ Highest quality card generation
- ✅ Better understanding of context and humor
- ✅ More creative and engaging content
- 💰 Higher cost per generation (~$0.003)

---

## Configuration 5: Development/Testing

**Best for**: Local development, testing, CI/CD pipelines

```bash
# Disable AI Gateway (use legacy fallback cards)
USE_AI_GATEWAY=false

# Alternative: Use AI Gateway with very low limits
USE_AI_GATEWAY=true
AI_GATEWAY_URL=https://gateway.ai.cloudflare.com/v1
OPENAI_API_KEY=sk-your-openai-key-here
AI_GATEWAY_DEFAULT_PROVIDER=openai
AI_GATEWAY_DEFAULT_MODEL=gpt-3.5-turbo
AI_GATEWAY_FALLBACK_ENABLED=false
AI_GATEWAY_COST_LIMIT_DAILY=1.00  # Very low limit for testing
AI_GATEWAY_COST_LIMIT_REQUEST=0.01
```

**Benefits**:
- ✅ No API costs when disabled
- ✅ Falls back to curated static cards
- ✅ Protects against accidental overspending in development

---

## Configuration 6: Enterprise/High-Volume

**Best for**: Large-scale production deployments

```bash
# Enable AI Gateway with all providers
USE_AI_GATEWAY=true
AI_GATEWAY_URL=https://gateway.ai.cloudflare.com/v1

# Configure all providers for maximum redundancy
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
GOOGLE_AI_KEY=your-google-ai-key-here
XAI_API_KEY=your-xai-key-here

# Load balancing configuration
AI_GATEWAY_DEFAULT_PROVIDER=openai
AI_GATEWAY_DEFAULT_MODEL=gpt-3.5-turbo
AI_GATEWAY_FALLBACK_ENABLED=true

# Enterprise cost limits
AI_GATEWAY_COST_LIMIT_DAILY=100.00
AI_GATEWAY_COST_LIMIT_REQUEST=0.25
```

**Benefits**:
- ✅ Maximum reliability with 4 provider redundancy
- ✅ Automatic load balancing
- ✅ Handle thousands of concurrent users
- ✅ Geographic provider diversity
- 📊 Comprehensive analytics across all providers

**Cost Estimate**: $50-100/day for high-volume usage

---

## Configuration 7: Free Tier (No AI Gateway)

**Best for**: Hobby projects, learning, demos

```bash
# Disable AI Gateway completely
USE_AI_GATEWAY=false

# Optional: Use the free degenscardbot API
CARD_GENERATOR_URL=https://degenscardbot.vercel.app/api/generate

# No API keys required
# Uses fallback static cards when external API is unavailable
```

**Benefits**:
- ✅ Zero AI costs
- ✅ Still playable with curated cards
- ✅ No API key management
- ✅ Instant setup

---

## Monitoring AI Gateway Usage

Once configured, monitor your AI Gateway usage at:

```
GET /api/ai-gateway/stats
```

Returns:
```json
{
  "totalRequests": 1250,
  "successfulRequests": 1248,
  "failedRequests": 2,
  "totalTokens": 125000,
  "totalCost": 1.875,
  "failoverEvents": 2,
  "successRate": "99.84%",
  "costRemaining": "8.13",
  "enabledProviders": ["openai", "anthropic"],
  "providerStats": {
    "openai": {
      "requests": 1220,
      "tokens": 122000,
      "estimatedCost": 1.83,
      "averageLatency": 450
    },
    "anthropic": {
      "requests": 28,
      "tokens": 3000,
      "estimatedCost": 0.045,
      "averageLatency": 650
    }
  }
}
```

## Cost Optimization Tips

1. **Use Cheaper Models for Simple Tasks**
   - gpt-3.5-turbo or gemini-pro for basic cards
   - gpt-4 or claude for premium/complex content

2. **Set Appropriate Limits**
   - Start with $5-10/day and adjust based on usage
   - Per-request limits prevent single expensive calls

3. **Cache Generated Content**
   - Store popular cards in a database
   - Reuse cards across similar game themes

4. **Monitor Provider Performance**
   - Check `/api/ai-gateway/stats` regularly
   - Switch to cheaper providers if quality is acceptable

5. **Use Fallback Cards**
   - Keep `AI_GATEWAY_FALLBACK_ENABLED=true`
   - Maintain quality static cards for emergencies

## Choosing Your Configuration

| Priority | Recommended Configuration | Cost/Day | Reliability |
|----------|-------------------------|----------|------------|
| Cost | Config 3 (Cost-Optimized) | $1-5 | Good |
| Reliability | Config 2 (High Availability) | $5-20 | Excellent |
| Quality | Config 4 (Premium) | $10-30 | Excellent |
| Scale | Config 6 (Enterprise) | $50-100 | Maximum |
| Learning | Config 7 (Free Tier) | $0 | Basic |

## Need Help?

- Read the full guide: [VERCEL_AI_GATEWAY.md](VERCEL_AI_GATEWAY.md)
- Check deployment docs: [DEPLOYMENT_VERCEL.md](DEPLOYMENT_VERCEL.md)
- Open an issue: [GitHub Issues](https://github.com/jmenichole/DegensAgainstDecency/issues)

---

**Pro Tip**: Start with Configuration 2 (High Availability) for production deployments. It offers the best balance of cost, reliability, and ease of setup.
