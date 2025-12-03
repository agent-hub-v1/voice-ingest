# Next.js 16 Quick Reference

Synthesized documentation for Next.js 16 App Router - everything needed for the voice-ingest transcription app.

---

## 1. Installation & Setup

### Create Project

```bash
npx create-next-app@latest
```

**Recommended defaults**: TypeScript, ESLint, Tailwind CSS, App Router, Turbopack, `@/*` import alias.

### System Requirements

- **Node.js**: 20.9.0 or higher (REQUIRED)
- **TypeScript**: 5.1.0+ (if using)

### Initial Files Created

```
my-app/
├── app/
│   ├── layout.tsx    # Root layout (html, body tags)
│   ├── page.tsx      # Home page
│   └── globals.css
├── public/           # Static assets
├── next.config.js
├── package.json
├── tsconfig.json
└── .env.local        # Create this for secrets
```

---

## 2. Project Structure (App Router)

### Top-Level Folders

| Folder | Purpose |
|--------|---------|
| `app/` | App Router - routes, layouts, API handlers |
| `public/` | Static files served at root |
| `src/` | Optional - separates app code from config |

### Routing File Conventions

| File | Purpose |
|------|---------|
| `page.tsx` | Makes route publicly accessible |
| `layout.tsx` | Shared UI wrapper for segment |
| `loading.tsx` | Loading skeleton during fetch |
| `error.tsx` | Error boundary |
| `route.ts` | API endpoint handler |
| `not-found.tsx` | Custom 404 |

### Key Principle

**A route becomes public only when `page.tsx` or `route.ts` exists.** Other files can coexist without becoming routes.

### Dynamic Routes

```
app/
├── blog/
│   └── [slug]/           # /blog/my-post
│       └── page.tsx
├── shop/
│   └── [...slug]/        # /shop/a/b/c (catch-all)
│       └── page.tsx
└── docs/
    └── [[...slug]]/      # /docs OR /docs/a/b (optional catch-all)
        └── page.tsx
```

### Private Folders

Prefix with underscore to exclude from routing:

```
app/
├── _components/    # Not a route
├── _lib/           # Not a route
└── dashboard/
    └── page.tsx    # This IS a route
```

### Route Groups

Parentheses organize without affecting URL:

```
app/
├── (marketing)/
│   ├── about/page.tsx     # /about
│   └── contact/page.tsx   # /contact
└── (app)/
    └── dashboard/page.tsx # /dashboard
```

---

## 3. Route Handlers (API Routes)

**CRITICAL**: This is how you create API endpoints in App Router.

### Basic Structure

Create `route.ts` in any folder under `app/`:

```
app/
└── api/
    ├── transcribe/
    │   └── route.ts    # /api/transcribe
    ├── drive/
    │   ├── list/
    │   │   └── route.ts    # /api/drive/list
    │   └── move/
    │       └── route.ts    # /api/drive/move
    └── auth/
        └── google/
            └── route.ts    # /api/auth/google
```

### Supported HTTP Methods

Export async functions named after HTTP verbs:

```typescript
// app/api/transcribe/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Hello' })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  // Process body...
  return NextResponse.json({ success: true })
}

// Also supported: PUT, PATCH, DELETE, HEAD, OPTIONS
```

### Reading Request Body

**JSON:**
```typescript
export async function POST(request: NextRequest) {
  const data = await request.json()
  // data is parsed JSON object
}
```

**FormData:**
```typescript
export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  const name = formData.get('name') as string
}
```

### Query Parameters

```typescript
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query') // ?query=value
}
```

### Dynamic Route Parameters

**BREAKING CHANGE in v16**: `params` is now a Promise - must await it.

```typescript
// app/api/files/[fileId]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params  // MUST await
  return NextResponse.json({ fileId })
}
```

### Setting Headers & Cookies

```typescript
import { cookies } from 'next/headers'

export async function GET() {
  // Read cookies
  const cookieStore = await cookies()
  const token = cookieStore.get('token')

  // Set cookies in response
  const response = NextResponse.json({ success: true })
  response.cookies.set('session', 'abc123', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })
  return response
}
```

### Redirects

