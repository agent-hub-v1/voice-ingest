# Symbiont Voice Ingest - Technical Specification

Voice memo transcription app for ingesting audio recordings into the Symbiont system as structured markdown files.

---

## Overview

**Purpose**: Transcribe voice memos recorded on phone, review/edit transcriptions, and export structured markdown files for Symbiont integration.

**User**: Single user (Richard), privately hosted.

**Constraint**: All services 100% free tier.

**Flow**: Phone recording → Google Drive → Web app transcription → Markdown export → Linux sync via rclone.

---

## Tech Stack

| Component | Technology | Notes |
|-----------|------------|-------|
| Framework | Next.js 14+ (App Router) | React Server Components, API routes |
| Hosting | Vercel free tier | 100GB bandwidth, 100k function invocations/month |
| UI | shadcn/ui + Tailwind CSS | Accessible, customizable components |
| Transcription | AssemblyAI | 185 hours/account free, speaker diarization included |
| File Storage | Google Drive API | Source audio, processed files, verified exports |
| AI Cleaning | OpenRouter API | Free models only for text processing |
| Local Sync | rclone | Linux daemon syncs verified folder to local path |

---

## User Flow

1. Record voice memo on phone, save to Google Drive `unprocessed/` folder
2. Open web app, view list of unprocessed audio files
3. Select file → trigger AssemblyAI transcription with speaker labels
4. Split-screen editor appears:
   - LEFT: Frontmatter form, speaker mapping, AI tools, action buttons
   - RIGHT: Editable transcription text
5. Review transcript, map speakers to names, fill form fields, optionally apply AI cleaning
6. Click "Verify & Export" → generate markdown, move audio to `processed/` folder
7. rclone daemon on Linux syncs `verified/` folder to local symbiont directory

---

## UI Layout

### State 1: File Selection

Single-column list view:

| Column | Content |
|--------|---------|
| File Name | Audio file name |
| Size | File size in MB |
| Created | Date/time created |
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
│ [Preview Markdown] [Verify & Export]│
│ [Discard]                           │
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

### `/api/auth/google`
Google OAuth flow for Drive access. Handles token storage and refresh.

### `/api/drive/list`
**GET** - Returns array of files in `unprocessed/` folder.

Response:
```json
{
  "files": [
    {
      "id": "drive_file_id",
      "name": "voice_memo_20250115.m4a",
      "size": 4521984,
      "createdTime": "2025-01-15T14:30:00Z"
    }
  ]
}
```

### `/api/drive/move`
**POST** - Moves file between folders.

Request:
```json
{
  "fileId": "drive_file_id",
  "from": "unprocessed",
  "to": "processed"
}
```

### `/api/transcribe`
**POST** - Submits audio to AssemblyAI, returns transcript with speaker labels.

Request:
```json
{
  "fileId": "drive_file_id"
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
  "mode": "filler",  // or "clarity"
  "model": "meta-llama/llama-3-8b-instruct:free"
}
```

**Mode behaviors**:
- `filler`: Remove only filler words (um, uh, like, you know, repeated words, false starts). NO rewording, NO consolidation, NO meaning changes.
- `clarity`: Rewrite for clarity while preserving meaning.

### `/api/export`
**POST** - Generates markdown file, saves to `verified/` folder.

Request:
```json
{
  "frontmatter": { ... },
  "transcript": "Formatted transcript text..."
}
```

---

## OpenRouter Integration

**Constraints**: Free models only.

**Model Selection**: Dropdown populated from OpenRouter's free model list. Candidates:
- `meta-llama/llama-3-8b-instruct:free`
- `mistralai/mistral-7b-instruct:free`
- `google/gemma-7b-it:free`

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

## Google Drive Folder Structure

```
Symbiont Voice Ingest/
├── unprocessed/     # Phone saves voice memos here
├── processed/       # Audio moved here after verification
└── verified/        # Markdown files ready for Linux sync
```

---

## Linux Sync Setup

**rclone configuration**:
```bash
rclone config
# Create remote named "gdrive" with Google Drive access
# Scope: drive (full access) or drive.file (app-created only)
```

**Sync command**:
```bash
rclone sync gdrive:"Symbiont Voice Ingest/verified" ~/symbiont/data/voice-transcripts/ \
  --drive-acknowledge-abuse \
  --verbose
```

**Systemd timer** (`~/.config/systemd/user/voice-sync.timer`):
```ini
[Unit]
Description=Sync voice transcripts from Google Drive

[Timer]
OnBootSec=5min
OnUnitActiveSec=10min

[Install]
WantedBy=timers.target
```

**Target path**: `~/symbiont/data/voice-transcripts/` (configurable via environment)

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
| Vercel | 100GB bandwidth, 100k invocations | Sufficient for single user |
| AssemblyAI | 185 hours/account | Rotate accounts if needed (10 accounts = 1850 hours) |
| Google Drive | 15GB/account | Archive processed audio periodically |
| OpenRouter | Model-dependent | Use lightweight models, minimal calls |

---

## Environment Variables

```bash
# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://your-app.vercel.app/api/auth/google/callback

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
| AssemblyAI failure | Display error message, allow retry |
| Google auth expiry | Prompt re-authentication |
| OpenRouter failure | Display error, text remains unchanged |
| Network issues | Preserve local state, allow retry |
| Invalid audio format | Display supported formats, reject file |

---

## Implementation Notes

### AssemblyAI Integration

Request transcription with speaker diarization:
```javascript
const transcript = await client.transcripts.transcribe({
  audio_url: driveFileUrl,
  speaker_labels: true
});
```

Poll for completion, then retrieve utterances with speaker labels.

### Google Drive Authentication

Use `googleapis` package with OAuth2 client. Store refresh token securely (encrypted in Vercel environment or user's browser via httpOnly cookie).

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
