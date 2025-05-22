# Clean Web Style Next.js Application

This is a modern messaging application built with Next.js, TypeScript, and Tailwind CSS. It uses Supabase for backend services.

## Implemented Features

### Core Requirements ✅

- ✅ **Real-time Messaging**: Typing and pressing send on the input box displays the typed message on the chat screen as part of the conversation. Messages are added to the database and shown in real-time.

- ✅ **User-to-User Messaging**: Users can send messages to another user. Messages are displayed to the other user in real-time.

- ✅ **Conversation Navigation**: Clicking a chat opens the conversation for that chat.

### Optional Requirements ✅

- ✅ **Filters and Search for Chats**
- ✅ **Labels for chats**
- ✅ **Member assignment to different chats**

### Bonus Features ✅

- ✅ **Group Chat functionality**
- ✅ **Attachment support (video, image, etc.)**
- ✅ **Semantic HTML tags implementation**

## 🚀 Built with AI-Powered Development

This project was supercharged with cutting-edge AI tools that transformed the development process! 🔮✨

### 🛠️ AI Tools & Technologies

| Category | Tools | Benefits |
|----------|-------|----------|
| 🎨 **Frontend** | **Lovable** | Beautiful UI components with minimal effort |
| 💻 **Backend** | **Cursor + VS Code + Augment** | Intelligent code completion and automated tasks |
| 🧪 **Testing** | **Playwright MCP** | Automated UI testing for bulletproof functionality |
| 🧠 **AI Models** | **Context7, Supabase MCP, GitMCP** | Context-aware assistance across the entire stack |

### ✨ How AI Accelerated Development

- 🚄 **Lightning-Fast Prototyping**: Turned ideas into working code in record time
- 🔍 **Smart Code Generation**: AI suggested optimal patterns and implementations
- 🤖 **Automated Testing**: Caught bugs before they became problems
- 🔄 **Real-time Features**: Simplified complex real-time messaging implementation
- 🏗️ **Architecture Design**: AI helped create a clean, maintainable codebase

### 🌟 Key Technical Achievements

- ⚡ **Real-time Messaging**: Instant message delivery using Supabase subscriptions
- 📱 **Responsive Design**: Perfect experience across all devices
- 🧩 **Component Architecture**: Modular, reusable components for maintainability
- 🛡️ **Type Safety**: Comprehensive TypeScript typing throughout

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- npm, yarn, or pnpm

### Environment Setup

1. Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

2. Update the environment variables in `.env.local` with your Supabase credentials.

### Installation

```bash
# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:8080](http://localhost:8080) with your browser to see the result.

## Project Structure

- `src/app`: App router pages and layouts
- `src/components`: React components
- `src/hooks`: Custom React hooks
- `src/lib`: Utility functions and services
- `src/integrations`: External service integrations
- `src/db`: Database schemas and migrations