```typescript
import { redirect } from 'next/navigation'

export async function GET() {
  redirect('/dashboard')  // Server-side redirect
}

// Or with NextResponse
export async function GET() {
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
```

### Error Responses

```typescript
export async function GET() {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  )
}
```

### CORS Headers

```typescript
export async function GET(request: NextRequest) {
  const response = NextResponse.json({ data: 'value' })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  return response
}
```

---

## 4. Server vs Client Components

### Default: Server Components

All components in App Router are Server Components by default.

**Server Components can:**
- Fetch data directly (database, APIs)
- Access backend resources securely
- Keep secrets server-side
- Reduce client JavaScript bundle

**Server Components CANNOT:**
- Use useState, useEffect, or other hooks
- Use browser APIs (window, localStorage)
- Add event handlers (onClick, onChange)

### Client Components: 'use client'

Add `"use client"` directive at top of file:

```typescript
"use client"

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
```

**Use Client Components when you need:**
- State (useState)
- Effects (useEffect)
- Event handlers (onClick, onChange, onSubmit)
- Browser APIs (localStorage, window)
- Custom hooks

### Composition Pattern

Pass Server Components as children to Client Components:

```typescript
// ServerComponent.tsx (no directive = server)
export function ServerData() {
  const data = await fetchFromDB()  // Secure, server-side
  return <div>{data}</div>
}

// ClientWrapper.tsx
"use client"
export function ClientWrapper({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && children}
    </div>
  )
}

// page.tsx (server)
export default function Page() {
  return (
    <ClientWrapper>
      <ServerData />  {/* Server component as child */}
    </ClientWrapper>
  )
}
```

### Best Practice

Keep `"use client"` boundaries small. Don't mark entire pages as client - only the interactive parts.

---

## 5. Environment Variables

### File Hierarchy (Priority Order)

1. `process.env` (system)
2. `.env.$(NODE_ENV).local`
3. `.env.local` (skipped in test)
4. `.env.$(NODE_ENV)`
5. `.env`

### Server-Only Variables (Default)

```bash
# .env.local
ASSEMBLYAI_API_KEY=abc123
GOOGLE_CLIENT_SECRET=xyz789
DATABASE_URL=postgres://...
```

Access in Route Handlers and Server Components:

```typescript
// app/api/transcribe/route.ts
const apiKey = process.env.ASSEMBLYAI_API_KEY
```

**These are NEVER exposed to the browser.**

### Public Variables (Client-Accessible)

Prefix with `NEXT_PUBLIC_`:

```bash
# .env.local
NEXT_PUBLIC_APP_URL=https://myapp.vercel.app
```

```typescript
// Any component (client or server)
const appUrl = process.env.NEXT_PUBLIC_APP_URL
```

**WARNING**: These are inlined at BUILD TIME. Changes require rebuild.

### .gitignore

```gitignore
# Environment files
.env
.env.local
.env.*.local
```

**Never commit secrets to git.**

---

## 6. Authentication (OAuth Pattern)

### Google OAuth Flow

```
1. User clicks "Sign in with Google"
2. Redirect to Google's OAuth URL
3. Google redirects back with ?code=xxx
4. Exchange code for tokens
5. Store tokens in httpOnly cookie
6. User is authenticated
```

### Step 1: Redirect to Google

```typescript
// app/api/auth/google/route.ts
export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/drive.file',
    access_type: 'offline',
    prompt: 'consent',
  })

  return Response.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  )
}
```

### Step 2: Handle Callback

```typescript
// app/api/auth/google/callback/route.ts
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')

  // Exchange code for tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code: code!,
      grant_type: 'authorization_code',
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    }),
  })

  const tokens = await tokenResponse.json()

  // Store in httpOnly cookie
  const cookieStore = await cookies()
  cookieStore.set('google_tokens', JSON.stringify(tokens), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })

  return Response.redirect(new URL('/', request.url))
}
```

### Reading Tokens in API Routes

```typescript
// app/api/drive/list/route.ts
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const tokensCookie = cookieStore.get('google_tokens')

  if (!tokensCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const tokens = JSON.parse(tokensCookie.value)
  // Use tokens.access_token for Google API calls
}
```

