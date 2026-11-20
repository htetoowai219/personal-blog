<div align="center">
  <h1>Personal Blog</h1>
  <p>A self-hosted journal for Markdown entries, moods, and tags.</p>
  <p><a href="https://personal-blog-fkpvu2nw9-web-main.vercel.app/"><b>Live Demo</b></a></p>
  <p>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License" /></a>
    <img src="https://img.shields.io/badge/node-%3E%3D20.9.0-informational?style=flat-square" alt="Node" />
  </p>
  <img src="assets/demo.png" alt="Personal Blog home screen" width="100%" />
</div>

## Quick Start

### Prerequisites

- Node.js 20.9 or newer (Next.js 16 requirement)
- MongoDB on `localhost:27017`, or an Atlas connection string
- Git

### Run locally

```bash
git clone git@github.com:htetoowai219/personal-blog.git
cd personal-blog
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and register an account. You're in.

Local defaults cover the database URI, database name, and a dev-only JWT secret, so no config file is needed to start. Override them with a `.env.local` file if you want — see [Configuration](#configuration).

<details>
<summary>Use MongoDB Atlas instead of a local server</summary>

Put your Atlas SRV string in `.env.local`:

```bash
MONGODB_URI=mongodb+srv://user:password@cluster.example.mongodb.net/
```

`MONGODB_DB` defaults to `personal_blog`.
</details>

## Why I Built This

I wanted a private place to write that I own end to end. Other journaling apps held my notes behind their accounts and their themes. This one runs on my machine or my Vercel project, and the words stay in a MongoDB database I control.

## What It Does

- Write entries in GitHub Flavored Markdown and flip to a live preview while drafting.
- Add a mood and comma-separated tags to each entry.
- Pin entries, search across titles/content/tags, and delete with an inline confirm.
- Edit a keeper profile (name, location, bio) that sits beside the entry list.
- Sign in with JWT cookies; passwords are hashed with bcryptjs.

Colors and typography are documented in [design.md](design.md).

## Configuration

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `MONGODB_URI` | In production | `mongodb://localhost:27017/` | MongoDB connection string |
| `MONGODB_DB` | No | `personal_blog` | Database name |
| `JWT_SECRET` | In production | dev-only fallback | Signs auth tokens |
| `NEXT_PUBLIC_SITE_URL` | No | `http://localhost:3000` | Base URL for metadata and social cards |

Generate a secret with `openssl rand -base64 32`. In production, requests fail fast if `MONGODB_URI` or `JWT_SECRET` is missing, so bad config shows up immediately.

<details>
<summary>Project layout</summary>

```text
src/
├── lib/
│   ├── mongodb.ts   # cached MongoDB client
│   ├── auth.ts      # JWT sign/verify and cookie helpers
│   ├── models.ts    # User and Blog interfaces
│   └── utils.ts     # shared types, moods, date helpers
└── app/
    ├── layout.tsx   # fonts, metadata, robots rules
    ├── globals.css  # parchment theme + prose styles
    ├── page.tsx     # redirects to /home or /auth
    ├── auth/        # sign-in and registration screen
    ├── home/        # entry list, reader, new/edit pages
    └── api/
        ├── auth/    # login, register, logout, me
        └── blogs/   # list/search, create, read, update, delete
```
</details>

<details>
<summary>Deploy to Vercel</summary>

1. Create a MongoDB Atlas cluster, add a database user, and allow access from `0.0.0.0/0` (Vercel functions don't have fixed IPs).
2. Import the GitHub repo at [vercel.com/new](https://vercel.com/new). Vercel detects Next.js without extra build settings.
3. Add `MONGODB_URI`, `MONGODB_DB`, `JWT_SECRET`, and `NEXT_PUBLIC_SITE_URL` under Settings → Environment Variables.
4. Deploy with the dashboard or `npx vercel --prod`.

</details>

## Common Commands

```bash
npm run dev          # dev server on port 3000
npm run lint         # ESLint
npm run build        # production build
npm start            # serve the build
npx tsc --noEmit     # TypeScript check
```

## License

MIT. See [LICENSE](LICENSE).
