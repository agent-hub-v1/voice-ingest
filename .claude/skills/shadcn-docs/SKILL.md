---
name: shadcn-docs
description: Official shadcn/ui documentation for component library, CLI usage, theming, and form integration. Use when adding UI components, setting up shadcn/ui, configuring themes, implementing forms with React Hook Form, or styling with Tailwind CSS. MANDATORY to consult before implementing any UI components.
---

# shadcn/ui Documentation

Official shadcn/ui documentation for component library, CLI, theming, and Next.js integration.

## PRIMARY DOCUMENT

**START HERE → [docs/index.md](docs/index.md)**

The `index.md` file contains a comprehensive synthesized reference covering:
- Installation (Next.js specific)
- Project structure and import patterns
- components.json configuration
- cn() utility function
- Theming with CSS variables
- Dark mode setup (next-themes)
- All core components with code examples:
  - Button, Card, Input, Textarea, Select
  - Label, Badge, Dialog, DropdownMenu, ScrollArea
- Form integration (React Hook Form + Zod)
- CLI commands reference
- Common patterns (loading states, conditional styling)
- Lucide React icons

**Read `index.md` FIRST before any implementation.**

## Purpose

This skill provides bundled official documentation for shadcn/ui. It ensures implementations use correct component APIs, proper imports, and follow shadcn patterns.

## When to Use

**ALWAYS invoke this skill BEFORE**:
- Installing shadcn/ui (`shadcn@latest init`)
- Adding components (`shadcn@latest add [component]`)
- Using Button, Card, Input, or any shadcn component
- Setting up dark mode
- Implementing forms with validation
- Customizing theme colors
- Using the cn() utility

## Key Concepts

### Not a Package
shadcn/ui copies component code into your project. You own it, can modify it.

### Component Location
Components are installed to `@/components/ui/`. Import from there:
```typescript
import { Button } from "@/components/ui/button"
```

### cn() Utility
Always use `cn()` for conditional Tailwind classes:
```typescript
import { cn } from "@/lib/utils"
className={cn("base-class", condition && "conditional-class")}
```

### CLI Installation
Add components via CLI, not npm:
```bash
pnpm dlx shadcn@latest add button card input
```

## Critical Rules

1. **NEVER implement from memory** - component APIs may differ
2. **ALWAYS read `index.md`** before using components
3. **Use CLI to add components** - don't manually create
4. **Import from @/components/ui/** - standard shadcn path
5. **Use cn() for class merging** - handles Tailwind conflicts
