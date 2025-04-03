# 🤖 AI Chatbot with Code Highlighting

A modern, full-featured chatbot interface that connects to multiple AI providers, featuring beautiful syntax highlighting for code blocks, response time tracking, and regeneration capabilities.

![AI Chatbot App](https://img.shields.io/badge/AI%20Chatbot-Next.js-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-orange)

## ✨ Features

- **Multiple AI Providers Support**:
  - 🔷 OpenAI (GPT-3.5/GPT-4/GPT-4o)
  - 🔶 Google Gemini
  - 🟣 Mistral AI
  - 🟠 Anthropic Claude
  - 🟢 Meta's Llama
  - 🔵 Deepseek
  
- **Enhanced Code Experience**:
  - ✅ Syntax highlighting for code blocks with 100+ language support
  - ✅ Copy-to-clipboard functionality for code snippets
  - ✅ Automatic language detection and display
  - ✅ Code organization with proper spacing and indentation
  
- **Advanced UI Features**:
  - 🌙 Dark/Light theme support
  - ⏱️ Response time tracking for AI replies
  - 🔄 One-click regeneration for AI responses
  - 💬 "Thinking process" visualization option
  - 🧠 Multiple chat modes (Technical, Creative, Quick, etc.)

- **Developer Experience**:
  - 🛠️ Fully typed with TypeScript
  - 📦 Built with modern React and Next.js
  - 🎨 Styled with Tailwind CSS and Shadcn UI
  - 📱 Responsive design for all device sizes

## 🆕 Recent Updates

- **Code Block Highlighting**: Added beautiful syntax highlighting for code responses with copy button
- **Response Time Tracking**: Now shows how long each AI response took to generate
- **Regenerate Responses**: One-click regeneration of AI responses
- **Code Question Detection**: Automatic detection of coding questions for better formatting
- **UI Enhancements**: Improved dark mode support and responsive design

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn

### Installation

1. Clone the repository or download the source code

```bash
git clone <repository-url>
cd chatbot-app
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Configure API keys

You have two options to configure your API keys:

**Option 1: Using the setup script**

Run the setup script which will guide you through the process:

```bash
npm run setup
```

**Option 2: Manual configuration**

Copy the `.env.example` file to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

Then edit the `.env.local` file and add your API keys:

```
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_MISTRAL_API_KEY=your_mistral_api_key_here
NEXT_PUBLIC_CLAUDE_API_KEY=your_claude_api_key_here
NEXT_PUBLIC_LLAMA_API_KEY=your_llama_api_key_here
NEXT_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### Running the Application

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 💻 Usage

1. Choose your preferred AI model from the dropdown
2. Select a chat mode (Thoughtful, Quick, Technical, Creative, Learning)
3. Type your message or coding question
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

## 🧩 Architecture

The application is built with Next.js and React, using the following architecture:

- **UI Components**: Built with Shadcn UI and Tailwind CSS
- **AI Integration**: Unified API service that connects to multiple providers
- **State Management**: React Context API for managing chat state
- **Theming**: Next-themes for dark/light mode support
- **Code Formatting**: React Syntax Highlighter for code blocks

## 🛠️ Customization

### Adding More AI Providers

To add more AI providers, update the following:

1. Add a new API function in `src/lib/api.ts`
2. Add the new provider to the `AIProvider` type in `src/lib/context/ModelSettingsContext.tsx`
3. Update the settings UI in `src/app/settings/page.tsx`
4. Add provider specific handling in `src/components/Chat.tsx`

## 📄 License

MIT

## 👨‍💻 Developer

Developed with ❤️ by [Aditya](https://github.com/addy)

---

### Screenshots

*Coming soon*
