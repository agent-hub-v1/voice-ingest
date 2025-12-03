# AssemblyAI Quick Reference

Synthesized documentation for AssemblyAI speech-to-text API with speaker diarization.

---

## 1. Overview

AssemblyAI provides speech-to-text transcription via REST API. Key features for voice-ingest:

- **Pre-recorded audio transcription** (not streaming)
- **Speaker diarization** (speaker_labels) - identifies different speakers
- **Utterances** - segments text by speaker with timestamps
- **Async processing** - submit job, poll for results

---

## 2. API Endpoints

**Base URL**: `https://api.assemblyai.com`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v2/upload` | POST | Upload local audio file |
| `/v2/transcript` | POST | Submit transcription job |
| `/v2/transcript/{id}` | GET | Poll status / get results |

### Authentication

All requests require `Authorization` header:

```
Authorization: YOUR_API_KEY
```

---

## 3. Supported Audio Formats

AssemblyAI supports most common audio/video formats:

- **Recommended**: WAV, FLAC (lossless, best accuracy)
- **Supported**: MP3, M4A, M4P, WMA, AAC, OGG, WEBM
- **Video**: MP4, MOV, AVI (extracts audio)

**Limits**:
- Max file size: **5GB**
- Max duration: **10 hours**

**Best Practice**: Submit audio in native format - don't transcode. AssemblyAI converts to 16kHz internally.

---

## 4. Basic Workflow

```
1. Upload audio (if local file)
   POST /v2/upload → returns upload_url

2. Submit transcription job
   POST /v2/transcript { audio_url, speaker_labels: true }
   → returns { id, status: "queued" }

3. Poll for completion
   GET /v2/transcript/{id}
   → repeat every 3-5 seconds until status: "completed"

4. Parse results
   → transcript.text (full text)
   → transcript.utterances (speaker-segmented)
```

---

## 5. Upload Local Audio File

Use this when audio is on your server (not a public URL).

### Request

```
POST https://api.assemblyai.com/v2/upload
Content-Type: application/octet-stream
Authorization: YOUR_API_KEY

