# Contributing to Personal Blog

Thanks for your interest in contributing! This is a personal blogging platform built for self-reflection, and we welcome improvements, bug fixes, and new features.

## Getting Started

### Before You Start

1. **Star** the repo to show your support
2. **Fork** the repository to your own GitHub account
3. **Clone** your fork and set it up locally

### Prerequisites

- Node.js 18+
- MongoDB running locally on `localhost:27017`

### Setup

```bash
git clone <repo-url>
cd personal-blog
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Project Structure

```
src/
├── lib/
│   ├── mongodb.ts          # MongoDB connection (singleton)
│   ├── auth.ts             # JWT auth helpers
│   └── models.ts           # TypeScript interfaces
├── app/
│   ├── auth/               # Login/register page
│   ├── home/               # Blog list + create/edit/read views
│   └── api/
│       ├── auth/           # Login, register, logout, me
│       └── blogs/          # CRUD for blog entries
```

## Development Workflow

1. **Create a branch** from `main` for your change
2. **Make your changes** following the conventions below
3. **Build and lint** before submitting:
   ```bash
   npm run build
   ```
4. **Open a PR** with a clear description of what changed and why

## Code Conventions

- **TypeScript** for all files
- **Tailwind CSS** for styling — no inline `style` attributes, no CSS modules
- **App Router** patterns — route handlers in `app/api/`, pages in `app/`
- **No new dependencies** unless justified — keep the bundle lean
- **No comments** unless the logic is genuinely non-obvious

### API Routes

- Authentication is checked via `getUserFromRequest()` from `src/lib/auth.ts`
- All blog endpoints are scoped to the authenticated user (`userId`)
- Return consistent JSON shapes with appropriate HTTP status codes

### Components

- Client components use the `"use client"` directive
- Server components are the default — only add `"use client"` when you need interactivity
- Keep page-level components self-contained (all state + UI in one file is fine for this project's scale)

## Reporting Issues

Open an issue with:

- A clear title
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Your environment (OS, Node version, browser)

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
