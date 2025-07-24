# AI Providers Guide

ChatBuddy supports multiple AI providers, each with unique strengths and capabilities. This guide helps you understand and configure each provider for optimal results.

## 🤖 Supported Providers

### OpenAI
**Best for**: General conversation, coding, creative writing
**Models Available**:
- `gpt-3.5-turbo` - Fast, cost-effective for most tasks
- `gpt-4` - Advanced reasoning and complex tasks
- `gpt-4-turbo` - Latest GPT-4 with improved performance

**Strengths**:
- Excellent code generation and debugging
- Strong reasoning capabilities
- Wide knowledge base
- Reliable performance

**API Key Setup**:
1. Visit [platform.openai.com](https://platform.openai.com)
2. Create account and add billing information
3. Generate API key in API section
4. Add to ChatBuddy settings

**Cost**: Pay-per-use, varies by model

---

### Google Gemini
**Best for**: Multimodal tasks, analysis, recent information
**Models Available**:
- `gemini-2.0-flash` - Latest, fastest model
- `gemini-2.0-flash-lite` - Lightweight version
- `gemini-1.5-pro` - Advanced reasoning
- `gemini-1.5-flash` - Balanced performance
- `gemini-pro-vision` - Image understanding

**Strengths**:
- Excellent at analysis and reasoning
- Strong multimodal capabilities
- Good at following instructions
- Competitive performance

**API Key Setup**:
1. Visit [ai.google.dev](https://ai.google.dev)
2. Get API key from Google AI Studio
3. Add to ChatBuddy settings

**Cost**: Generous free tier, then pay-per-use

---

### Mistral AI
**Best for**: European data compliance, efficient performance
**Models Available**:
- `mistral-tiny` - Lightweight, fast responses
- `mistral-small` - Balanced performance
- `mistral-medium` - Advanced capabilities

**Strengths**:
- GDPR compliant (EU-based)
- Efficient and fast
- Good multilingual support
- Competitive pricing

**API Key Setup**:
1. Visit [console.mistral.ai](https://console.mistral.ai)
2. Create account and get API key
3. Add to ChatBuddy settings

**Cost**: Competitive pricing, free tier available

---

### Anthropic Claude
**Best for**: Safety, analysis, long conversations
**Models Available**:
- `claude-3-5-sonnet-20240620` - Latest, most capable
- `claude-3-opus-20240229` - Most powerful reasoning
- `claude-3-sonnet-20240229` - Balanced performance
- `claude-3-haiku-20240307` - Fast, lightweight

**Strengths**:
- Excellent safety and alignment
- Strong analytical capabilities
- Good at following complex instructions
- Honest about limitations

**API Key Setup**:
1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Create account and get API key
3. Add to ChatBuddy settings

**Cost**: Pay-per-use, competitive rates

---

### Meta Llama
**Best for**: Open-source flexibility, research
**Models Available**:
- `llama-3-8b-instruct` - Efficient instruction following
- `llama-3-70b-instruct` - Large model performance
- `llama-3-8b` - Base model
- `llama-3-70b` - Large base model

**Strengths**:
- Open-source models
- Good performance for size
- Flexible deployment options
- Research-friendly

**API Key Setup**:
- Requires compatible API provider
- Various hosting options available
- Configure endpoint in settings

**Cost**: Varies by hosting provider

---

### DeepSeek
**Best for**: Coding, technical tasks, cost-effectiveness
**Models Available**:
- `deepseek-coder` - Specialized for programming
- `deepseek-chat` - General conversation
- `deepseek-llm` - Base language model

**Strengths**:
- Excellent coding capabilities
- Very cost-effective
- Good technical reasoning
- Fast response times

**API Key Setup**:
1. Visit [platform.deepseek.com](https://platform.deepseek.com)
2. Create account and get API key
3. Add to ChatBuddy settings

**Cost**: Very competitive pricing

## 🎯 Choosing the Right Provider

### For Coding Tasks
1. **DeepSeek Coder** - Best value for coding
2. **OpenAI GPT-4** - Most reliable for complex code
3. **Claude 3.5 Sonnet** - Excellent code analysis

### For Creative Writing
1. **OpenAI GPT-4** - Most creative and versatile
2. **Claude 3 Opus** - Excellent for long-form content
3. **Gemini Pro** - Good for structured creativity

### For Analysis & Research
1. **Claude 3.5 Sonnet** - Best analytical capabilities
2. **Gemini 1.5 Pro** - Excellent reasoning
3. **OpenAI GPT-4** - Strong general analysis

### For Cost-Effectiveness
1. **DeepSeek** - Most affordable
2. **Gemini** - Generous free tier
3. **Mistral Tiny** - Efficient and cheap

### For Privacy & Compliance
1. **Mistral AI** - EU-based, GDPR compliant
2. **Self-hosted Llama** - Full control
3. **Claude** - Strong safety focus

## ⚙️ Configuration Tips

### API Key Management
- **Store securely**: Keys are encrypted in database
- **Rotate regularly**: Update keys periodically
- **Monitor usage**: Check provider dashboards
- **Set limits**: Configure spending limits where available

### Model Selection
- **Start with defaults**: ChatBuddy selects optimal models
- **Experiment**: Try different models for different tasks
- **Consider cost**: Balance performance vs. price
- **Check limits**: Some models have usage restrictions

### Performance Optimization
- **Use appropriate models**: Don't use GPT-4 for simple tasks
- **Batch requests**: Group related questions
- **Clear context**: Start new chats for different topics
- **Monitor response times**: Switch providers if slow

## 🔧 Troubleshooting

### Common Issues

#### "API Key Invalid"
- **Check format**: Ensure key is copied correctly
- **Verify account**: Confirm account is active
- **Check permissions**: Ensure key has required permissions
- **Try regenerating**: Create new API key

#### "Rate Limit Exceeded"
- **Wait**: Most limits reset automatically
- **Upgrade plan**: Consider higher tier
- **Switch provider**: Use alternative temporarily
- **Optimize usage**: Reduce request frequency

#### "Model Not Available"
- **Check status**: Provider may have outages
- **Try different model**: Switch to alternative
- **Update settings**: Model names may have changed
- **Contact provider**: Report persistent issues

### Provider-Specific Issues

#### OpenAI
- **Billing required**: Must add payment method
- **Organization limits**: Check organization settings
- **Model access**: Some models require approval

#### Gemini
- **Region restrictions**: Not available in all countries
- **Quota limits**: Free tier has daily limits
- **API version**: Ensure using correct API version

#### Claude
- **Waitlist**: May require approval for access
- **Usage policies**: Strict content guidelines
- **Context limits**: Large context windows may be slower

## 📊 Comparison Matrix

| Provider | Speed | Cost | Coding | Creative | Analysis | Safety |
|----------|-------|------|--------|----------|----------|--------|
| OpenAI   | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Gemini   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Mistral  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Claude   | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Llama    | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| DeepSeek | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

## 🔮 Future Providers

ChatBuddy is designed to easily add new providers. Planned additions:
- **Cohere** - Enterprise-focused AI
- **AI21 Labs** - Jurassic models
- **Hugging Face** - Open model hub
- **Custom endpoints** - Self-hosted models

---

**Note**: Provider capabilities and pricing change frequently. Check official documentation for the latest information.