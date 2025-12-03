---
name: vercel-cli-docs
description: Vercel CLI guide for deploying and managing the voice-ingest app from terminal. Use when deploying to Vercel, managing environment variables, viewing logs, or any Vercel-related operations. Installed via AUR on this Arch Linux system.
---

# Vercel CLI Documentation

Complete guide for Vercel CLI operations on this Arch Linux system.

## PRIMARY DOCUMENT

**START HERE → [docs/index.md](docs/index.md)**

The `index.md` file contains a comprehensive guide covering:
- Authentication (`vercel login`, `vercel whoami`)
- Project linking (`vercel link`)
- Environment variable management (add, remove, list, pull)
- Deploying (preview vs production)
- Build and dev commands
- Inspecting deployments and logs
- Domain management
- Complete setup workflow for voice-ingest
- Troubleshooting common issues
- Free tier limits

**Read `index.md` before any Vercel operations.**

## Installation Note

Vercel CLI is installed **system-wide via AUR** on this machine:

```bash
# Already installed - DO NOT use npm install
which vercel  # /usr/bin/vercel
```

**DO NOT run `npm install -g vercel`** - it's already installed via pacman/AUR.

## Quick Reference

### Authentication
```bash
vercel login          # First-time auth (opens browser)
vercel whoami         # Check current user
```

### Project Setup
```bash
vercel link           # Link project to Vercel
```

### Environment Variables
```bash
echo "value" | vercel env add NAME production   # Add
vercel env ls production                        # List
vercel env pull .env.local                      # Download to local
vercel env rm NAME production                   # Remove
```

### Deployment
```bash
vercel                # Preview deployment
vercel --prod         # Production deployment
vercel --prod --logs  # Production with live logs
```

### Inspection
```bash
vercel ls             # List deployments
vercel logs           # View latest logs
vercel open           # Open dashboard in browser
```

## When to Use

**ALWAYS invoke this skill BEFORE**:
- Deploying the app to Vercel
- Adding or managing environment variables
- Viewing deployment logs
- Troubleshooting deployment issues
- Any `vercel` CLI command

## Critical Rules

1. **DO NOT run `npm install -g vercel`** - already installed via AUR
2. **ALWAYS `vercel link` first** before other commands in a new project
3. **Redeploy after adding env vars** - they're only available after deployment
4. **Use `--prod` for production** - bare `vercel` creates preview deployments
5. **Pull env vars locally** with `vercel env pull .env.local` for development
