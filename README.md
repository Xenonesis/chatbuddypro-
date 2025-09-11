# 🤖 ChatBuddy

A modern, intelligent chat application with multi-provider AI support, built with Next.js 15 and TypeScript. ChatBuddy provides a seamless interface to interact with multiple AI providers while maintaining your conversation history and preferences across devices.

![ChatBuddy App](https://img.shields.io/badge/ChatBuddy-Next.js_15-blue)
![Version](https://img.shields.io/badge/version-2.8.5-green)
![License](https://img.shields.io/badge/license-MIT-orange)
![Node](https://img.shields.io/badge/node-18+-brightgreen)
![React](https://img.shields.io/badge/react-19-blue)

## ✨ Features

### 🧠 Multi-Provider AI Support
- **OpenAI**: GPT-3.5-turbo, GPT-4, GPT-4-turbo
- **Google Gemini**: 2.0-flash, 1.5-pro, 1.5-flash, pro-vision
- **Mistral AI**: tiny, small, medium
- **Anthropic Claude**: 3-5-sonnet, 3-opus, 3-sonnet, 3-haiku
- **Meta Llama**: 3-8b-instruct, 3-70b-instruct
- **DeepSeek**: coder, chat, llm

### 🎯 Smart Chat Modes
- **Thoughtful**: Detailed, analytical responses with deeper reasoning
- **Quick**: Fast, concise answers for immediate needs
- **Creative**: Imaginative and artistic responses for creative projects
- **Technical**: Code-focused and precise for development tasks
- **Learning**: Educational and explanatory for knowledge building

### 🎤 Advanced Voice Input
- Browser-based speech recognition using Web Speech API
- Support for 15+ languages including English, Spanish, French, German, Japanese
- Continuous and single-command listening modes
- Real-time transcription with voice commands
- Noise cancellation and custom vocabulary support

### 💡 AI-Powered Smart Suggestions
- Intelligent follow-up questions based on conversation context
- Dynamic topic suggestions for deeper exploration
- Personalized prompt recommendations
- Favorite prompts management and organization
- AI-generated conversation starters

### 🔒 Enterprise-Grade Security & Privacy
- Secure user authentication with Supabase Auth
- End-to-end encrypted API key storage
- Row Level Security (RLS) for data isolation
- HTTPS enforcement and security headers
- Privacy-first design with local data processing

### 🎨 Modern UI/UX Experience
- Adaptive dark/light theme with system preference detection
- Mobile-first responsive design with touch-friendly interface
- Advanced code syntax highlighting for 100+ programming languages
- Smooth animations and transitions with Framer Motion
- Progressive Web App (PWA) with offline capabilities
- Accessibility features with screen reader support

### 💾 Comprehensive Data Management
- Persistent chat history with cloud synchronization
- Real-time settings sync across all devices
- Automatic chat backup and recovery system
- Advanced chat cleanup and retention management
- Export functionality for conversations
- Profile synchronization with conflict resolution

### 💻 Enhanced Developer Experience
- Full TypeScript coverage for type safety
- Modern React 19 with concurrent features
- Tailwind CSS with Shadcn UI component library
- Comprehensive error handling and user feedback
- Hot reload development with Next.js 15
- Optimized webpack configuration for performance

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (recommended: use `.nvmrc` file)
- npm or yarn package manager
- Supabase account for authentication and database

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd chatbuddy
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Site URL for metadata
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. **Set up Supabase database**

```bash
npm run setup-supabase
```

5. **Configure AI Provider API Keys**

API keys are managed through the application interface after user registration:
- Sign up for an account
- Go to Settings → Provider Settings
- Add your API keys for the providers you want to use

Supported providers:
- OpenAI (platform.openai.com)
- Google Gemini (ai.google.dev)
- Mistral AI (console.mistral.ai)
- Anthropic Claude (console.anthropic.com)
- Meta Llama (via compatible APIs)
- DeepSeek (platform.deepseek.com)

### Running the Application

Start the development server:

```bash
npm run dev
```

For production build:

```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📋 Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Database Management
- `npm run setup-supabase` - Set up Supabase configuration
- `npm run verify-supabase` - Verify Supabase connection
- `npm run check-database` - Check database health and tables
- `npm run cleanup-db` - Clean up duplicate records
- `npm run migrate-api-keys` - Migrate API keys to new format
- `npm run fix-ai-providers` - Fix AI providers column issues
- `npm run fix-profile-columns` - Fix profile table columns
- `npm run verify-chat-persistence` - Verify chat persistence functionality

### Utilities
- `npm run generate-favicon` - Generate favicon and app icons
- `npm run check-ui-errors` - Check for UI-related errors
- `npm run check-auth` - Check authentication status

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript 5
- **Styling**: Tailwind CSS 3.4, Shadcn UI components
- **Database**: Supabase (PostgreSQL) with real-time subscriptions
- **Authentication**: Supabase Auth with row-level security
- **Deployment**: Netlify with static export optimization
- **Build Tools**: Webpack 5, ESLint 9, PostCSS

### Key Components
- **Chat Interface** (`src/components/Chat.tsx`) - Main chat component with AI provider integration
- **Settings Management** (`src/app/settings/page.tsx`) - Comprehensive settings interface
- **Authentication** (`src/contexts/AuthContext.tsx`) - User authentication and session management
- **Model Settings** (`src/lib/context/ModelSettingsContext.tsx`) - AI provider and chat configuration
- **Voice Input** (`src/components/settings/VoiceInputSettings.tsx`) - Speech recognition interface

### Database Schema
- **User Profiles** - User preferences and settings
- **Chat History** - Persistent conversation storage
- **API Keys** - Encrypted provider credentials
- **Chat Settings** - Real-time synchronized preferences

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `NEXT_PUBLIC_SITE_URL` | Site URL for metadata | No |

### Chat Modes Configuration

Each chat mode has specific parameters:
- **Temperature**: Controls response creativity (0.1-1.0)
- **Max Tokens**: Limits response length (100-4000)
- **System Message**: Provides context to the AI

### Voice Input Languages

Supported languages include:
- English (US, UK, AU, CA)
- Spanish (ES, MX, AR)
- French (FR, CA)
- German (DE)
- Italian (IT)
- Portuguese (PT, BR)
- Japanese (JP)
- Korean (KR)
- Chinese (CN, TW)

## 🛠️ Troubleshooting

### Database Connection Issues

**Verify Supabase connection:**
```bash
npm run verify-supabase
```

### Common Database Issues

**"Column 'ai_providers' does not exist" Error:**
```bash
npm run fix-ai-providers
npm run migrate-api-keys
```

**API Keys Not Saving:**
```bash
npm run migrate-api-keys
```

**Duplicate Records:**
```bash
npm run cleanup-db
```

### Voice Input Issues

**Microphone access denied:**
1. Click the microphone icon in your browser's address bar
2. Select "Always allow" for ChatBuddy
3. Refresh the page and try again

**No speech detected:**
- Check microphone settings in your OS
- Test microphone in other applications
- Move to a quieter environment
- Speak louder and clearer

For detailed troubleshooting, see [DATABASE_MANAGEMENT.md](./DATABASE_MANAGEMENT.md).

## 🛠️ Customization

### Adding New AI Providers

To add new AI providers:

1. Add API function in `src/lib/api.ts`
2. Update `AIProvider` type in `src/lib/context/ModelSettingsContext.tsx`
3. Add provider to settings UI in `src/components/settings/ProviderSettings.tsx`
4. Handle provider in `src/components/Chat.tsx`

### Extending Chat Modes

Chat modes are defined in the ModelSettingsContext with specific parameters:
- **Temperature**: Controls response creativity
- **Max Tokens**: Limits response length
- **System Message**: Provides context to the AI

### Custom Themes

The application supports custom themes through Tailwind CSS:
- Modify `tailwind.config.js` for color schemes
- Update `src/components/ui-custom/ThemeProvider.tsx` for theme logic
- Add new theme variants in `src/styles/globals.css`

## 📚 Documentation

### Comprehensive Guides
- **[Features Overview](./docs/FEATURES_OVERVIEW.md)** - Complete feature documentation
- **[AI Providers Guide](./docs/AI_PROVIDERS_GUIDE.md)** - Provider-specific configuration
- **[Chat Modes Guide](./docs/CHAT_MODES_GUIDE.md)** - Chat mode optimization
- **[Voice Input Guide](./docs/VOICE_INPUT_GUIDE.md)** - Voice input setup and troubleshooting
- **[Database Management](./DATABASE_MANAGEMENT.md)** - Database troubleshooting
- **[Supabase Setup](./SUPABASE_SETUP.md)** - Complete Supabase integration
- **[Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)** - Production deployment
- **[Error Handling Guide](./docs/ERROR_HANDLING_GUIDE.md)** - Error handling patterns

### Migration Guides
- **[Migration Guide](./MIGRATION_GUIDE.md)** - Version migration instructions
- **[Chat Persistence Guide](./CHAT_PERSISTENCE_GUIDE.md)** - Chat history migration
- **[Chat Persistence Implementation](./CHAT_PERSISTENCE_IMPLEMENTATION.md)** - Technical implementation

### Design Guides
- **[Responsive Design Guide](./RESPONSIVE_DESIGN_GUIDE.md)** - Mobile-first design principles

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines
1. Follow TypeScript best practices
2. Use ESLint configuration for code quality
3. Write comprehensive tests for new features
4. Update documentation for API changes
5. Follow semantic versioning for releases

### Code Style
- Use TypeScript for all new code
- Follow React 19 best practices
- Use Tailwind CSS for styling
- Implement proper error boundaries
- Add accessibility features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Deployment

ChatBuddy is optimized for deployment on Netlify:

### Netlify Deployment

1. **Connect your repository** to Netlify
2. **Build settings** are automatically configured via `netlify.toml`
3. **Environment variables** need to be set in Netlify dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Build Configuration

The application uses:
- Static export for optimal performance
- Edge functions for authentication
- Automatic dependency optimization
- Progressive Web App features

### Performance Optimizations

- Code splitting and lazy loading
- Image optimization with Next.js
- Webpack bundle optimization
- Service worker for offline support
- CDN-ready static assets

## 📊 Version History

### Current Version: 2.8.5

**Latest Updates:**
- Enhanced Supabase URL configuration
- Improved database diagnostics
- Cleaned up demo and test code
- Fixed chat persistence issues
- Updated authentication flow
- Enhanced error handling

See [CHANGELOG.md](./CHANGELOG.md) for complete version history.

## 👨‍💻 Developer

Developed with ❤️ for the AI community

---

**ChatBuddy** - Your intelligent AI companion with multi-provider support.