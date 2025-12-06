# Supadata API Quick Reference

Synthesized documentation for Supadata YouTube transcript extraction API.

---

## 1. Overview

Supadata provides transcript extraction from YouTube (and other platforms) via REST API. Key features for voice-ingest:

- **YouTube transcript extraction** - native captions or AI-generated
- **Video metadata** - title, description, channel info
- **Batch operations** - multiple videos at once
- **Translation** - translate transcripts to other languages

**Free Tier**: 100 requests/month

---

## 2. API Endpoints

**Base URL**: `https://api.supadata.ai/v1`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/transcript` | GET | Get transcript from video URL |
| `/transcript/{jobId}` | GET | Get async job results |
| `/youtube/transcript` | GET | YouTube-specific transcript |
| `/youtube/transcript/translate` | GET | Translate transcript |
| `/youtube/transcript/batch` | POST | Batch transcript job |
| `/youtube/video` | GET | Video metadata |
| `/youtube/channel` | GET | Channel metadata |
| `/me` | GET | Account info and credits |

### Authentication

All requests require `x-api-key` header:

```
x-api-key: YOUR_API_KEY
```

Get your API key from [dash.supadata.ai](https://dash.supadata.ai)

---

## 3. Get Transcript (Primary Endpoint)

### Request

```
GET https://api.supadata.ai/v1/transcript?url={encoded_url}
x-api-key: YOUR_API_KEY
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | YouTube video URL (URL-encoded) |
| `lang` | string | No | Language code (e.g., "en", "es") |
| `text` | boolean | No | Return plain text only (no timestamps) |
| `mode` | string | No | `native`, `auto`, or `generate` |
| `chunkSize` | number | No | Split transcript into chunks |

### Mode Options

- `native` - Only return existing captions/subtitles
- `auto` - Try native first, fallback to AI-generated
- `generate` - Force AI-generated transcript

### Response (200 - Immediate)

```json
{
  "content": [
    {
      "text": "Hello and welcome to this video",
      "start": 0.0,
      "end": 2.5
    },
    {
      "text": "Today we're going to discuss...",
      "start": 2.5,
      "end": 5.0
    }
  ],
  "lang": "en",
  "availableLangs": ["en", "es", "fr"]
}
```

### Response (202 - Async Processing)

```json
{
  "jobId": "job_abc123",
  "status": "queued"
}
```

When you get 202, poll `/transcript/{jobId}` for results.

---

## 4. Poll Async Job

### Request

```
GET https://api.supadata.ai/v1/transcript/{jobId}
x-api-key: YOUR_API_KEY
```

### Response

```json
{
  "status": "completed",
  "content": [...],
  "lang": "en"
}
```

### Status Values

| Status | Meaning |
|--------|---------|
| `queued` | Job waiting to process |
| `active` | Processing in progress |
| `completed` | Done - results available |
| `failed` | Error occurred |

---

## 5. YouTube Video Metadata

### Request

```
GET https://api.supadata.ai/v1/youtube/video?url={encoded_url}
x-api-key: YOUR_API_KEY
```

### Response

```json
{
  "id": "dQw4w9WgXcQ",
  "title": "Video Title",
  "description": "Video description...",
  "channel": {
    "id": "UC...",
    "name": "Channel Name"
  },
  "duration": 212,
  "publishedAt": "2024-01-15T10:00:00Z",
  "viewCount": 1000000,
  "likeCount": 50000
}
```

---

## 6. JavaScript SDK

### Installation

```bash
npm install @supadata/js
# or
pnpm add @supadata/js
```

### Initialization

```typescript
import { Supadata } from '@supadata/js'

const supadata = new Supadata({
  apiKey: process.env.SUPADATA_API_KEY!
})
```

### Get Transcript

```typescript
// Simple usage
const result = await supadata.transcript({
  url: 'https://www.youtube.com/watch?v=VIDEO_ID'
})

console.log(result.content) // Array of { text, start, end }
console.log(result.lang)    // Language code
```

### With Options

```typescript
const result = await supadata.transcript({
  url: 'https://www.youtube.com/watch?v=VIDEO_ID',
  lang: 'en',      // Preferred language
  text: true,      // Plain text only (no timestamps)
  mode: 'auto'     // Try native, fallback to AI
})
```

### YouTube-Specific Methods

```typescript
// Get transcript (YouTube-specific)
const transcript = await supadata.youtube.transcript({
  url: 'https://www.youtube.com/watch?v=VIDEO_ID'
})

// Get video metadata
const video = await supadata.youtube.video({
  url: 'https://www.youtube.com/watch?v=VIDEO_ID'
})

// Get channel info
const channel = await supadata.youtube.channel({
  url: 'https://www.youtube.com/channel/CHANNEL_ID'
})
```

### Error Handling

