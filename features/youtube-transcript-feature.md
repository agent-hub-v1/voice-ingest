# YouTube Transcript Feature with AI Chat & Timestamps

## Overview

Fetch YouTube transcripts with granular timestamps, display them in the app, then do Q&A in Claude Code where answers include clickable timestamp links that jump to specific moments in the video.

**Inspiration**: [Transcribr](https://www.transcribr.io/#extract) - chat with video transcripts, get timestamped video links in responses.

---

## Architecture Decision: Option C (Hybrid)

**App handles ingest + display. Claude Code handles Q&A.**

### Why Not In-App Chat?
- Free OpenRouter models are weak for nuanced Q&A
- Would need chat UI, history management, more code
- Token costs add up for each query

### Why Hybrid?
1. App's strength is *ingest* (fetching, storing, organizing)
2. Claude Code (Opus 4.5) gives better reasoning than free models
3. User is already in Claude Code for most work
4. Less code to build and maintain
5. Flexible - can generate multiple docs from one transcript

### Workflow
1. **In App**: Fetch YouTube transcript → Store with timestamps → Display → "Copy for AI" button
2. **In Claude Code**: Paste transcript → Ask questions → Get answers with timestamp footnotes → Export as markdown docs

---

## Decisions

- **Location**: File List - YouTube button next to existing "+" button
- **Naming**: Auto from video title with edit option
- **Timestamps**: Preserve granular segment timestamps from Supadata API
- **AI Chat**: Done in Claude Code (not in-app) for better quality answers

---

## Core Concept

### Timestamp Links

YouTube supports deep-linking to specific times:
```
https://www.youtube.com/watch?v=VIDEO_ID&t=125s  (125 seconds)
https://youtu.be/VIDEO_ID?t=125
```

When the LLM references part of the transcript, we can generate clickable links:
```markdown
The speaker discusses this at [2:05](https://youtube.com/watch?v=abc123&t=125s)
```

### Granular Timestamps (IMPORTANT)

Supadata returns **caption-level segments**, NOT video chapters. A 10-minute video typically has 100+ segments, each 2-5 seconds long with precise timestamps:

```json
{
  "content": [
    { "text": "Hello and welcome", "start": 0.0, "end": 2.5 },
    { "text": "Today we're going to discuss...", "start": 2.5, "end": 5.0 },
    { "text": "The first thing you need to know", "start": 5.0, "end": 7.2 }
  ]
}
```

This granularity allows the LLM to cite **exact moments** (e.g., `7:19`, `9:50`) rather than broad chapter ranges. The precision comes from having every caption chunk timestamped.

### Data Structure

Store transcript with timestamps:
```typescript
interface YouTubeTranscript {
  type: 'youtube'
  videoId: string
  videoUrl: string
  videoTitle: string
  segments: Array<{
    text: string
    start: number  // seconds (granular, every 2-5 sec)
    end: number    // seconds
  }>
  fullText: string  // joined for display/editing
  confidence: number
  fetchedAt: string
}
```

---

## Implementation Plan

### Step 1: Add Supadata SDK
```bash
pnpm add @supadata/js
```

### Step 2: Create API Route: `app/api/youtube-transcript/route.ts`
- Fetch transcript WITH timestamps (don't use `text: true`)
- Fetch video metadata (title, videoId)
- Store segments array with start/end times
- Create file in Vercel Blob

### Step 3: Update File List Component
- Add YouTube button + dialog
- Two-step: Paste URL → Fetch → Edit name → Create

### Step 4: Update Transcript Display
- Store `segments` in transcript JSON
- Display with timestamps visible: `[0:00] Hello and welcome...`
- YouTube files get special "youtube" type badge (red, with YouTube icon)

### Step 5: Add "Copy for AI" Button
- Formats transcript optimally for pasting into Claude Code
- Includes video URL, title, and timestamped segments
- Format:
  ```
  VIDEO: [Title](https://youtube.com/watch?v=xyz)

  TRANSCRIPT:
  [0:00] Hello and welcome to this video...
  [0:05] Today we're going to discuss...
  [7:19] Don't overthink. A common mistake founders make is...
  ```

### Step 6: Claude Code Q&A Workflow (No App Changes Needed)

When user pastes transcript into Claude Code:
1. Claude answers questions with timestamp references
2. Uses markdown links: `[7:19](https://youtube.com/watch?v=xyz&t=439s)`
3. User can export answers as markdown docs
4. Can ask multiple questions, generate multiple docs from one video

---

## File Changes Summary

| File | Change |
|------|--------|
| `package.json` | Add `@supadata/js` |
| `app/api/youtube-transcript/route.ts` | NEW - fetch transcript + metadata |
| `components/file-list.tsx` | Add YouTube button + dialog |
| `components/transcript-panel.tsx` | Add "Copy for AI" button, timestamp display |
| `hooks/use-transcription.ts` | Handle YouTube transcript type |
| `.env.local` / `.env.example` | Add `SUPADATA_API_KEY` |

---

## UX Flow

### In-App: Ingest Flow
1. Click YouTube button (red icon) → Dialog opens
2. Paste URL → Click "Fetch" → Loading...
3. Video title auto-fills name (editable)
4. Click "Create" → File created with timestamp data
5. File opens in editor with timestamps visible

### In-App: Copy for AI
1. Open YouTube transcript file
2. See transcript with timestamps: `[0:00] Hello...`, `[0:05] Today...`
3. Click "Copy for AI" button
4. Formatted transcript copied to clipboard

### In Claude Code: Q&A
1. Paste transcript into Claude Code
2. Ask: "What are the main points discussed?"
3. Claude answers with timestamp links: `discussed at [7:19](https://youtube.com/watch?v=xyz&t=439s)`
4. Copy answer → Save as markdown doc
5. Ask more questions → Generate more docs

---

## Example Interaction (In Claude Code)

**User pastes transcript, then asks**: "What are the most common YC application mistakes?"

**Claude Response**:
> Here are the most common mistakes founders make in YC applications:
>
> 1. **Overthinking the application** - discussed at [7:19](https://youtube.com/watch?v=abc&t=439s) where they explain that delaying submission to perfect every detail hurts more than helps
>
> 2. **Not following directions** - at [9:50](https://youtube.com/watch?v=abc&t=590s), YC evaluates if you can follow simple instructions as a proxy for attention to detail
>
> 3. **Writing too much** - starting at [10:20](https://youtube.com/watch?v=abc&t=620s), they emphasize concise writing over length
>
> 4. **Misrepresenting facts** - at [14:47](https://youtube.com/watch?v=abc&t=887s), any misleading information is automatic disqualification

The user can then copy this response as a markdown doc with working timestamp links.

---

## Technical Notes

### Timestamp Formatting
```typescript
function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function generateYouTubeLink(videoId: string, seconds: number): string {
  return `https://youtube.com/watch?v=${videoId}&t=${Math.floor(seconds)}s`
}
```

### Segment Context for LLM
```typescript
function buildTranscriptContext(segments: Segment[]): string {
  return segments.map(s =>
    `[${formatTimestamp(s.start)}] ${s.text}`
  ).join('\n')
}
```

---

## Rate Limiting Considerations

- Supadata: 100 requests/month (free tier)
  - 1 request per video fetch (transcript + metadata)
  - Transcripts are cached in Vercel Blob - no re-fetch needed

- Claude Code: Uses your existing Claude subscription
  - No additional API costs
  - Better quality than free OpenRouter models

---

## Future Enhancements

- Video thumbnail preview in dialog
- Batch import from playlist
- MCP tool for fetching transcripts directly in Claude Code
- Embedded video player with synced transcript highlighting
