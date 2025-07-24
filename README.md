# 🤖 ChatBuddy

A modern, full-featured AI chat interface that connects to multiple AI providers with beautiful syntax highlighting, voice input, real-time synchronization, and advanced user management.

![ChatBuddy App](https://img.shields.io/badge/ChatBuddy-Next.js_15-blue)
![Version](https://img.shields.io/badge/version-0.1.0-green)
![License](https://img.shields.io/badge/license-MIT-orange)
![Node](https://img.shields.io/badge/node-18+-brightgreen)
![React](https://img.shields.io/badge/react-19-blue)

## ✨ Key Features

### 🤖 Multiple AI Providers

- **OpenAI**: GPT-3.5-turbo, GPT-4, GPT-4-turbo
- **Google Gemini**: Gemini-2.0-flash, Gemini-2.0-flash-lite, Gemini-1.5-pro, Gemini-1.5-flash, Gemini-pro-vision
- **Mistral AI**: Mistral-tiny, Mistral-small, Mistral-medium
- **Anthropic Claude**: Claude-3-5-sonnet, Claude-3-opus, Claude-3-sonnet, Claude-3-haiku
- **Meta Llama**: Llama-3-8b-instruct, Llama-3-70b-instruct, Llama-3-8b, Llama-3-70b
- **DeepSeek**: DeepSeek-coder, DeepSeek-chat, DeepSeek-llm

### 💻 Enhanced Code Experience

- Syntax highlighting for 100+ programming languages
- Copy-to-clipboard functionality for code snippets
- Automatic language detection and display
- Proper code formatting with indentation
- Full working code implementations (no truncated examples)

### 🎨 Advanced UI Features

- Dark/Light theme support with system preference detection
- Response time tracking for AI replies
- One-click regeneration for AI responses
- "Thinking process" visualization
- Multiple chat modes (Thoughtful, Quick, Creative, Technical, Learning)
- Voice input with speech recognition
- Smart suggestions and follow-up questions

### 👤 User Management

- Secure authentication with Supabase
- Real-time profile synchronization
- Encrypted API key storage
- User preferences persistence
- Chat history management

### 🛠️ Developer Experience

- Built with Next.js 15 and React 19
- TypeScript for type safety
- Tailwind CSS with Shadcn UI components
- Supabase for authentication and database
- Responsive design for all devices
- PWA support with offline capabilities
- Netlify deployment ready

## 🆕 Current Features (v0.1.0)

- **Real-time Authentication**: Secure user authentication with Supabase
- **Database Integration**: Complete user profile and chat history management
- **Voice Input**: Browser-based speech recognition with multiple language support
- **Smart Suggestions**: AI-powered follow-up questions and topic suggestions
- **Enhanced UI**: Modern interface with dark/light theme support
- **Performance Optimized**: Fast loading times with optimized webpack configuration
- **Production Ready**: Deployed on Netlify with proper build configuration

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm (comes with Node.js)
- A Supabase account (for authentication and database)

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

3. **Set up Supabase (Required)**

ChatBuddy uses Supabase for authentication and data persistence. Follow the complete setup guide:

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup instructions.

4. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Site URL for metadata
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

5. **Configure AI Provider API Keys**

API keys are managed through the application interface after user registration. You can:
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

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run setup-supabase` - Set up Supabase configuration
- `npm run verify-supabase` - Verify Supabase connection
- `npm run check-database` - Check database health
- `npm run cleanup-db` - Clean up duplicate records
- `npm run generate-favicon` - Generate favicon assets

## 💻 Usage

1. Choose your preferred AI model from the dropdown
2. Select a chat mode (Thoughtful, Quick, Technical, Creative, Learning)
3. Type your message or coding question, or use the voice input feature
4. Press Enter or click the Send button
5. View the AI's response with beautiful formatting for code blocks
6. Use the regenerate button if you want a different response

### Code Highlighting

When asking coding questions, the AI will automatically format code responses with proper syntax highlighting. The code blocks include:

- Proper language detection and display
- Syntax highlighting based on the language
- Line numbers for reference
- Copy-to-clipboard functionality
- Dark/light mode compatibility

### Voice Input

The application supports voice input through your browser's speech recognition API:

- Click the microphone icon to start/stop voice recording
- Speak clearly into your microphone
- The transcript will automatically appear in the input field
- Supports multiple languages (configurable in settings)

## 🧩 Architecture

The application is built with modern web technologies:

- **Frontend**: Next.js 15 with React 19 and TypeScript
- **UI Components**: Shadcn UI components with Tailwind CSS
- **Database**: Supabase (PostgreSQL) with real-time subscriptions
- **Authentication**: Supabase Auth with email/password authentication
- **AI Integration**: Direct API calls to multiple AI providers
- **State Management**: React Context API for global state
- **Styling**: Tailwind CSS with dark/light theme support
- **Code Highlighting**: React Syntax Highlighter with Prism.js
- **Voice Input**: Web Speech API with custom React hooks
- **Deployment**: Netlify with static export and edge functions
- **PWA Features**: Service worker, offline support, and app manifest

### Brand Identity

The application includes a complete brand identity system:

- **Favicons**: Multiple sizes (16x16, 32x32, 192x192, 512x512) for all devices
- **App Icons**: iOS, Android, and PWA compatible icons
- **OpenGraph**: Social media sharing images (1200x630)
- **Manifest**: Web app manifest for PWA installation
- **Design**: Gradient theme from blue (#3B82F6) to indigo (#4F46E5)

Brand assets can be regenerated using the included scripts:

```bash
# Generate all favicon sizes
node scripts/generate-favicons.js

# Generate OpenGraph images
node scripts/generate-opengraph.js
```

## 🗄️ Database Management

The application uses Supabase for data persistence. Several management scripts are available:

### Quick Database Health Check

```bash
# Check database connection and schema
npm run check-database

# Verify Supabase setup
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

For detailed troubleshooting, see [DATABASE_MANAGEMENT.md](./DATABASE_MANAGEMENT.md).

## 🛠️ Customization

### Adding More AI Providers

To add new AI providers:

1. Add API function in `src/lib/api.ts`
2. Update `AIProvider` type in `src/lib/context/ModelSettingsContext.tsx`
3. Add provider to settings UI in `src/app/settings/page.tsx`
4. Handle provider in `src/components/Chat.tsx`

### Extending Chat Modes

Chat modes are defined in the context with specific parameters:

- **Temperature**: Controls response creativity (0.1-1.0)
- **Max Tokens**: Limits response length
- **System Message**: Provides context to the AI

## 📚 Documentation

- **[Database Management](./DATABASE_MANAGEMENT.md)** - Troubleshooting and database management guide
- **[Supabase Setup](./SUPABASE_SETUP.md)** - Complete Supabase integration setup

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Deployment

ChatBuddy is configured for deployment on Netlify:

1. **Connect your repository** to Netlify
2. **Build settings** are automatically configured via `netlify.toml`
3. **Environment variables** need to be set in Netlify dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

The application uses static export for optimal performance and compatibility.

## 👨‍💻 Developer

Developed with ❤️ for the AI community

---

**ChatBuddy** - Your intelligent AI companion with multi-provider support.
