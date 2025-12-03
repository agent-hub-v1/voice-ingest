# shadcn/ui Quick Reference

Synthesized documentation for shadcn/ui component library with Next.js integration.

---

## 1. Overview

shadcn/ui is a collection of beautifully-designed, accessible components. Key characteristics:

- **Not a package** - Components are copied into your project
- **Customizable** - You own the code, modify as needed
- **Tailwind CSS** - Built on Tailwind for styling
- **Radix UI** - Uses Radix primitives for accessibility
- **CLI tool** - Easy component installation

---

## 2. Installation (Next.js)

### Initialize Project

```bash
pnpm dlx shadcn@latest init
```

Alternative package managers:
```bash
npm dlx shadcn@latest init
yarn dlx shadcn@latest init
bun dlx shadcn@latest init
```

### Init Options

| Flag | Description |
|------|-------------|
| `-y, --yes` | Skip confirmation prompts |
| `-f, --force` | Overwrite existing config |
| `--css-variables` | Use CSS variables (default: true) |
| `-b, --base-color` | Base color: neutral, gray, zinc, stone, slate |

### Add Components

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card input textarea
pnpm dlx shadcn@latest add -a  # Add all components
```

### Add Options

| Flag | Description |
|------|-------------|
| `-y, --yes` | Skip confirmation |
| `-o, --overwrite` | Overwrite existing files |
| `-a, --all` | Add all components |

---

## 3. Project Structure

After initialization, shadcn/ui creates:

```
your-project/
├── components/
│   └── ui/           # shadcn components go here
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
├── lib/
│   └── utils.ts      # cn() utility function
├── components.json   # shadcn configuration
└── app/
    └── globals.css   # CSS variables for theming
```

### Import Pattern

```typescript
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
```

---

## 4. components.json Configuration

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "rsc": true,
  "tsx": true,
  "aliases": {
    "utils": "@/lib/utils",
    "components": "@/components",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### Key Settings

| Field | Description |
|-------|-------------|
| `style` | Visual style (new-york) - cannot change after init |
| `tailwind.cssVariables` | Use CSS vars for theming - cannot change after init |
| `tailwind.baseColor` | Color palette base - cannot change after init |
| `rsc` | React Server Components (adds "use client") |
| `tsx` | Use TypeScript |
| `aliases` | Path aliases (must match tsconfig) |

---

## 5. The cn() Utility

The `cn()` function merges Tailwind classes intelligently:

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Usage

```typescript
import { cn } from "@/lib/utils"

// Merge conditional classes
<div className={cn(
  "base-class",
  isActive && "active-class",
  variant === "large" && "text-lg"
)} />

// Override Tailwind classes properly
<Button className={cn("bg-red-500")} />  // Overrides default bg
```

---

## 6. Theming (CSS Variables)

### Default Variables

Located in `app/globals.css`:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    /* ... dark mode values */
  }
}
```

### Using Theme Colors

```typescript
// Background/foreground pattern
<div className="bg-background text-foreground" />
<div className="bg-primary text-primary-foreground" />
<div className="bg-muted text-muted-foreground" />
<div className="bg-card text-card-foreground" />
<div className="bg-destructive text-destructive-foreground" />
```

---

## 7. Dark Mode Setup (Next.js)

### Install next-themes

```bash
pnpm add next-themes
```

### Create ThemeProvider

```typescript
// components/theme-provider.tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

### Add to Root Layout

```typescript
// app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Theme Toggle Component

```typescript
// components/mode-toggle.tsx
"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-4 w-4 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

## 8. Core Components Reference

### Button

```bash
pnpm dlx shadcn@latest add button
```

```typescript
import { Button } from "@/components/ui/button"

// Variants: default, outline, secondary, ghost, destructive, link
<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="link">Link</Button>

// Sizes: default, sm, lg, icon
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// With icon
<Button>
  <IconName className="mr-2 h-4 w-4" />
  With Icon
</Button>

// Loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading
</Button>
```

### Card

```bash
pnpm dlx shadcn@latest add card
```

```typescript
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

<Card className="w-[350px]">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">Cancel</Button>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

### Input

```bash
pnpm dlx shadcn@latest add input
```

```typescript
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Basic
<Input type="email" placeholder="Email" />

// With label
<div className="grid w-full max-w-sm gap-1.5">
  <Label htmlFor="email">Email</Label>
  <Input type="email" id="email" placeholder="Email" />
</div>

// Disabled
<Input disabled placeholder="Disabled" />

// File input
<Input type="file" />
```

### Textarea

```bash
pnpm dlx shadcn@latest add textarea
```

```typescript
import { Textarea } from "@/components/ui/textarea"

<Textarea placeholder="Type your message here." />

// With label
<div className="grid w-full gap-1.5">
  <Label htmlFor="message">Message</Label>
  <Textarea id="message" placeholder="Type here..." />
</div>
```

