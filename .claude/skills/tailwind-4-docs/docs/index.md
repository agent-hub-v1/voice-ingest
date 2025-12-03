# Tailwind CSS v4 Quick Reference

Synthesized documentation for Tailwind CSS v4 with Next.js integration.

**⚠️ WARNING: Tailwind v4 has MAJOR breaking changes from v3. DO NOT use v3 patterns.**

---

## 1. What Changed (v3 → v4)

### Configuration is Now CSS-Based

| v3 (OLD - DON'T USE) | v4 (NEW - USE THIS) |
|---------------------|---------------------|
| `tailwind.config.js` | **Gone** - use `@theme` in CSS |
| `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| `content: ['./src/**/*.{js,tsx}']` | **Automatic detection** |
| `tailwindcss` PostCSS plugin | `@tailwindcss/postcss` |
| `theme.extend.colors` | `@theme { --color-*: }` |

### PostCSS Plugin Changed

```javascript
// v3 (WRONG)
plugins: {
  tailwindcss: {},
  autoprefixer: {},
}

// v4 (CORRECT)
plugins: {
  "@tailwindcss/postcss": {},
}
```

**Note**: `autoprefixer` and `postcss-import` are now built-in. Remove them.

---

## 2. Next.js Installation (v4)

### Step 1: Install Dependencies

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

**Note**: No `autoprefixer` needed - it's built-in now.

### Step 2: Create PostCSS Config

```javascript
// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

### Step 3: Update globals.css

```css
/* app/globals.css */
@import "tailwindcss";
```

**That's it.** No `tailwind.config.js` needed for basic usage.

### Complete globals.css Example

```css
@import "tailwindcss";

/* Custom theme extensions */
@theme {
  --color-brand: #3b82f6;
  --color-brand-dark: #1d4ed8;
  --font-sans: "Inter", sans-serif;
}

/* Custom base styles (optional) */
@layer base {
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## 3. @theme Directive (Replaces tailwind.config.js)

### Basic Syntax

```css
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --font-display: "Satoshi", sans-serif;
  --spacing-18: 4.5rem;
  --breakpoint-3xl: 1920px;
}
```

### Namespace → Utility Mapping

| CSS Variable | Creates Utility |
|--------------|-----------------|
| `--color-brand` | `bg-brand`, `text-brand`, `border-brand` |
| `--font-display` | `font-display` |
| `--text-2xl` | `text-2xl` |
| `--spacing-18` | `p-18`, `m-18`, `w-18`, `h-18` |
| `--breakpoint-3xl` | `3xl:` variant |
| `--radius-xl` | `rounded-xl` |
| `--shadow-glow` | `shadow-glow` |

### Reset Defaults + Add Custom

```css
@theme {
  /* Remove all default colors */
  --color-*: initial;

  /* Add only what you need */
  --color-white: #ffffff;
  --color-black: #000000;
  --color-brand: #3b82f6;
}
```

---

## 4. Renamed Utilities (CRITICAL)

**These will break if you use old names:**

| v3 (OLD) | v4 (NEW) |
|----------|----------|
| `shadow-sm` | `shadow-xs` |
| `shadow` (default) | `shadow-sm` |
| `drop-shadow-sm` | `drop-shadow-xs` |
| `blur-sm` | `blur-xs` |
| `backdrop-blur-sm` | `backdrop-blur-xs` |
| `rounded-sm` | `rounded-xs` |
| `outline-none` | `outline-hidden` |
| `ring` (default) | `ring-3` |

### Migration Examples

```tsx
// v3 (WRONG)
<div className="shadow-sm rounded-sm blur-sm" />

// v4 (CORRECT)
<div className="shadow-xs rounded-xs blur-xs" />
```

---

## 5. Removed Utilities

**These no longer exist in v4:**

| Removed | Use Instead |
|---------|-------------|
| `bg-opacity-50` | `bg-black/50` (opacity modifier) |
| `text-opacity-75` | `text-white/75` |
| `border-opacity-*` | `border-gray-500/50` |
| `flex-shrink-0` | `shrink-0` |
| `flex-grow` | `grow` |
| `overflow-ellipsis` | `text-ellipsis` |
| `decoration-slice` | `box-decoration-slice` |

### Opacity Modifier Syntax

```tsx
// v3 (WRONG - removed)
<div className="bg-black bg-opacity-50" />

// v4 (CORRECT)
<div className="bg-black/50" />

// Works with any color
<div className="bg-blue-500/75 text-white/90 border-gray-300/50" />
```

---

## 6. Default Value Changes

### Border Color
```css
/* v3: default was gray-200 */
/* v4: default is currentColor (transparent-ish) */

/* If you want visible borders, be explicit: */
<div className="border border-gray-200" />
```

### Ring Width
```css
/* v3: ring = 3px */
/* v4: ring = 1px, use ring-3 for old behavior */

<div className="ring-3 ring-blue-500" />  /* Same as v3 "ring" */
```

### Placeholder Color
```css
/* v3: placeholder was gray-400 */
/* v4: placeholder is current text color at 50% opacity */

