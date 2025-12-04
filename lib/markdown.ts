import type { Utterance } from './assemblyai'

export interface Participant {
  name: string
  contact_id: string | null
}

export interface TranscriptMetadata {
  date: string
  participants: Participant[]
  subject: string
  summary: string
  tags: string[]
  sourceAudio?: string
  sourceType?: 'audio' | 'text'
  transcriptionConfidence: number
  processedDate: string
}

// Remove Unicode line/paragraph separators that cause issues in editors
function sanitizeText(text: string): string {
  return text
    .replace(/\u2028/g, ' ')  // Line Separator
    .replace(/\u2029/g, '\n') // Paragraph Separator
}

export function formatTranscript(
  segments: Array<{ speaker: string; text: string }>,
  speakerNames: Record<string, string>
): string {
  return segments
    .map(seg => {
      // If speaker is already a name (not a single letter like A/B/C), use it directly
      // Otherwise look up in speakerNames map
      const isOriginalSpeakerLabel = /^[A-Z]$/.test(seg.speaker)
      const name = isOriginalSpeakerLabel
        ? (speakerNames[seg.speaker] || `Speaker ${seg.speaker}`)
        : seg.speaker
      return `**${name}**: ${sanitizeText(seg.text)}`
    })
    .join('\n\n')
}

export function generateSlug(subject: string): string {
  return subject
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
    .replace(/^-+|-+$/g, '')
}

export function formatDateForFilename(date: string): string {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

export function formatDateForDisplay(date: string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function generateMarkdown(
  metadata: TranscriptMetadata,
  utterances: Utterance[],
  speakerNames: Record<string, string>
): string {
  const sourceLines = metadata.sourceAudio
    ? `source_audio: "${metadata.sourceAudio}"`
    : `source_type: "text"`

  const frontmatter = `---
type: voice_memo_transcript
date: ${metadata.date}
participants:
${metadata.participants.map(p => `  - name: ${p.name}
    contact_id: ${p.contact_id || 'null'}`).join('\n')}
subject: "${metadata.subject}"
summary: "${metadata.summary}"
tags: [${metadata.tags.join(', ')}]
${sourceLines}
transcription_confidence: ${metadata.transcriptionConfidence}
processed_date: ${metadata.processedDate}
---`

  const transcript = formatTranscript(
    utterances.map(u => ({ speaker: u.speaker, text: u.text })),
    speakerNames
  )

  return `${frontmatter}\n\n${transcript}\n`
}

export function generateFilename(metadata: TranscriptMetadata): string {
  const dateStr = formatDateForFilename(metadata.date)
  const slug = generateSlug(metadata.subject)
  return `${dateStr}_${slug}.md`
}
