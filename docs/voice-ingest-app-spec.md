# Symbiont Voice Ingest - Technical Specification

Voice memo transcription app for ingesting audio recordings into the Symbiont system as structured markdown files.

---

## Overview

**Purpose**: Transcribe voice memos recorded on iPhone, review/edit transcriptions, and export structured markdown files for Symbiont integration.

**User**: Single user (Richard), privately hosted.

**Constraint**: All services 100% free tier.

**Flow**: iPhone Voice Memo → iOS Shortcut → Vercel Blob → Web app transcription → Markdown export → Download to local machine.

---

## Tech Stack

| Component | Technology | Notes |
|-----------|------------|-------|
| Framework | Next.js 16 (App Router) | React Server Components, API routes |
| Hosting | Vercel free tier | 100GB bandwidth, 100k function invocations/month |
| File Storage | Vercel Blob | 1GB free tier, stores pending audio files |
| UI | shadcn/ui + Tailwind CSS v4 | Accessible, customizable components |
| Transcription | AssemblyAI | 185 hours/account free, speaker diarization included |
| AI Cleaning | OpenRouter API | Free models only for text processing |

---

## Architecture

### Audio Ingestion (iPhone → Vercel Blob)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  iPhone Voice   │     │  iOS Shortcut   │     │  Vercel Blob    │
│  Memos App      │ ──▶ │  (auto-trigger) │ ──▶ │  /api/ingest    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                                ┌─────────────────┐
                                                │  Pending Queue  │
                                                │  (Blob storage) │
                                                └─────────────────┘
```

**iOS Shortcut Setup**:
- Trigger: When new voice memo saved (or manual share)
- Action: HTTP POST to `https://your-app.vercel.app/api/ingest`
- Body: Audio file as multipart/form-data
- Headers: `Authorization: Bearer {INGEST_SECRET}`

### Processing Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Web App UI     │     │  AssemblyAI     │     │  OpenRouter     │
│  (file list)    │ ──▶ │  (transcribe)   │ ──▶ │  (AI cleaning)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                                               │
        ▼                                               ▼
┌─────────────────┐                           ┌─────────────────┐
│  Split-screen   │                           │  Markdown       │
│  Editor         │ ◀──────────────────────── │  Export         │
└─────────────────┘                           └─────────────────┘
```

---

## User Flow

1. Record voice memo on iPhone
2. iOS Shortcut automatically uploads to Vercel Blob (or manually trigger shortcut)
3. Open web app, view list of pending audio files
4. Select file → trigger AssemblyAI transcription with speaker labels
5. Split-screen editor appears:
   - LEFT: Frontmatter form, speaker mapping, AI tools, action buttons
   - RIGHT: Editable transcription text
6. Review transcript, map speakers to names, fill form fields, optionally apply AI cleaning
7. Click "Export" → download markdown file
8. Optionally delete audio from Blob after export

---

## UI Layout

### State 1: File Selection

Single-column list view:

| Column | Content |
|--------|---------|
| File Name | Audio file name |
| Size | File size in MB |
| Uploaded | Date/time uploaded |
| Status | pending / processing / ready |
| Action | "Transcribe" button |

### State 2: Transcription Editor (Split Screen)

**LEFT PANEL (50% width)**

```
┌─────────────────────────────────────┐
│ FRONTMATTER FORM                    │
├─────────────────────────────────────┤
│ Date/Time: [datetime picker]        │
│ Subject: [text input]               │
│ Summary: [textarea - 1 paragraph]   │
│ Tags: [tag input with suggestions]  │
│                                     │
│ Participants:                       │
│ ┌─────────────────────────────────┐ │
│ │ Name: [input] Contact: [select] │ │
│ │ [+ Add Participant]             │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ SPEAKER MAPPING                     │
├─────────────────────────────────────┤
│ Speaker A → [name dropdown/input]   │
│ Speaker B → [name dropdown/input]   │
│ [Apply Speaker Names]               │
├─────────────────────────────────────┤
│ AI TOOLS                            │
├─────────────────────────────────────┤
│ Model: [OpenRouter model selector]  │
│ [Remove Filler Words] (whole text)  │
│ [Clean Selected Text] (selection)   │
├─────────────────────────────────────┤
│ ACTIONS                             │
├─────────────────────────────────────┤
│ [Preview Markdown] [Export & Download]
│ [Delete Audio]                      │
└─────────────────────────────────────┘
```

**RIGHT PANEL (50% width)**

- Contenteditable div or textarea
- Format: `[Speaker Name]: text content`
- Supports direct text editing for transcription corrections
- Text selection enables "Clean Selected Text" button
- Updates in-place when speaker names applied
- Updates in-place when AI cleaning applied

---

## Frontmatter Schema

```yaml
---
type: voice_memo_transcript
date: 2025-01-15T14:30:00
participants:
  - name: Richard
    contact_id: richard-001  # optional, links to contacts
  - name: John Smith
    contact_id: null
