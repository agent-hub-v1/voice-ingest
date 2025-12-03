---
name: vercel-docs
description: Vercel platform documentation covering CLI deployment, environment variables, and Blob storage. Use for deploying the app, managing env vars, and implementing file upload/storage with Vercel Blob.
---

# Vercel Documentation

Complete guide for Vercel CLI and Blob storage.

## DOCUMENTS

| File | Purpose |
|------|---------|
| **[docs/index.md](docs/index.md)** | CLI: deploy, env vars, logs, project linking |
| **[docs/blob.md](docs/blob.md)** | Blob storage: put, list, del, TypeScript types |

**Read the relevant doc before implementing.**

## Installation Note

Vercel CLI is installed **system-wide via AUR** on this machine:

```bash
# Already installed - DO NOT use npm install
which vercel  # /usr/bin/vercel
```

**DO NOT run `npm install -g vercel`** - it's already installed via pacman/AUR.

## Quick Reference

### CLI Commands
```bash
vercel link           # Link project to Vercel
vercel                # Preview deployment
vercel --prod         # Production deployment
vercel env pull .env.local  # Download env vars
```

### Blob SDK
```bash
pnpm add @vercel/blob
```

```typescript
import { put, list, del } from '@vercel/blob';

// Upload
const blob = await put('audio.m4a', file, { access: 'public' });

// List
const { blobs } = await list();

// Delete
await del(blobUrl);
```

## When to Use

**ALWAYS invoke this skill BEFORE**:
- Deploying the app to Vercel
- Adding or managing environment variables
- Implementing the `/api/ingest` endpoint
- Any blob storage operations
- Viewing deployment logs

## Critical Rules

1. **DO NOT run `npm install -g vercel`** - already installed via AUR
2. **ALWAYS `vercel link` first** before other commands in a new project
3. **Redeploy after adding env vars** - they're only available after deployment
4. **Blob access must be 'public'** for AssemblyAI to access audio files
5. **Free tier Blob is 1GB** - delete audio files after processing
