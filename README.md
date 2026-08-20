# Personal Blog

A self-hosted personal blogging platform built for self-reflection. Write entries in Markdown, tag them, track your mood, and keep your thoughts in a quiet, dark-themed space that you control.

## Features

- **Authentication** — Login/register gate so only you can access your entries
- **Markdown editing** — Full GitHub Flavored Markdown support (tables, task lists, strikethrough, code blocks)
- **Live preview** — Toggle between edit and preview modes while writing
- **Mood tracking** — Tag each entry with a mood (Reflective, Grateful, Anxious, Calm, Inspired, Sad)
- **Tags** — Add comma-separated tags to organize entries
- **Pin entries** — Pin important posts to the top of the list
- **Search** — Filter entries by title, content, or tags
- **Delete with confirmation** — Inline confirm before removing an entry
- **Dark theme** — Dark by default with a clean zinc/violet palette

## Tech Stack

| Layer     | Technology            |
|-----------|-----------------------|
| Framework | Next.js 16 (App Router) |
| Language  | TypeScript            |
| Database  | MongoDB (local)       |
| Styling   | Tailwind CSS 4        |
| Auth      | JWT (httpOnly cookies)|
| Markdown  | react-markdown + remark-gfm |
| Passwords | bcryptjs              |

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

Environment variables are optional. Defaults are set for local development:

| Variable      | Default                        | Description              |
|---------------|--------------------------------|--------------------------|
| `MONGODB_URI` | `mongodb://localhost:27017/`   | MongoDB connection string|
| `MONGODB_DB`  | `personal_blog`                | Database name            |
| `JWT_SECRET`  | (built-in fallback)            | Secret for JWT signing   |

To override, create a `.env.local` file:

```
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB=personal_blog
JWT_SECRET=your-very-long-random-secret
```

## Production Build

```bash
npm run build
npm start
```

The app will start on port `3000` by default.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
