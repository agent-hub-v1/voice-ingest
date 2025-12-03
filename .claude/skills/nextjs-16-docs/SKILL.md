---
name: nextjs-16-docs
description: Official Next.js 16 documentation for App Router, API routes, server actions, and Vercel deployment. Use when implementing routes, API endpoints, server components, authentication flows, environment variables, or any Next.js 16 features. MANDATORY to consult before implementing any Next.js functionality.
---

# Next.js 16 Documentation

Official Next.js 16 documentation for App Router, API routes, server actions, and deployment.

## PRIMARY DOCUMENT

**START HERE → [docs/index.md](docs/index.md)**

The `index.md` file contains a comprehensive synthesized reference covering:
- Installation & setup
- Project structure (App Router)
- Route Handlers (API routes) - CRITICAL
- Server vs Client Components
- Environment variables
- Authentication (OAuth patterns)
- Forms & Server Actions
- Data fetching
- v16 breaking changes
- Common patterns with code examples

**Read `index.md` FIRST before any implementation.**

## Purpose

This skill provides bundled official documentation for Next.js 16. It ensures implementations stay aligned with official specifications and the latest patterns (including breaking changes from Next.js 15).

## When to Use

**ALWAYS invoke this skill BEFORE**:
- Setting up Next.js 16 project structure
- Implementing App Router pages and layouts
- Creating API route handlers
- Using server actions or server components
- Configuring environment variables
- Setting up authentication (OAuth flows)
- Deploying to Vercel
- Any Next.js 16 feature implementation

## Documentation Structure

All documentation is in the `docs/` directory:

- **index.md** - PRIMARY: Comprehensive synthesized reference (START HERE)
- Additional files may be added for specific deep-dives

## Key Breaking Changes (v15 → v16)

### proxy.ts replaces middleware.ts
- `middleware.ts` is now `proxy.ts`
- Makes network boundary explicit
- Runs on Node.js runtime (not Edge)

### Async params/searchParams Required
- Route params and searchParams are now async
- Must await them in server components and API routes

### Turbopack Default
- Turbopack is now the default bundler
- 10x faster Fast Refresh, 2-5x faster builds

### Minimum Node.js 20.9.0
- Node.js 20.9.0 or later required

## Usage Pattern

1. **Identify the feature** you're implementing
2. **Read the relevant documentation** from `docs/`
3. **Follow official patterns** exactly as documented
4. **Pay attention to v16 breaking changes**
5. **Never assume or implement from memory** - always consult docs first

## Critical Rules

1. **NEVER implement from memory** - Next.js 16 has breaking changes
2. **ALWAYS read official docs** before implementation
3. **Use proxy.ts NOT middleware.ts** - this is a breaking change
4. **Await params/searchParams** - they are async in v16
5. **Follow exact patterns** shown in examples