subject: "Project planning discussion"
summary: "One paragraph context/summary written by user..."
tags: [business, planning]
source_audio: "voice_memo_20250115.m4a"
transcription_confidence: 0.94
processed_date: 2025-01-15T16:45:00
---
```

---

## API Routes

### `/api/ingest`
**POST** - Receives audio file from iOS Shortcut, stores in Vercel Blob.

Headers:
```
Authorization: Bearer {INGEST_SECRET}
Content-Type: multipart/form-data
```

Request: Audio file as form data

Response:
```json
{
  "success": true,
  "blobUrl": "https://...",
  "filename": "voice_memo_20250115.m4a"
}
```

### `/api/files`
**GET** - Returns array of pending audio files in Blob storage.

Response:
```json
{
  "files": [
    {
      "url": "https://blob.vercel-storage.com/...",
      "pathname": "voice_memo_20250115.m4a",
      "size": 4521984,
      "uploadedAt": "2025-01-15T14:30:00Z"
    }
  ]
}
```

### `/api/files/[pathname]`
**DELETE** - Deletes audio file from Blob storage after processing.

### `/api/transcribe`
**POST** - Submits audio to AssemblyAI, returns transcript with speaker labels.

Request:
```json
{
  "blobUrl": "https://blob.vercel-storage.com/..."
}
```

Response:
```json
{
  "text": "Full transcript text...",
  "utterances": [
    {
      "speaker": "A",
      "text": "Segment of speech...",
      "start": 0,
      "end": 5200,
      "confidence": 0.95
    }
  ],
  "confidence": 0.94
}
```

### `/api/clean-text`
**POST** - Sends text to OpenRouter for processing.

Request:
```json
{
  "text": "Text to process...",
  "mode": "filler",
  "model": "meta-llama/llama-3-8b-instruct:free"
}
```

**Mode behaviors**:
- `filler`: Remove only filler words (um, uh, like, you know, repeated words, false starts). NO rewording, NO consolidation, NO meaning changes.
- `clarity`: Rewrite for clarity while preserving meaning.

---

## OpenRouter Integration

**Constraints**: Free models only.

**Model Selection**: Automated scanner + manual overrides.

### Model Scanner (`src/lib/model-scanner.ts`)

On app startup:
1. Fetches all models from `https://openrouter.ai/api/v1/models`
2. Filters to free (`pricing.prompt === "0"`)
3. Scores by: parameter count, context length, provider quality bonus
4. Returns top models ranked by capability

### Configuration (`models.config.json`)

```json
{
  "preferred": ["x-ai/grok-4:free"],
  "blocked": [],
  "lastScan": { "timestamp": "...", "models": [...] }
}
```

- `preferred`: Manual overrides - shown first in dropdown
- `blocked`: Models to hide
- `lastScan`: 24-hour cache of scan results

### Workflow for Discovering Powerful Free Models

1. Check https://openrouter.ai/rankings for trending models
2. Test promising free models
3. Add winners to `models.config.json` → `preferred`

**System Prompts**:

Filler removal:
```
Remove ONLY filler words from this transcript. Remove: um, uh, er, ah, like,
you know, basically, so basically, I mean, kind of, sort of, repeated words,
false starts. Do NOT reword, consolidate, or change meaning. Preserve exact
phrasing except for filler removal. Return the cleaned text only.
```

Clarity rewrite:
```
Rewrite this text for clarity and readability. Preserve the original meaning
and speaker's voice. Fix grammatical issues. Return the improved text only.
```

---

## iOS Shortcut Setup

### Option A: Automatic (Recommended)