[binary audio data]
```

### Response

```json
{
  "upload_url": "https://cdn.assemblyai.com/upload/..."
}
```

### JavaScript Example

```typescript
async function uploadAudio(audioBuffer: Buffer, apiKey: string): Promise<string> {
  const response = await fetch('https://api.assemblyai.com/v2/upload', {
    method: 'POST',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/octet-stream',
    },
    body: audioBuffer,
  })

  const data = await response.json()
  return data.upload_url
}
```

---

## 6. Submit Transcription Job

### Request

```
POST https://api.assemblyai.com/v2/transcript
Content-Type: application/json
Authorization: YOUR_API_KEY
```

### Request Body (Minimal)

```json
{
  "audio_url": "https://example.com/audio.mp3"
}
```

### Request Body (With Speaker Labels)

```json
{
  "audio_url": "https://example.com/audio.mp3",
  "speaker_labels": true
}
```

### Request Body (Full Options for Voice-Ingest)

```json
{
  "audio_url": "https://cdn.assemblyai.com/upload/...",
  "speaker_labels": true,
  "speakers_expected": 2,
  "punctuate": true,
  "format_text": true,
  "language_code": "en"
}
```

### Key Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `audio_url` | string | **Required**. URL to audio file |
| `speaker_labels` | boolean | Enable speaker diarization |
| `speakers_expected` | integer | Hint for number of speakers (optional) |
| `punctuate` | boolean | Add punctuation (default: true) |
| `format_text` | boolean | Format numbers/dates (default: true) |
| `disfluencies` | boolean | Keep filler words (um, uh) if true |
| `language_code` | string | Language code (e.g., "en", "es") |
| `language_detection` | boolean | Auto-detect language |
| `webhook_url` | string | URL to POST results when done |

### Response

```json
{
  "id": "6jo8zuv83s-...",
  "status": "queued",
  "audio_url": "https://...",
  "speaker_labels": true
}
```

### JavaScript Example

```typescript
async function submitTranscription(
  audioUrl: string,
  apiKey: string
): Promise<string> {
  const response = await fetch('https://api.assemblyai.com/v2/transcript', {
    method: 'POST',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audio_url: audioUrl,
      speaker_labels: true,
      punctuate: true,
      format_text: true,
    }),
  })

  const data = await response.json()
  return data.id  // transcript ID for polling
}
```

---

## 7. Poll for Results

### Request

```
GET https://api.assemblyai.com/v2/transcript/{transcript_id}
Authorization: YOUR_API_KEY
```

### Response (Processing)

```json
{
  "id": "6jo8zuv83s-...",
  "status": "processing",
  "text": null
}
```

### Response (Completed)

```json
{
  "id": "6jo8zuv83s-...",
  "status": "completed",
  "text": "Full transcript text here...",
  "confidence": 0.956,
  "audio_duration": 185000,
  "words": [...],
  "utterances": [...]
}
```

### Response (Error)

```json
{
  "id": "6jo8zuv83s-...",
  "status": "error",
  "error": "Audio file could not be downloaded"
}
```

### Status Values

| Status | Meaning |
|--------|---------|
| `queued` | Job received, waiting to process |
| `processing` | Transcription in progress |
| `completed` | Done - results available |
| `error` | Failed - check `error` field |

### JavaScript Polling Example

```typescript
async function pollTranscription(
  transcriptId: string,
  apiKey: string
): Promise<TranscriptResult> {
  const pollingEndpoint = `https://api.assemblyai.com/v2/transcript/${transcriptId}`

  while (true) {
    const response = await fetch(pollingEndpoint, {
      headers: { 'Authorization': apiKey },
    })

    const data = await response.json()

    if (data.status === 'completed') {
      return data
    }

    if (data.status === 'error') {
      throw new Error(`Transcription failed: ${data.error}`)
    }

    // Wait 3 seconds before polling again
    await new Promise(resolve => setTimeout(resolve, 3000))
  }
}
```

---

## 8. Speaker Diarization (CRITICAL)

When `speaker_labels: true`, the response includes an `utterances` array with speaker identification.

### Utterances Array Structure

```json
{
  "utterances": [
    {
      "speaker": "A",
      "text": "Hello, how are you doing today?",
      "start": 0,
      "end": 2500,
      "confidence": 0.95,
      "words": [
        { "text": "Hello", "start": 0, "end": 500, "confidence": 0.98, "speaker": "A" },
        { "text": "how", "start": 550, "end": 700, "confidence": 0.96, "speaker": "A" }
      ]
    },
    {
      "speaker": "B",
      "text": "I'm doing great, thanks for asking.",
      "start": 2800,
      "end": 5200,
      "confidence": 0.93,
      "words": [...]
    },
    {
      "speaker": "A",
      "text": "That's wonderful to hear.",
      "start": 5500,
      "end": 7000,
      "confidence": 0.97,
      "words": [...]
    }
  ]
}
```

### Utterance Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `speaker` | string | Speaker identifier ("A", "B", "C", etc.) |
| `text` | string | What this speaker said |
| `start` | integer | Start time in milliseconds |
| `end` | integer | End time in milliseconds |
| `confidence` | number | Confidence score (0-1) |
| `words` | array | Individual words with timing |

### Processing Utterances for Voice-Ingest

```typescript
interface Utterance {
  speaker: string
  text: string
  start: number
  end: number
  confidence: number
}

interface ProcessedTranscript {
  speakers: string[]  // ["A", "B"]
  segments: Array<{ speaker: string; text: string }>
  overallConfidence: number
}

function processTranscript(data: any): ProcessedTranscript {
  const utterances: Utterance[] = data.utterances || []

  // Extract unique speakers
  const speakers = [...new Set(utterances.map(u => u.speaker))]

  // Create segments for display
  const segments = utterances.map(u => ({
    speaker: u.speaker,
    text: u.text,
  }))

  return {
    speakers,
    segments,
    overallConfidence: data.confidence,
  }
}
```

### Formatting for Markdown Output

```typescript
function formatTranscript(
  segments: Array<{ speaker: string; text: string }>,
  speakerNames: Record<string, string>  // { "A": "Richard", "B": "John" }
): string {
  return segments
    .map(seg => {
      const name = speakerNames[seg.speaker] || `Speaker ${seg.speaker}`
      return `**${name}**: ${seg.text}`
    })
    .join('\n\n')
}

// Output:
// **Richard**: Hello, how are you doing today?
//
// **John**: I'm doing great, thanks for asking.
//
// **Richard**: That's wonderful to hear.
```

---

## 9. Complete Integration Example

```typescript
// lib/assemblyai.ts

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY!
const BASE_URL = 'https://api.assemblyai.com/v2'

interface TranscriptionResult {
  id: string
  status: string
  text: string | null
  confidence: number | null
  utterances: Utterance[] | null
  error?: string
}

interface Utterance {
  speaker: string
  text: string
  start: number
  end: number
  confidence: number
}

