# AI Provider Configuration Guide

This application supports two methods for configuring AI provider API keys, designed to accommodate both development and production use cases.

## Configuration Methods

### 1. Environment Variables (Development/Local Use)

For local development, you can configure API keys using environment variables in your `.env.local` file.

**Setup:**
1. Copy `.env.example` to `.env.local`
2. Fill in your API keys for the providers you want to use
3. Restart your development server

**Example `.env.local`:**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# AI Provider API Keys
NEXT_PUBLIC_OPENAI_API_KEY=sk-your_openai_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key_here
NEXT_PUBLIC_MISTRAL_API_KEY=your_mistral_key_here
```

**Advantages:**
- Quick setup for development
- Keys are stored locally and not shared
- No need for user authentication during development

### 2. Database Storage (Production/User Management)

In production, users can manage their API keys through the built-in UI interface.

**Features:**
- Secure encrypted storage in Supabase
- Per-user key management
- Add, update, and delete keys through the UI
- Real-time synchronization across sessions
- Default provider selection

**How to Use:**
1. Navigate to the AI Providers settings page
2. Enable the providers you want to use
3. Add your API keys using the secure input fields
4. Set your default provider
5. Save changes

## Key Fallback Priority

The application uses a smart fallback system to ensure API keys are always available:

1. **Database (Primary)** - Encrypted keys stored per user
2. **Environment Variables** - Local development fallback
3. **localStorage** - Browser cache for performance
4. **Emergency Fallback** - Environment variables as last resort

## Security Features

### Environment Variables
- Only accessible during build time
- Not exposed to client-side code in production
- Suitable for development environments

### Database Storage
- Keys are encrypted using AES encryption
- User-specific encryption keys
- Secure transmission over HTTPS
- Automatic key rotation support

## Provider-Specific Setup

### OpenAI
- Get your API key: https://platform.openai.com/api-keys
- Format: `sk-...` (starts with "sk-")
- Required length: 20+ characters

### Google Gemini
- Get your API key: https://aistudio.google.com/app/apikey
- Format: Alphanumeric string
- Required length: 20+ characters

### Mistral AI
- Get your API key: https://console.mistral.ai/
- Format: Alphanumeric string
- More flexible validation

### Anthropic Claude
- Get your API key: https://console.anthropic.com/
- Format: `sk-ant-...` (starts with "sk-ant-")
- Required length: 20+ characters

### Together AI (Llama)
- Get your API key: https://together.ai/
- Format: Alphanumeric string
- Required length: 20+ characters

### DeepSeek
- Get your API key: https://platform.deepseek.com/
- Format: `sk-...` (starts with "sk-")
- Required length: 20+ characters

## Best Practices

### For Developers
- Use `.env.local` for local development
- Never commit API keys to version control
- Test with multiple providers during development

### For Production Users
- Use the UI interface for key management
- Regularly rotate your API keys
- Only enable providers you actively use
- Set a reliable default provider

### For Deployment
- Environment variables are automatically used as fallback
- Database keys take precedence over environment variables
- Users can override any environment-configured keys

## Troubleshooting

### Keys Not Working
1. Check key format and length requirements
2. Verify the key is active in the provider's dashboard
3. Ensure the provider is enabled in settings
4. Check browser console for validation errors

### Environment Variables Not Loading
1. Restart your development server
2. Verify `.env.local` file location and format
3. Check that variable names match exactly
4. Ensure no trailing spaces or quotes

### Database Keys Not Syncing
1. Check your internet connection
2. Verify Supabase configuration
3. Try logging out and back in
4. Clear browser cache and localStorage

## Migration

If you're upgrading from environment-only configuration:

1. Your existing `.env.local` keys will continue to work
2. Users can add keys through the UI to override environment defaults
3. Database keys automatically take precedence
4. No action required for existing deployments

## Support

For additional help:
- Check the browser console for detailed error messages
- Verify API key validity with the provider's documentation
- Ensure all required environment variables are set
- Contact support if database synchronization issues persist