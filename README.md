# AI Chatbot with Shadcn UI

A modern chatbot interface built with Next.js and Shadcn UI that can connect to multiple AI models including OpenAI, Google Gemini, and Mistral.

## Features

- Clean, responsive UI built with Shadcn UI components
- Support for multiple AI providers:
  - OpenAI (GPT-3.5/GPT-4)
  - Google Gemini
  - Mistral AI
- Real-time chat interface with typing indicators
- Easy to customize and extend

## Setup

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
```

You can obtain API keys from:
- OpenAI: https://platform.openai.com/api-keys
- Google Gemini: https://aistudio.google.com/app/apikey
- Mistral: https://console.mistral.ai/api-keys/

### Running the Application

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Choose your preferred AI model (OpenAI, Gemini, or Mistral)
2. Type your message in the input field
3. Press Enter or click the Send button to send your message
4. The AI will respond with a message

## Customization

### Changing UI Components

The UI components are built with Shadcn UI. You can customize their appearance by modifying the files in `src/components/ui/`.

### Adding More AI Providers

To add more AI providers, update the following:

1. Add a new API function in `src/lib/api.ts`
2. Add the new provider to the `APIProvider` type in `src/components/Chat.tsx`
3. Add a new button for the provider in the Chat component
4. Update the `handleSend` function to handle the new provider

## License

MIT
