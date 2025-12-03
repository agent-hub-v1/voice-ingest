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
  sourceAudio: string
  transcriptionConfidence: number
  processedDate: string
}

export function formatTranscript(
  segments: Array<{ speaker: string; text: string }>,
  speakerNames: Record<string, string>
): string {
  return segments
    .map(seg => {
      const name = speakerNames[seg.speaker] || `Speaker ${seg.speaker}`
      return `**${name}**: ${seg.text}`
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
  const participantNames = metadata.participants.map(p => p.name).join(', ')

  const frontmatter = `---
type: voice_memo_transcript
date: ${metadata.date}
participants:
${metadata.participants.map(p => `  - name: ${p.name}
    contact_id: ${p.contact_id || 'null'}`).join('\n')}
subject: "${metadata.subject}"
summary: "${metadata.summary}"
tags: [${metadata.tags.join(', ')}]
source_audio: "${metadata.sourceAudio}"
transcription_confidence: ${metadata.transcriptionConfidence}
processed_date: ${metadata.processedDate}
---`

  const header = `# ${metadata.subject}

**Participants**: ${participantNames}
**Date**: ${formatDateForDisplay(metadata.date)}
**Summary**: ${metadata.summary}

---

## Transcript`

  const transcript = formatTranscript(
    utterances.map(u => ({ speaker: u.speaker, text: u.text })),
    speakerNames
  )

  return `${frontmatter}\n\n${header}\n\n${transcript}\n`
}

export function generateFilename(metadata: TranscriptMetadata): string {
  const dateStr = formatDateForFilename(metadata.date)
  const slug = generateSlug(metadata.subject)
  return `${dateStr}_${slug}.md`
}
