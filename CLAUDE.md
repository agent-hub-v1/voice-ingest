# CLAUDE.md - Voice Ingest App

---

## 🚨 CRITICAL: ZERO HALLUCINATION POLICY 🚨

**YOU MUST USE THE BUNDLED DOCUMENTATION SKILLS FOR ALL IMPLEMENTATION.**

### Mandatory Documentation Consultation

Before writing ANY code, you MUST:

1. **Invoke `nextjs-16-docs` skill** → Read `docs/index.md` for Next.js patterns
2. **Invoke `assembly-ai-docs` skill** → Read docs for transcription API patterns
3. **Invoke `shadcn-docs` skill** → Read `docs/index.md` for UI component patterns
4. **Invoke `tailwind-4-docs` skill** → Read `docs/index.md` for Tailwind v4 patterns (BREAKING CHANGES from v3)
5. **Invoke `vercel-cli-docs` skill** → Read `docs/index.md` for deployment (Vercel CLI installed via AUR)

### Knowledge Gap Protocol

**If the skill docs don't cover what you need:**

1. **STOP IMMEDIATELY** - Do not guess or use training data
2. **TELL THE USER**: "I have a knowledge gap: [specific topic]. The bundled docs don't cover [X]. Can you add this documentation?"
3. **WAIT** for user to provide the documentation
4. **DO NOT search the internet** - Training data contains outdated Next.js 15 patterns that will break v16 code

### Fallback: Official Docs Only

If user instructs you to search, you may ONLY use:
- **https://nextjs.org/docs** (Next.js 16.0.7 official docs)
- **https://www.assemblyai.com/docs** (AssemblyAI official docs)
- **https://ui.shadcn.com/docs** (shadcn/ui official docs)
- **https://tailwindcss.com/docs** (Tailwind CSS v4 official docs)

**NEVER use**:
- Stack Overflow (outdated)
- Blog posts (likely v14/v15)
- Random tutorials (context poisoning)
- Your training data for Next.js patterns (outdated)

### Why This Matters

Next.js 16 has BREAKING CHANGES from v15:
- `params` and `searchParams` are now Promises (must await)
- `middleware.ts` → `proxy.ts`
- Turbopack is default
- Node.js 20.9+ required

Tailwind CSS v4 has BREAKING CHANGES from v3:
- No `tailwind.config.js` - use `@theme` in CSS
- `@import "tailwindcss"` not `@tailwind` directives
- `@tailwindcss/postcss` not `tailwindcss` plugin
- Many utilities renamed (shadow-sm → shadow-xs, etc.)
- Opacity syntax changed (bg-opacity-50 → bg-black/50)

Code from v3 tutorials WILL BREAK. The bundled docs have correct v4 patterns.

---

## Project Overview

Voice memo transcription app that converts audio recordings into structured markdown files for the Symbiont personal AI system.

**Stack**: Next.js 16 (App Router) + shadcn/ui + Tailwind CSS + Vercel

**Key integrations**:
- AssemblyAI for transcription with speaker diarization
- Google Drive API for file management
- OpenRouter API for AI text cleaning (free models only)

---

## Key Documents

| Document | Purpose |
|----------|---------|
| `docs/voice-ingest-app-spec.md` | Complete technical specification |
| `docs/symbiont-integration.md` | Symbiont frontmatter schema, contacts format, output structure |
| `.claude/skills/nextjs-16-docs/docs/index.md` | Next.js 16 patterns (PRIMARY REFERENCE) |
| `.claude/skills/assembly-ai-docs/docs/index.md` | AssemblyAI API patterns |
| `.claude/skills/shadcn-docs/docs/index.md` | shadcn/ui component patterns |
| `.claude/skills/tailwind-4-docs/docs/index.md` | Tailwind CSS v4 patterns (BREAKING CHANGES) |
| `.claude/skills/vercel-cli-docs/docs/index.md` | Vercel CLI deployment guide (AUR installed) |

**Read spec docs first, then consult skills for implementation patterns.**

---

## Constraints

### Free Tier Only

All services MUST use free tiers:
- Vercel: 100GB bandwidth, 100k function invocations
- AssemblyAI: 185 hours/account
- Google Drive: 15GB/account
- OpenRouter: Free models only

### No Paid APIs

User has no separate API budget. Everything must work within free tier limits.

### Output Format

Markdown files MUST match the exact frontmatter schema in `docs/symbiont-integration.md`. This is non-negotiable - Symbiont expects this format.

---

## Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build
npm run build

# Lint
npm run lint
```

---

## Project Structure (Target)

```
voice-ingest/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Main UI (file list + editor)
│   │   ├── layout.tsx
│   │   └── api/
│   │       ├── auth/google/    # Google OAuth
│   │       ├── drive/          # Google Drive operations
│   │       ├── transcribe/     # AssemblyAI integration
│   │       ├── clean-text/     # OpenRouter integration
│   │       └── export/         # Markdown generation
│   ├── components/
│   │   ├── file-list.tsx       # Audio file list from Drive
│   │   ├── transcription-editor.tsx  # Split-screen editor
│   │   ├── frontmatter-form.tsx      # Left panel form
│   │   └── speaker-mapper.tsx        # Speaker name mapping
│   └── lib/
│       ├── assemblyai.ts       # AssemblyAI client
│       ├── google-drive.ts     # Google Drive client
│       ├── openrouter.ts       # OpenRouter client
│       ├── contacts.ts         # Contacts JSON loader
│       └── markdown.ts         # Markdown generation
├── .claude/
│   └── skills/
│       ├── nextjs-16-docs/     # Next.js 16 reference (USE THIS)
│       ├── assembly-ai-docs/   # AssemblyAI reference (USE THIS)
│       ├── shadcn-docs/        # shadcn/ui reference (USE THIS)
│       ├── tailwind-4-docs/    # Tailwind v4 reference (USE THIS)
│       └── vercel-cli-docs/    # Vercel deployment (USE THIS)
├── docs/
│   ├── voice-ingest-app-spec.md
│   └── symbiont-integration.md
├── public/
├── .env.local                  # Environment variables (not committed)
├── package.json
└── CLAUDE.md
```

---

## Implementation Order

1. **Project setup**: Next.js 16, shadcn/ui, Tailwind
2. **Google OAuth**: Authentication flow for Drive access
3. **Drive integration**: List files, download for transcription, move files
4. **AssemblyAI integration**: Submit audio, poll for results, parse speaker labels
5. **UI - File list**: Show unprocessed audio files
6. **UI - Split-screen editor**: Left form, right editable transcript
7. **Speaker mapping**: Map Speaker A/B/C to names from contacts
8. **AI text cleaning**: OpenRouter integration for filler removal + clarity
9. **Markdown export**: Generate file with correct frontmatter
10. **Testing & polish**

---

## Environment Variables

```bash
# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# AssemblyAI
ASSEMBLYAI_API_KEY=

# OpenRouter
OPENROUTER_API_KEY=

# Contacts (optional, defaults to ~/symbiont/data/contacts.json)
CONTACTS_SOURCE=
```