```typescript
import { Supadata, SupadataError } from '@supadata/js'

try {
  const result = await supadata.transcript({ url: videoUrl })
  return result
} catch (error) {
  if (error instanceof SupadataError) {
    console.error('Supadata error:', error.message)
    console.error('Error code:', error.code)
  }
  throw error
}
```

---

## 7. MCP Server Integration

Supadata provides an MCP (Model Context Protocol) server for AI assistants.

### Installation

```bash
npx -y @supadata/mcp
```

### Configuration (Claude Desktop)

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "supadata": {
      "command": "npx",
      "args": ["-y", "@supadata/mcp"],
      "env": {
        "SUPADATA_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Available MCP Tools

Once configured, the MCP server provides tools for:
- Fetching transcripts from YouTube URLs
- Getting video metadata
- Web scraping and crawling

---

## 8. Complete Integration Example

### Next.js API Route

```typescript
// app/api/youtube-transcript/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Supadata } from '@supadata/js'

const supadata = new Supadata({
  apiKey: process.env.SUPADATA_API_KEY!
})

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Get transcript
    const result = await supadata.transcript({
      url,
      mode: 'auto'
    })

    // Format for display
    const formattedTranscript = result.content
      .map(segment => segment.text)
      .join(' ')

    return NextResponse.json({
      transcript: formattedTranscript,
      segments: result.content,
      language: result.lang,
      availableLanguages: result.availableLangs
    })

  } catch (error) {
    console.error('Transcript error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transcript' },
      { status: 500 }
    )
  }
}
```

### Client Component

```typescript
// components/youtube-input.tsx
'use client'

import { useState } from 'react'

export function YouTubeInput({ onTranscript }: {
  onTranscript: (text: string) => void
}) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/youtube-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch transcript')
      }

      const data = await response.json()
      onTranscript(data.transcript)
      setUrl('')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste YouTube URL..."
        disabled={loading}
      />
      <button type="submit" disabled={loading || !url}>
        {loading ? 'Loading...' : 'Get Transcript'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
```

---

## 9. HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success - immediate result |
| 202 | Accepted - async job created |
| 206 | Transcript unavailable |
| 400 | Invalid parameters |
| 401 | Missing/invalid API key |
| 402 | Payment required (credits exhausted) |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 5xx | Server error |

---

## 10. Error Response Format

```json
{
  "error": "error-code",
  "message": "Human readable message",
  "details": "Detailed explanation",
  "documentationUrl": "https://supadata.ai/errors/error-code"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `invalid-request` | Missing or invalid parameters |
| `unauthorized` | Invalid API key |
| `upgrade-required` | Need paid plan |
| `not-found` | Video not found |
| `limit-exceeded` | Rate limit hit |
| `transcript-unavailable` | No transcript available |
| `internal-error` | Server error |

---

## 11. Pricing & Credits

### Free Tier
- **100 requests/month**
- No credit card required

### Credit Usage
| Operation | Credits |
|-----------|---------|
| Metadata | 1 credit |
| Native transcript | 1 credit |
| AI-generated transcript | 2 credits/minute |
| Web scrape | 1 credit |
| Batch job | 1 credit + 1/item |

---

## 12. Supported Platforms

Beyond YouTube, Supadata also supports:
- TikTok
- Instagram
- Twitter/X
- Facebook
- Direct video file URLs (MP4, WEBM, MP3, etc.)

**Max file size**: 1GB

---

## 13. TypeScript Types

```typescript
// types/supadata.ts

export interface TranscriptSegment {
  text: string
  start: number
  end: number
}

export interface TranscriptResult {
  content: TranscriptSegment[]
  lang: string
  availableLangs?: string[]
}

export interface TranscriptOptions {
  url: string
  lang?: string
  text?: boolean
  mode?: 'native' | 'auto' | 'generate'
  chunkSize?: number
}

export interface AsyncJob {
  jobId: string
  status: 'queued' | 'active' | 'completed' | 'failed'
}

export interface VideoMetadata {
  id: string
  title: string
  description: string
  channel: {
    id: string
    name: string
  }
  duration: number
  publishedAt: string
  viewCount: number
  likeCount: number
}

export interface SupadataError {
  error: string
  message: string
  details?: string
  documentationUrl?: string
}
```

---

## 14. API Reference Quick Lookup

### Get Transcript

```
GET /v1/transcript?url={url}
x-api-key: {api_key}
```

### Get YouTube Transcript

```
GET /v1/youtube/transcript?url={url}
x-api-key: {api_key}
```

### Get Video Metadata

```
GET /v1/youtube/video?url={url}
x-api-key: {api_key}
```

### Poll Job Status

```
GET /v1/transcript/{jobId}
x-api-key: {api_key}
```

### Check Account

```
GET /v1/me
x-api-key: {api_key}
```

---

## 15. Environment Variables

```bash
# .env.local
SUPADATA_API_KEY=your_api_key_here
```

**Never commit API keys to version control.**
