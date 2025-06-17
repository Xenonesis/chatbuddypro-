# 🤖 ChatBuddy Pro

A modern, full-featured chatbot interface that connects to multiple AI providers, featuring beautiful syntax highlighting for code blocks, response time tracking, and regeneration capabilities.

![ChatBuddy App](https://img.shields.io/badge/ChatBuddy-Next.js-blue)
![Version](https://img.shields.io/badge/version-2.0.0-green)
![License](https://img.shields.io/badge/license-MIT-orange)

## ✨ Key Features

### 🤖 Multiple AI Providers

- **OpenAI**: GPT-3.5, GPT-4, GPT-4o models
- **Google Gemini**: Pro and Vision variants
- **Mistral AI**: Tiny, Small, Medium models
- **Anthropic Claude**: Sonnet, Opus, Haiku variants
- **Meta Llama**: 8B, 70B Instruct models
- **DeepSeek**: Chat and Coder variants

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

- Built with Next.js 14 and React 18
- TypeScript for type safety
- Tailwind CSS with Shadcn UI components
- Responsive design for all devices
- PWA support with offline capabilities

## 🆕 What's New in v2.0.0

- **Enhanced Database Integration**: Fixed synchronization issues and improved data persistence
- **Performance Optimizations**: Faster loading times and better response handling for large conversations
- **Improved Accessibility**: Better screen reader compatibility and keyboard navigation
- **Advanced Code Features**: Complete syntax highlighting with copy functionality and language detection
- **Voice Input Support**: Browser-based speech recognition with multiple language support
- **Real-time Synchronization**: Live profile data updates and cross-device synchronization
- **Production Ready**: Resolved build issues, improved TypeScript safety, and enhanced error handling

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd chatbuddy
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Configure API keys**

You have two options to configure your API keys:

#### Option 1: Using the setup script

Run the setup script which will guide you through the process:

```bash
npm run setup
```

#### Option 2: Manual configuration

Copy the `.env.example` file to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

Then edit the `.env.local` file and add your API keys:

```env
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_MISTRAL_API_KEY=your_mistral_api_key_here
NEXT_PUBLIC_CLAUDE_API_KEY=your_claude_api_key_here
NEXT_PUBLIC_LLAMA_API_KEY=your_llama_api_key_here
NEXT_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

4. **Set up Supabase (Optional)**

For user authentication and data persistence, configure Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup instructions.

### Running the Application

Start the development server:

```bash
npm run dev
# or
yarn dev
```

For production build:

```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

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

- **Frontend**: Next.js 14 with React 18 and TypeScript
- **UI Components**: Shadcn UI components with Tailwind CSS
- **Database**: Supabase (PostgreSQL) with real-time subscriptions
- **Authentication**: Supabase Auth with email/password and social providers
- **AI Integration**: Direct API calls to multiple AI providers
- **State Management**: React Context API for global state
- **Styling**: Tailwind CSS with dark/light theme support
- **Code Highlighting**: React Syntax Highlighter with 100+ languages
- **Voice Input**: Web Speech API with custom React hooks
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

## 👨‍💻 Developer

Developed with ❤️ by [Aditya](https://github.com/addy)

---

**ChatBuddy Pro** - Your intelligent coding companion with multi-model AI support.
