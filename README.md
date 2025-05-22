# Clean Web Style Next.js Application

This is a modern messaging application built with Next.js, TypeScript, and Tailwind CSS. It uses Supabase for backend services.

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

## Deployment

### GitHub Setup

1. Create a new GitHub repository
2. Initialize Git in the project directory (if not already done):

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo-name.git
git push -u origin main
```

### Vercel Deployment

1. Go to [Vercel](https://vercel.com) and sign in with your GitHub account
2. Click "New Project" and import your GitHub repository
3. Configure the project:
   - Set the Framework Preset to "Next.js"
   - Add the environment variables from your `.env.local` file
4. Click "Deploy"

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