### Select

```bash
pnpm dlx shadcn@latest add select
```

```typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>

// Controlled
const [value, setValue] = useState("")

<Select value={value} onValueChange={setValue}>
  ...
</Select>
```

### Label

```bash
pnpm dlx shadcn@latest add label
```

```typescript
import { Label } from "@/components/ui/label"

<Label htmlFor="input-id">Label Text</Label>
```

### Badge

```bash
pnpm dlx shadcn@latest add badge
```

```typescript
import { Badge } from "@/components/ui/badge"

// Variants: default, secondary, destructive, outline
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

### Dialog (Modal)

```bash
pnpm dlx shadcn@latest add dialog
```

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open Dialog</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Description text for the dialog.
      </DialogDescription>
    </DialogHeader>
    <div className="py-4">
      {/* Dialog content */}
    </div>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button type="submit">Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Controlled dialog
const [open, setOpen] = useState(false)

<Dialog open={open} onOpenChange={setOpen}>
  ...
</Dialog>
```

### DropdownMenu

```bash
pnpm dlx shadcn@latest add dropdown-menu
```

```typescript
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent className="w-56">
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### ScrollArea

```bash
pnpm dlx shadcn@latest add scroll-area
```

```typescript
import { ScrollArea } from "@/components/ui/scroll-area"

<ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
  {/* Scrollable content */}
  {items.map((item) => (
    <div key={item.id}>{item.name}</div>
  ))}
</ScrollArea>

// Horizontal scrolling
<ScrollArea className="w-96 whitespace-nowrap">
  <div className="flex space-x-4">
    {items.map((item) => (
      <div key={item.id}>{item.name}</div>
    ))}
  </div>
  <ScrollBar orientation="horizontal" />
</ScrollArea>
```

---

## 9. Form Integration (React Hook Form + Zod)

```bash
pnpm dlx shadcn@latest add form
pnpm add zod
```

### Basic Form Pattern

```typescript
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

// 1. Define schema
const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
})

// 2. Create component
export function ProfileForm() {
  // 3. Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  })

  // 4. Handle submit
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  // 5. Render form
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                Your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### Form with Select

```typescript
<FormField
  control={form.control}
  name="role"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Role</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="user">User</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Form with Textarea

```typescript
<FormField
  control={form.control}
  name="bio"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Bio</FormLabel>
      <FormControl>
        <Textarea
          placeholder="Tell us about yourself"
          className="resize-none"
          {...field}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## 10. Components for Voice-Ingest App

Install these components for the transcription app:

```bash
pnpm dlx shadcn@latest add button card input textarea select label badge dialog dropdown-menu scroll-area form separator
```

### Suggested Layout Pattern

```typescript
// Split-screen layout
<div className="flex h-screen">
  {/* Left Panel - Form */}
  <div className="w-1/2 border-r p-6 overflow-y-auto">
    <Card>
      <CardHeader>
        <CardTitle>Transcription Details</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Form fields */}
      </CardContent>
    </Card>
  </div>

  {/* Right Panel - Transcript */}
  <div className="w-1/2 p-6">
    <ScrollArea className="h-full">
      <Textarea
        className="min-h-[500px] resize-none"
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
      />
    </ScrollArea>
  </div>
</div>
```

---

## 11. CLI Commands Reference

| Command | Description |
|---------|-------------|
| `shadcn@latest init` | Initialize project |
| `shadcn@latest add [component]` | Add component(s) |
| `shadcn@latest add -a` | Add all components |
| `shadcn@latest view [component]` | Preview component |
| `shadcn@latest search` | Search components |

---

## 12. Common Patterns

### Loading Button

```typescript
const [isLoading, setIsLoading] = useState(false)

<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? "Processing..." : "Submit"}
</Button>
```

### Conditional Styling

```typescript
<Button
  variant={isActive ? "default" : "outline"}
  className={cn(
    "transition-all",
    isActive && "ring-2 ring-primary"
  )}
>
  Toggle
</Button>
```

### Responsive Layout

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <Card>Left on mobile, side-by-side on desktop</Card>
  <Card>Right on mobile, side-by-side on desktop</Card>
</div>
```

---

## 13. Icon Library

shadcn/ui commonly uses **Lucide React** for icons:

```bash
pnpm add lucide-react
```

```typescript
import { Loader2, Check, X, ChevronDown, Settings } from "lucide-react"

<Button>
  <Settings className="mr-2 h-4 w-4" />
  Settings
</Button>
```

Common icons for voice-ingest:
- `Loader2` - Loading spinner
- `Check` - Success/complete
- `X` - Close/cancel
- `Play` - Play audio
- `Pause` - Pause audio
- `Upload` - Upload file
- `FileAudio` - Audio file
- `User` - Speaker
- `Mic` - Microphone
- `Settings` - Settings
- `Download` - Export/download