Create a Personal Automation:
1. Open Shortcuts app → Automation → + → Create Personal Automation
2. Trigger: "Voice Memos" → "New Recording"
3. Actions:
   - Get Latest Voice Memo
   - Get Contents of URL:
     - URL: `https://your-app.vercel.app/api/ingest`
     - Method: POST
     - Headers: `Authorization: Bearer {INGEST_SECRET}`
     - Request Body: File (the voice memo)
4. Disable "Ask Before Running"

### Option B: Manual Share

Create a regular Shortcut:
1. New Shortcut
2. Actions:
   - Receive: Audio files from Share Sheet
   - Get Contents of URL (same as above)
3. Use via Share button in Voice Memos app

---

## Contacts Integration

**Initial implementation**: JSON file at configurable path.

```json
{
  "contacts": [
    {
      "id": "richard-001",
      "name": "Richard",
      "aliases": ["Rich", "R"]
    },
    {
      "id": "john-smith-001",
      "name": "John Smith",
      "aliases": ["John", "JS"]
    }
  ]
}
```

**Usage**:
- Speaker mapping dropdown pulls from contacts list
- User can type new name (not in contacts)
- Participant contact_id links to contacts for future PostgreSQL integration

---

## Free Tier Constraints

| Service | Limit | Strategy |
|---------|-------|----------|
| Vercel Hosting | 100GB bandwidth, 100k invocations | Sufficient for single user |
| Vercel Blob | 1GB storage | Delete audio after export (~45 hours capacity) |
| AssemblyAI | 185 hours/account | Rotate accounts if needed |
| OpenRouter | Model-dependent | Use lightweight models, minimal calls |

---

## Environment Variables

```bash
# Vercel Blob (auto-configured when linked)
BLOB_READ_WRITE_TOKEN=

# Ingest authentication
INGEST_SECRET=your-secret-for-ios-shortcut

# AssemblyAI
ASSEMBLYAI_API_KEY=

# OpenRouter
OPENROUTER_API_KEY=

# Contacts source (path to JSON file or future DB connection string)
CONTACTS_SOURCE=/path/to/contacts.json
```

---

## File Output Format

**Naming convention**: `{date}_{subject_slug}.md`

Example: `2025-01-15_project-planning-discussion.md`

**Content structure**:
```markdown
---
type: voice_memo_transcript
date: 2025-01-15T14:30:00
participants:
  - name: Richard
    contact_id: richard-001
  - name: John Smith
    contact_id: null
subject: "Project planning discussion"
summary: "One paragraph context/summary written by user..."
tags: [business, planning]
source_audio: "voice_memo_20250115.m4a"
transcription_confidence: 0.94
processed_date: 2025-01-15T16:45:00
---

# Project planning discussion

**Participants**: Richard, John Smith
**Date**: January 15, 2025 at 2:30 PM
**Summary**: One paragraph context/summary written by user...

---

## Transcript

**Richard**: First segment of speech from Richard...

**John Smith**: Response from John...

**Richard**: Continuation of conversation...
```

---

## Error Handling

| Error | Behavior |
|-------|----------|
| Ingest auth failure | Return 401, iOS Shortcut shows error |
| AssemblyAI failure | Display error message, allow retry |
| OpenRouter failure | Display error, text remains unchanged |
| Network issues | Preserve local state, allow retry |
| Invalid audio format | Display supported formats, reject file |
| Blob storage full | Alert user to delete old files |

---

## Implementation Notes

### Vercel Blob Integration

```typescript
import { put, list, del } from '@vercel/blob';

// Upload
const blob = await put(filename, file, { access: 'public' });

// List
const { blobs } = await list();

// Delete
await del(blobUrl);
```

### AssemblyAI Integration

Request transcription with speaker diarization:
```typescript
const response = await fetch('https://api.assemblyai.com/v2/transcript', {
  method: 'POST',
  headers: {
    'Authorization': process.env.ASSEMBLYAI_API_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    audio_url: blobUrl,
    speaker_labels: true,
  }),
});
```

Poll for completion, then retrieve utterances with speaker labels.

### State Management

Client-side React state for editor. Consider Zustand for complex state if needed. Persist draft state to localStorage to prevent loss on accidental navigation.

---

## Out of Scope (Future Enhancements)

- Audio playback synced with transcript position
- Automatic speaker identification training
- Batch processing multiple files
- Direct PostgreSQL integration for contacts
- Mobile-responsive design (desktop-focused)
- Real-time collaboration
- Version history for transcripts
