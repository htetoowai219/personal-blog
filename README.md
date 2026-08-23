# Personal Blog

A self-hosted personal blogging platform built for self-reflection. Write entries in Markdown, tag them, track your mood, and keep your thoughts in a quiet, parchment-toned space that you control.

## Live Demo

The app is deployed on Vercel: **[personal-blog-delta-one.vercel.app](https://personal-blog-delta-one.vercel.app/)**

![Personal Blog — home screen](assets/demo.png)

## Features

- **Authentication** — Login/register gate so only you can access your entries
- **Profile panel** — Editable keeper's profile (name, location, bio) beside your entries
- **Markdown editing** — Full GitHub Flavored Markdown support (tables, task lists, strikethrough, code blocks)
- **Live preview** — Toggle between edit and preview modes while writing
- **Mood tracking** — Tag each entry with a mood (Reflective, Grateful, Anxious, Calm, Inspired, Sad)
- **Tags** — Add comma-separated tags to organize entries
- **Pin entries** — Pin important posts to the top of the list
- **Search** — Filter entries by title, content, or tags
- **Delete with confirmation** — Inline confirm before removing an entry
- **Vintage theme** — Warm parchment palette with serif typography and typewriter accents (see [design.md](design.md))

## Tech Stack

| Layer     | Technology            |
|-----------|-----------------------|
| Framework | Next.js 16 (App Router) |
| Language  | TypeScript            |
| Database  | MongoDB (Atlas or local) |
| Styling   | Tailwind CSS 4        |
| Auth      | JWT (httpOnly cookies)|
| Markdown  | react-markdown + remark-gfm |
| Passwords | bcryptjs              |
| Hosting   | Vercel-ready           |

## Prerequisites

- **Node.js** 18+ (recommended 20+)
- **MongoDB** running locally on the default port (`27017`)

## Getting Started

1. **Clone the repository**

   ```bash
   git clone git@github.com:htetoowai219/personal-blog.git
   cd personal-blog
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start MongoDB**

   Make sure `mongod` is running. On macOS with Homebrew:

   ```bash
   brew services start mongodb-community
   ```

4. **Run the dev server**

   ```bash
   npm run dev
   ```

5. **Open the app**

   Navigate to [http://localhost:3000](http://localhost:3000). You'll be redirected to the login page. Create an account and start writing.

## Project Structure

```
src/
├── lib/
│   ├── mongodb.ts          # MongoDB connection singleton
│   ├── auth.ts             # JWT sign/verify, cookie helpers
│   └── models.ts           # TypeScript interfaces (User, Blog)
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   ├── globals.css         # Dark theme + prose styles
│   ├── page.tsx            # Root redirect (→ /auth or /home)
│   ├── auth/
│   │   ├── page.tsx
│   │   └── auth-client.tsx # Login/register client component
│   ├── home/
│   │   └── page.tsx        # Blog list, create, edit, read
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── register/route.ts
│       │   ├── logout/route.ts
│       │   └── me/route.ts
│       └── blogs/
│           ├── route.ts    # GET (list/search), POST (create)
│           └── [id]/route.ts # GET, PUT, DELETE single entry
```

## Configuration

Copy `.env.example` to `.env.local` and fill in the values. Defaults are set for local development:

| Variable              | Required in production | Default                        | Description                          |
|-----------------------|------------------------|--------------------------------|--------------------------------------|
| `MONGODB_URI`         | Yes                    | `mongodb://localhost:27017/`   | MongoDB connection string            |
| `MONGODB_DB`          | No                     | `personal_blog`                | Database name                        |
| `JWT_SECRET`          | Yes                    | (dev-only fallback)            | Secret for JWT signing               |
| `NEXT_PUBLIC_SITE_URL`| Recommended            | —                              | Public URL, used for metadata/social cards |

Generate a strong `JWT_SECRET` with:

```bash
openssl rand -base64 32
```

> The app refuses to boot in production if `MONGODB_URI` or `JWT_SECRET` are missing,
> so misconfigurations surface immediately instead of failing silently.

## Production Build

```bash
npm run build
npm start
```

The app will start on port `3000` by default.

## Deploying to Vercel

1. **Create a MongoDB Atlas database** (free tier works fine)

   1. Create a cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   2. Add a database user and allow access from anywhere (`0.0.0.0/0`) under Network Access — Vercel functions use ephemeral IPs, so IP allowlists won't work
   3. Grab the SRV connection string (`mongodb+srv://user:password@cluster...`)

2. **Push the repository to GitHub**, then import it on [vercel.com/new](https://vercel.com/new)

   Vercel auto-detects Next.js — no build settings needed.

3. **Add environment variables** in your Vercel project (Settings → Environment Variables):

   | Variable               | Value                                   |
   |------------------------|-----------------------------------------|
   | `MONGODB_URI`          | Your Atlas connection string            |
   | `MONGODB_DB`           | `personal_blog`                         |
   | `JWT_SECRET`           | Output of `openssl rand -base64 32`     |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-domain.vercel.app`        |

4. **Deploy**

   Every push to the main branch triggers a new deployment.

Alternatively, deploy straight from the CLI:

```bash
npx vercel --prod
```

## Metadata

The app ships with complete SEO/social metadata:

- Title template (`Sign in · Personal Blog`, etc.) per route
- Open Graph image generated at build time (`src/app/opengraph-image.tsx`)
- Parchment-toned favicon (`src/app/icon.svg`) and browser theme color
- Search engines are told **not** to index the site by default since all content is private.
  To make it indexable, change the `robots` entry in `src/app/layout.tsx`.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