---

## 7. Forms & Server Actions

### Basic Form with Server Action

```typescript
// app/components/TranscriptionForm.tsx
"use client"

import { useActionState } from 'react'
import { submitTranscription } from '@/app/actions'

export function TranscriptionForm() {
  const [state, formAction, pending] = useActionState(submitTranscription, null)

  return (
    <form action={formAction}>
      <input name="subject" placeholder="Subject" required />
      <textarea name="summary" placeholder="Summary" />
      <button type="submit" disabled={pending}>
        {pending ? 'Saving...' : 'Save'}
      </button>
      {state?.error && <p className="error">{state.error}</p>}
    </form>
  )
}
```

### Server Action

```typescript
// app/actions.ts
"use server"

import { z } from 'zod'

const schema = z.object({
  subject: z.string().min(1, 'Subject required'),
  summary: z.string().optional(),
})

export async function submitTranscription(prevState: any, formData: FormData) {
  const validated = schema.safeParse({
    subject: formData.get('subject'),
    summary: formData.get('summary'),
  })

  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  // Process data...
  return { success: true }
}
```

### FormData Methods

```typescript
// Single value
const name = formData.get('name') as string

// Multiple values (checkboxes, multi-select)
const tags = formData.getAll('tags') as string[]

// All fields as object
const data = Object.fromEntries(formData)

// File upload
const file = formData.get('file') as File
const buffer = await file.arrayBuffer()
```

---

## 8. Data Fetching

### In Server Components (Recommended)

```typescript
// app/dashboard/page.tsx
async function getData() {
  const res = await fetch('https://api.example.com/data')
  return res.json()
}

export default async function Page() {
  const data = await getData()
  return <div>{data.title}</div>
}
```

### Parallel Data Fetching

```typescript
export default async function Page() {
  // Start both requests simultaneously
  const userPromise = getUser()
  const postsPromise = getPosts()

  // Wait for both
  const [user, posts] = await Promise.all([userPromise, postsPromise])

  return (
    <div>
      <h1>{user.name}</h1>
      <PostList posts={posts} />
    </div>
  )
}
```

### Loading States

Create `loading.tsx` next to `page.tsx`:

```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return <div>Loading...</div>
}
```

This automatically wraps the page in Suspense.

### Client-Side Fetching (When Needed)

```typescript
"use client"

import { useEffect, useState } from 'react'

export function ClientData() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) return <div>Loading...</div>
  return <div>{data.title}</div>
}
```

---

## 9. Key v16 Breaking Changes

### params is Now Async

**Before (v15):**
```typescript
export async function GET(request, { params }) {
  const id = params.id  // Direct access
}
```

**After (v16):**
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params  // MUST await
}
```

### searchParams is Now Async

Same pattern - must await in page components:

```typescript
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>
}) {
  const { query } = await searchParams
}
```

### middleware.ts → proxy.ts

If using middleware, rename file to `proxy.ts`. Runs on Node.js runtime now.

### Minimum Node.js 20.9.0

Ensure your environment meets this requirement.

### Turbopack is Default

No action needed - just be aware dev server uses Turbopack by default.

---

## 10. Deployment (Vercel)

### Environment Variables

Set in Vercel Dashboard → Project → Settings → Environment Variables.

**Required for voice-ingest:**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` (must match Vercel URL)
- `ASSEMBLYAI_API_KEY`
- `OPENROUTER_API_KEY`

### Deploy Command

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

Or connect GitHub repo in Vercel Dashboard for automatic deploys.

### Free Tier Limits

- 100GB bandwidth/month
- 100,000 function invocations/month
- Serverless function timeout: 10s (Hobby)

---

## Quick Reference: Common Patterns

### API Route That Calls External Service

```typescript
// app/api/transcribe/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { audioUrl } = await request.json()

    const response = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': process.env.ASSEMBLYAI_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        speaker_labels: true,
      }),
    })

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    )
  }
}
```

### Protected API Route

```typescript
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Proceed with authenticated request...
}
```

### Client Component with Form State

```typescript
"use client"

import { useState } from 'react'

export function Editor() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
```
