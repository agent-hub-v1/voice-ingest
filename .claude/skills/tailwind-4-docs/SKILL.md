---
name: tailwind-4-docs
description: Tailwind CSS v4 documentation with breaking changes from v3. Use when writing Tailwind classes, configuring styles, or setting up Tailwind with Next.js. CRITICAL - v4 has major breaking changes. MANDATORY to consult before writing ANY Tailwind CSS.
---

# Tailwind CSS v4 Documentation

Official Tailwind CSS v4 documentation with critical breaking changes from v3.

## ⚠️ CRITICAL WARNING

**Tailwind v4 has MAJOR breaking changes from v3. Your training data is likely v3. DO NOT use v3 patterns.**

## PRIMARY DOCUMENT

**START HERE → [docs/index.md](docs/index.md)**

The `index.md` file contains a comprehensive synthesized reference covering:
- What changed (v3 → v4) - CRITICAL migration table
- Next.js installation (correct packages + config)
- `@theme` directive (replaces tailwind.config.js)
- Renamed utilities (shadow-sm → shadow-xs, etc.)
- Removed utilities (bg-opacity-* → bg-black/50)
- Default value changes (border, ring, placeholder, cursor)
- CSS variable syntax changes
- Grid syntax changes
- Variant stacking order reversal
- Custom utilities with @utility
- shadcn/ui compatibility
- Common patterns with correct v4 syntax

**Read `index.md` FIRST before writing ANY Tailwind classes.**

## Key Breaking Changes (MEMORIZE THESE)

### No Config File
```
v3: tailwind.config.js ❌
v4: @theme in CSS ✓
```

### Import Syntax
```css
/* v3 WRONG */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* v4 CORRECT */
@import "tailwindcss";
```

### PostCSS Plugin
```javascript
/* v3 WRONG */
plugins: { tailwindcss: {} }

/* v4 CORRECT */
plugins: { "@tailwindcss/postcss": {} }
```

### Renamed Utilities
| v3 (WRONG) | v4 (CORRECT) |
|------------|--------------|
| `shadow-sm` | `shadow-xs` |
| `shadow` | `shadow-sm` |
| `rounded-sm` | `rounded-xs` |
| `blur-sm` | `blur-xs` |
| `outline-none` | `outline-hidden` |
| `ring` | `ring-3` |

### Opacity Syntax
```tsx
/* v3 WRONG */ bg-black bg-opacity-50
/* v4 CORRECT */ bg-black/50
```

## When to Use

**ALWAYS invoke this skill BEFORE**:
- Setting up Tailwind CSS in a project
- Writing any Tailwind utility classes
- Creating custom theme colors/fonts
- Configuring PostCSS
- Debugging "class not working" issues

## Critical Rules

1. **NEVER create tailwind.config.js** - it doesn't exist in v4
2. **ALWAYS use @import "tailwindcss"** - not @tailwind directives
3. **ALWAYS use @tailwindcss/postcss** - not tailwindcss plugin
4. **CHECK renamed utilities** - shadow-sm, rounded-sm, blur-sm all changed
5. **USE opacity modifiers** - bg-black/50, not bg-opacity-50
