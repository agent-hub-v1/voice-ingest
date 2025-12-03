# Vercel CLI Guide

Complete guide for deploying and managing the voice-ingest app via Vercel CLI.

**For Blob storage, see [blob.md](blob.md)**

---

## 1. Overview

Vercel CLI is installed system-wide via AUR on this Arch Linux machine. No npm global install needed.

**Key capabilities:**
- Deploy to preview/production from terminal
- Manage environment variables (no browser needed)
- Pull env vars to local `.env.local`
- View logs and inspect deployments
- Link local project to Vercel

---

## 2. Authentication

### First-Time Login

```bash
vercel login
```

This opens a browser for OAuth. After authenticating, the CLI stores credentials in `~/.config/vercel/`.

### Check Current User

```bash
vercel whoami
```

### Token-Based Auth (CI/CD)

For automation without browser:

```bash
# Generate token at https://vercel.com/account/tokens
vercel --token YOUR_TOKEN deploy
```

---

## 3. Project Linking

### Link Project to Vercel

Run from project root:

```bash
cd ~/agents/voice-ingest
vercel link
```

**Interactive prompts:**
1. "Set up project?" → Yes
2. "Which scope?" → Select your account
3. "Link to existing project?" → No (first time)
4. "Project name?" → `voice-ingest` (or accept default)
5. "Directory?" → `./` (current)

This creates `.vercel/` folder with `project.json` containing project ID.

### Verify Link

```bash
cat .vercel/project.json
```

### Re-link to Different Project

```bash
rm -rf .vercel
vercel link
```

---

## 4. Environment Variables

### Add Environment Variable

```bash
# Interactive (prompts for value)
vercel env add VARIABLE_NAME production

# With value piped in
echo "your-secret-value" | vercel env add VARIABLE_NAME production

# From file
vercel env add VARIABLE_NAME production < /path/to/secret.txt
```

### Environments

| Environment | When Used |
|-------------|-----------|
| `production` | Production deployments (`vercel --prod`) |
| `preview` | Preview deployments (PRs, branches) |
| `development` | Local dev (`vercel dev`) |

### Add to Multiple Environments

```bash
# Add to both production and preview
echo "value" | vercel env add VAR_NAME production
echo "value" | vercel env add VAR_NAME preview
```

### List Environment Variables

```bash
# All environments
vercel env ls

# Specific environment
vercel env ls production
```

### Remove Environment Variable

```bash
vercel env rm VARIABLE_NAME production
```

Add `--yes` to skip confirmation:

```bash
vercel env rm VARIABLE_NAME production --yes
```

### Pull to Local .env.local

```bash
# Pull development env vars
vercel env pull .env.local

# Pull from specific environment
vercel env pull .env.local --environment=production
```

This creates/overwrites `.env.local` with all variables for that environment.

---

## 5. Deploying

### Preview Deployment (Default)

```bash
vercel
```

- Creates a unique preview URL (e.g., `voice-ingest-abc123.vercel.app`)
- Does NOT update production
- Good for testing

### Production Deployment

```bash
vercel --prod
```

- Deploys to your production domain
- Updates the live site

### Deploy with Options

```bash
# Force fresh build (no cache)
vercel --prod --force

# Skip confirmation prompts
vercel --prod --yes

# Show build logs in real-time
vercel --prod --logs

# Don't wait for deployment to finish
vercel --prod --no-wait
```

### Deploy Specific Directory

```bash
vercel --prod --cwd /path/to/project
```

---

## 6. Build & Dev

### Local Development Server

```bash
vercel dev
```

Runs the app locally with Vercel's serverless function emulation. Uses environment variables from `.env.local`.

### Build Locally (Test Production Build)

```bash
vercel build
```

Creates `.vercel/output/` with production build artifacts.

### Deploy Pre-built

```bash
vercel build
vercel deploy --prebuilt --prod
```

---

## 7. Inspecting Deployments

### List Recent Deployments

```bash
vercel list
# or
vercel ls
```

### Inspect Specific Deployment

```bash
vercel inspect DEPLOYMENT_URL
# Example:
vercel inspect voice-ingest-abc123.vercel.app
```

### View Deployment Logs

```bash
vercel logs DEPLOYMENT_URL
# or for latest
vercel logs
```

### Open in Browser

```bash
# Open project dashboard
vercel open

# Open specific deployment
vercel open DEPLOYMENT_URL
```

---

## 8. Domains

### List Domains

```bash
vercel domains ls
```