// Step 1: Upload audio (if needed)
export async function uploadAudio(audioBuffer: Buffer): Promise<string> {
  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': ASSEMBLYAI_API_KEY,
      'Content-Type': 'application/octet-stream',
    },
    body: audioBuffer,
  })

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`)
  }

  const data = await response.json()
  return data.upload_url
}

// Step 2: Submit transcription job
export async function submitTranscription(audioUrl: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/transcript`, {
    method: 'POST',
    headers: {
      'Authorization': ASSEMBLYAI_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audio_url: audioUrl,
      speaker_labels: true,
      punctuate: true,
      format_text: true,
    }),
  })

  if (!response.ok) {
    throw new Error(`Submit failed: ${response.status}`)
  }

  const data = await response.json()
  return data.id
}

// Step 3: Poll until complete
export async function pollTranscription(
  transcriptId: string,
  maxAttempts = 100
): Promise<TranscriptionResult> {
  const pollingEndpoint = `${BASE_URL}/transcript/${transcriptId}`

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(pollingEndpoint, {
      headers: { 'Authorization': ASSEMBLYAI_API_KEY },
    })

    const data: TranscriptionResult = await response.json()

    if (data.status === 'completed') {
      return data
    }

    if (data.status === 'error') {
      throw new Error(`Transcription failed: ${data.error}`)
    }

    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000))
  }

  throw new Error('Transcription timed out')
}

// Full workflow
export async function transcribeAudio(audioUrl: string): Promise<TranscriptionResult> {
  const transcriptId = await submitTranscription(audioUrl)
  return await pollTranscription(transcriptId)
}
```

---

## 10. Using with Google Drive URLs

Google Drive files need to be publicly accessible or you need to download them first.

### Option A: Make File Public (Not Recommended)

If file is publicly shared, use direct download URL:
```
https://drive.google.com/uc?export=download&id=FILE_ID
```

### Option B: Download First, Then Upload (Recommended)

```typescript
// In your API route
export async function POST(request: NextRequest) {
  const { driveFileId } = await request.json()

  // 1. Download from Google Drive using your OAuth tokens
  const audioBuffer = await downloadFromDrive(driveFileId)

  // 2. Upload to AssemblyAI
  const uploadUrl = await uploadAudio(audioBuffer)

  // 3. Submit transcription
  const transcriptId = await submitTranscription(uploadUrl)

  // 4. Poll for results
  const result = await pollTranscription(transcriptId)

  return NextResponse.json(result)
}
```

---

## 11. Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Audio file could not be downloaded` | Invalid/inaccessible URL | Use upload endpoint for local files |
| `Audio duration exceeds limit` | File > 10 hours | Split into smaller files |
| `Unsupported audio format` | Rare format | Convert to MP3/WAV first |
| `Rate limit exceeded` | Too many requests | Add exponential backoff |

### Error Handling Pattern

```typescript
try {
  const result = await transcribeAudio(audioUrl)
  return NextResponse.json(result)
} catch (error) {
  if (error instanceof Error) {
    // Log for debugging
    console.error('Transcription error:', error.message)

    // Return appropriate status
    if (error.message.includes('could not be downloaded')) {
      return NextResponse.json(
        { error: 'Audio file not accessible' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    )
  }
}
```

---

## 12. TypeScript Types

```typescript
// types/assemblyai.ts

export interface TranscriptParams {
  audio_url: string
  speaker_labels?: boolean
  speakers_expected?: number
  punctuate?: boolean
  format_text?: boolean
  disfluencies?: boolean
  language_code?: string
  language_detection?: boolean
  webhook_url?: string
}

export interface TranscriptResponse {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'error'
  audio_url: string
  text: string | null
  confidence: number | null
  audio_duration: number | null
  utterances: Utterance[] | null
  words: Word[] | null
  error?: string
}

export interface Utterance {
  speaker: string
  text: string
  start: number
  end: number
  confidence: number
  words: Word[]
}

export interface Word {
  text: string
  start: number
  end: number
  confidence: number
  speaker?: string
}

export interface UploadResponse {
  upload_url: string
}
```

---

## 13. API Reference Quick Lookup

### Submit Transcript

```
POST /v2/transcript
Authorization: {api_key}
Content-Type: application/json

{
  "audio_url": "...",
  "speaker_labels": true
}
```

### Get Transcript

```
GET /v2/transcript/{id}
Authorization: {api_key}
```

### Upload File

```
POST /v2/upload
Authorization: {api_key}
Content-Type: application/octet-stream

[binary data]
```

---

## 14. Free Tier Information

- **185 hours** of transcription per account
- No credit card required for free tier
- Rate limits apply (contact support for specifics)
- Uploaded files auto-deleted after processing
