---
name: assembly-ai-docs
description: Official AssemblyAI documentation for speech-to-text transcription with speaker diarization. Use when implementing transcription features, configuring speaker labels, handling audio uploads, polling for results, or working with the AssemblyAI API. MANDATORY to consult before implementing any transcription functionality.
---

# AssemblyAI Documentation

Official AssemblyAI API documentation for speech-to-text transcription with speaker diarization.

## PRIMARY DOCUMENT

**START HERE → [docs/index.md](docs/index.md)**

The `index.md` file contains a comprehensive synthesized reference covering:
- API endpoints (upload, submit, poll)
- Supported audio formats and limits
- Basic workflow (upload → submit → poll → parse)
- Speaker diarization with utterances array
- Complete code examples (TypeScript/JavaScript)
- Google Drive integration pattern
- Error handling
- TypeScript types
- Free tier information

**Read `index.md` FIRST before any implementation.**

## Purpose

This skill provides bundled official documentation for AssemblyAI's transcription API. It ensures implementations stay aligned with official specifications and best practices.

## When to Use

**ALWAYS invoke this skill BEFORE**:
- Implementing audio transcription
- Configuring speaker diarization (speaker_labels)
- Setting up audio file uploads
- Polling for transcription results
- Parsing utterances with speaker labels
- Handling transcription errors
- Any AssemblyAI API integration

## Key Concepts

### Speaker Diarization
Enable with `speaker_labels: true` in the transcription request. Response includes `utterances` array with speaker identification (Speaker A, Speaker B, etc.).

### Async Workflow
Transcription is asynchronous:
1. Submit audio URL → get transcript ID
2. Poll status endpoint every 3 seconds
3. When `status: "completed"` → parse results

### Audio Sources
- **Public URLs**: Direct link to audio file
- **Upload endpoint**: For local files (returns upload_url)
- **Google Drive**: Download first, then upload to AssemblyAI

## Critical Rules

1. **NEVER implement from memory** - API may have changed
2. **ALWAYS read `index.md`** before implementation
3. **Follow exact patterns** shown in code examples
4. **Handle all status values**: queued, processing, completed, error
5. **Use speaker_labels: true** for voice-ingest (non-negotiable)