### Add Custom Domain

```bash
vercel domains add yourdomain.com
```

### Remove Domain

```bash
vercel domains rm yourdomain.com
```

---

## 9. Project Management

### List Projects

```bash
vercel project ls
```

### Remove Project

```bash
vercel project rm PROJECT_NAME
```

### Remove Deployment

```bash
vercel remove DEPLOYMENT_URL
```

---

## 10. Complete Setup Workflow for voice-ingest

### Step 1: Login (if not already)

```bash
vercel whoami || vercel login
```

### Step 2: Link Project

```bash
cd ~/agents/voice-ingest
vercel link
```

Follow prompts to create new project named `voice-ingest`.

### Step 3: Add Environment Variables

```bash
# Google OAuth
echo "YOUR_GOOGLE_CLIENT_ID" | vercel env add GOOGLE_CLIENT_ID production
echo "YOUR_GOOGLE_CLIENT_ID" | vercel env add GOOGLE_CLIENT_ID preview

echo "YOUR_GOOGLE_CLIENT_SECRET" | vercel env add GOOGLE_CLIENT_SECRET production
echo "YOUR_GOOGLE_CLIENT_SECRET" | vercel env add GOOGLE_CLIENT_SECRET preview

# This will be your Vercel deployment URL - add after first deploy
# vercel env add GOOGLE_REDIRECT_URI production

# AssemblyAI
echo "YOUR_ASSEMBLYAI_API_KEY" | vercel env add ASSEMBLYAI_API_KEY production
echo "YOUR_ASSEMBLYAI_API_KEY" | vercel env add ASSEMBLYAI_API_KEY preview

# OpenRouter
echo "YOUR_OPENROUTER_API_KEY" | vercel env add OPENROUTER_API_KEY production
echo "YOUR_OPENROUTER_API_KEY" | vercel env add OPENROUTER_API_KEY preview
```

### Step 4: Pull Env Vars Locally

```bash
vercel env pull .env.local
```

### Step 5: First Deploy (Preview)

```bash
vercel
```

Note the preview URL. Use it to set `GOOGLE_REDIRECT_URI`:

```bash
echo "https://voice-ingest-xxx.vercel.app/api/auth/google/callback" | vercel env add GOOGLE_REDIRECT_URI production
```

### Step 6: Production Deploy

```bash
vercel --prod
```

### Step 7: Verify

```bash
vercel ls
vercel env ls production
```

---

## 11. Troubleshooting

### "Command not found: vercel"

Vercel is installed via AUR. Check:

```bash
which vercel
pacman -Qs vercel
```

### "Not linked to a project"

Run `vercel link` from project directory.

### "Environment variable not found"

1. Check it exists: `vercel env ls production`
2. Redeploy after adding: `vercel --prod`
3. Env vars only available AFTER deployment that includes them

### "Build failed"

View logs:

```bash
vercel logs
```

Or deploy with live logs:

```bash
vercel --prod --logs
```

### Rate Limited

Free tier has limits. Wait and retry:

```bash
vercel --prod --force
```

---

## 12. Quick Reference

| Command | Description |
|---------|-------------|
| `vercel login` | Authenticate |
| `vercel whoami` | Check current user |
| `vercel link` | Link project |
| `vercel` | Deploy preview |
| `vercel --prod` | Deploy production |
| `vercel env add NAME ENV` | Add env var |
| `vercel env ls` | List env vars |
| `vercel env pull .env.local` | Download env vars |
| `vercel env rm NAME ENV` | Remove env var |
| `vercel ls` | List deployments |
| `vercel logs` | View logs |
| `vercel dev` | Local dev server |
| `vercel open` | Open dashboard |

---

## 13. Files Created by Vercel

### .vercel/ (gitignored)

```
.vercel/
├── project.json     # Project ID and org ID
└── README.txt       # Info about the folder
```

**Add to .gitignore:**

```
.vercel
```

### .env.local (gitignored)

Created by `vercel env pull`. Contains environment variables for local development.

**Add to .gitignore:**

```
.env.local
.env*.local
```

---

## 14. Free Tier Limits

| Resource | Limit |
|----------|-------|
| Bandwidth | 100 GB/month |
| Serverless Function Invocations | 100,000/month |
| Serverless Function Duration | 10 seconds |
| Builds | 6,000 minutes/month |
| Deployments | Unlimited |
| Team Members | 1 (personal) |

Sufficient for personal use of voice-ingest app.
