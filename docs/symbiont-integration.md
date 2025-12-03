# Symbiont Integration Context

**FOR VOICE-INGEST AGENT ONLY** — Minimal context needed to integrate with Symbiont system.

---

## What This App Does

Voice-ingest transcribes voice memos and outputs structured markdown files that sync to Symbiont's data directory. Symbiont then processes these files into its PostgreSQL substrate.

**Your job**: Produce markdown files with correct frontmatter. Symbiont handles the rest.

---

## Output Location

Markdown files sync to: `~/symbiont/data/voice-transcripts/`

The sync is handled by rclone on the Linux machine (not your concern). You write to Google Drive's `verified/` folder.

---

## Frontmatter Schema

This is the EXACT format Symbiont expects for voice memo transcripts:

```yaml
---
type: voice_memo_transcript
date: 2025-01-15T14:30:00          # ISO 8601, when recording was made
participants:
  - name: Richard                   # Required: display name
    contact_id: richard-001         # Optional: links to Symbiont contacts table
  - name: John Smith
    contact_id: null                # null if not in contacts
subject: "Project planning discussion"
summary: "One paragraph context/summary written by user..."
tags: [business, planning]          # User-selected tags
source_audio: "voice_memo_20250115.m4a"
transcription_confidence: 0.94      # From AssemblyAI (0-1)
processed_date: 2025-01-15T16:45:00 # When user verified/exported
---
```

### Field Details

| Field | Required | Source | Notes |
|-------|----------|--------|-------|
| `type` | Yes | Static | Always `voice_memo_transcript` |
| `date` | Yes | Audio file metadata | When recording was made |
| `participants` | Yes | User input | At least one participant |
| `participants[].name` | Yes | User input | Display name |
| `participants[].contact_id` | No | User selection | From contacts JSON, null if not found |
| `subject` | Yes | User input | Brief title |
| `summary` | Yes | User input | 1-2 sentence context |
| `tags` | No | User input | Array of strings |
| `source_audio` | Yes | System | Original filename |
| `transcription_confidence` | Yes | AssemblyAI | Overall confidence score |
| `processed_date` | Yes | System | When exported |

---

## Contacts Integration

Contacts are stored in a JSON file that this app reads for speaker mapping.

### Contacts JSON Format

Location: Configurable via `CONTACTS_SOURCE` env var. Default: `~/symbiont/data/contacts.json`

```json
{
  "contacts": [
    {
      "id": "richard-001",
      "name": "Richard",
      "relationship_type": "self",
      "aliases": ["Rich", "R"]
    },
    {
      "id": "rebeca-001",
      "name": "Rebeca",
      "relationship_type": "spouse",
      "aliases": ["Bec", "Wife"]
    },
    {
      "id": "john-smith-001",
      "name": "John Smith",
      "relationship_type": "client",
      "aliases": ["John", "JS"]
    }
  ]
}
```

### Usage in Voice-Ingest

1. When user maps "Speaker A" to a name, show dropdown with contacts + option to type custom
2. If user selects from contacts, populate `contact_id` in frontmatter
3. If user types custom name, set `contact_id: null`
4. Aliases help with fuzzy matching (optional enhancement)

### Relationship Types (for reference)

These are the standard relationship types in Symbiont:
- `self` - Richard himself
- `spouse` - Wife (Rebeca)
- `child` - Children
- `parent` - Parents
- `sibling` - Siblings
- `friend` - Close friends
- `client` - Business clients
- `vendor` - Service providers
- `colleague` - Work colleagues
- `community` - Church, neighborhood
- `professional` - Mentors, advisors

---

## Markdown Body Format

After frontmatter, the transcript body follows this structure:

```markdown
---
[frontmatter]
---

# {Subject}

**Participants**: Richard, John Smith
**Date**: January 15, 2025 at 2:30 PM
**Summary**: {summary text}

---

## Transcript

**Richard**: First segment of speech from Richard...

**John Smith**: Response from John...

**Richard**: Continuation of conversation...
```

### Formatting Rules

1. **Speaker labels**: Bold with colon, e.g., `**Richard**:`
2. **Paragraphs**: Each speaker turn is its own paragraph (blank line between)
3. **No timestamps**: Don't include timestamps in the body (they're in the audio)
4. **Clean text**: Filler words should be removed before export
5. **Preserve meaning**: Don't consolidate or rewrite unless user explicitly uses AI tools

---

## File Naming Convention

`{date}_{subject_slug}.md`

Examples:
- `2025-01-15_project-planning-discussion.md`
- `2025-01-15_call-with-john-smith.md`
- `2025-01-15_personal-reflection.md`

### Slug Rules

- Lowercase
- Hyphens instead of spaces
- Remove special characters
- Max 50 characters
- Must be filesystem-safe

---

## Tags Vocabulary (Suggested)

Common tags used in Symbiont (not enforced, just suggestions for UI):

**Dimensions**:
- `business`, `family`, `health`, `spiritual`, `creative`, `social`, `financial`

**Types**:
- `planning`, `reflection`, `decision`, `brainstorm`, `meeting`, `personal`

**People** (auto-suggested based on participants):
- `with-rebeca`, `with-kids`, `with-client`, `solo`

---

## What You DON'T Need to Know

- How Symbiont's PostgreSQL schema works (not your concern)
- How embeddings are generated (happens after sync)
- How Mycelia processes the transcripts (downstream)
- The full agent architecture (irrelevant to this app)

**Your scope**: Audio in → Structured markdown out. That's it.

---

## Testing Integration

To verify your output is correct:

1. Export a test markdown file
2. Validate frontmatter is valid YAML
3. Validate `type` is exactly `voice_memo_transcript`
4. Validate `date` is ISO 8601
5. Validate `participants` is an array with at least one entry
6. Validate file naming matches convention

If these pass, Symbiont will process it correctly.