/* If you want specific color: */
<input className="placeholder:text-gray-400" />
```

### Button Cursor
```css
/* v3: buttons had cursor-pointer by default */
/* v4: buttons have cursor-default (browser native) */

/* If you want pointer cursor: */
<button className="cursor-pointer">Click me</button>
```

---

## 7. CSS Variables in Arbitrary Values

### New Syntax (v4)

```tsx
// v3 (WRONG in v4)
<div className="bg-[--brand-color]" />

// v4 (CORRECT)
<div className="bg-(--brand-color)" />
```

**Rule**: Use parentheses `()` instead of brackets `[]` for CSS variables.

### With Fallback

```tsx
<div className="bg-(--brand-color,#3b82f6)" />
```

---

## 8. Grid Syntax Change

### Commas → Underscores

```tsx
// v3 (WRONG in v4)
<div className="grid-cols-[max-content,auto,1fr]" />

// v4 (CORRECT)
<div className="grid-cols-[max-content_auto_1fr]" />
```

---

## 9. Variant Stacking Order

### Order Reversed

```tsx
// v3: right-to-left (inner first)
<div className="first:*:pt-0" />  // WRONG in v4

// v4: left-to-right (outer first)
<div className="*:first:pt-0" />  // CORRECT
```

---

## 10. Important Modifier

### Position Changed

```tsx
// v3: ! at beginning
<div className="!flex" />  // Still works

// v4: ! at end (preferred)
<div className="flex!" />  // New style
```

Both work, but v4 prefers suffix style.

---

## 11. Custom Utilities

### Use @utility Instead of @layer

```css
/* v3 (doesn't support variants properly in v4) */
@layer utilities {
  .custom-scrollbar { ... }
}

/* v4 (CORRECT) */
@utility custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: theme(--color-gray-400) transparent;
}
```

Now `hover:custom-scrollbar`, `dark:custom-scrollbar` work.

---

## 12. Transform Utilities

### Individual Properties Now

```tsx
// v3: needed transform class as base
<div className="transform rotate-45 scale-110" />

// v4: transform is implicit
<div className="rotate-45 scale-110" />

// Reset transforms
<div className="rotate-none scale-none" />  // NOT transform-none
```

---

## 13. shadcn/ui Compatibility

shadcn/ui is compatible with Tailwind v4. The CSS variables pattern works:

```css
@import "tailwindcss";

@theme {
  /* shadcn color system */
  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(222.2 84% 4.9%);
  --color-primary: hsl(222.2 47.4% 11.2%);
  --color-primary-foreground: hsl(210 40% 98%);
  /* ... etc */
}
```

**Note**: When using `shadcn@latest init`, it will set up Tailwind v4 configuration automatically.

---

## 14. What NOT to Create

**DO NOT create these files for Tailwind v4:**

- ❌ `tailwind.config.js` - Not needed
- ❌ `tailwind.config.ts` - Not needed
- ❌ Any JavaScript config file for Tailwind

**Configuration lives in CSS only via `@theme` and `@import`.**

---

## 15. Browser Support

Tailwind v4 requires modern browsers:
- Safari 16.4+
- Chrome 111+
- Firefox 128+

Uses CSS features like `@property` and `color-mix()` that older browsers don't support.

---

## 16. Quick Reference: Common Patterns

### Basic Page Layout

```tsx
export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-semibold">Title</h1>
      </header>
      <main className="container mx-auto px-4 py-8">
        {/* Content */}
      </main>
    </div>
  )
}
```

### Card Component

```tsx
<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
  <h2 className="text-lg font-medium">Card Title</h2>
  <p className="mt-2 text-gray-600">Card content</p>
</div>
```

### Form Input

```tsx
<input
  type="text"
  className="w-full rounded-md border border-gray-300 px-3 py-2
             placeholder:text-gray-400
             focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
  placeholder="Enter text..."
/>
```

### Button States

```tsx
<button className="rounded-md bg-blue-600 px-4 py-2 text-white
                   cursor-pointer
                   hover:bg-blue-700
                   active:bg-blue-800
                   disabled:cursor-not-allowed disabled:opacity-50">
  Click me
</button>
```

### Split Layout (50/50)

```tsx
<div className="flex h-screen">
  <div className="w-1/2 border-r border-gray-200 p-6 overflow-y-auto">
    {/* Left panel */}
  </div>
  <div className="w-1/2 p-6 overflow-y-auto">
    {/* Right panel */}
  </div>
</div>
```

---

## 17. Debugging Tips

### Classes Not Working?

1. **Check for renamed utilities** (shadow-sm → shadow-xs, etc.)
2. **Check opacity syntax** (bg-opacity-50 → bg-black/50)
3. **Check CSS variable syntax** (bg-[--var] → bg-(--var))
4. **Check variant order** (first:*: → *:first:)

### PostCSS Errors?

Make sure you're using `@tailwindcss/postcss`, not `tailwindcss` directly.

### Config Not Working?

There is no config file. Use `@theme` in your CSS file.
