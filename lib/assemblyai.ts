const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY!
const BASE_URL = 'https://api.assemblyai.com/v2'

export interface Utterance {
  speaker: string
  text: string
  start: number
  end: number
  confidence: number
}

export interface TranscriptionResult {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'error'
  text: string | null
  confidence: number | null
  utterances: Utterance[] | null
  error?: string
}

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

export async function transcribeAudio(audioUrl: string): Promise<TranscriptionResult> {
  const transcriptId = await submitTranscription(audioUrl)
  return await pollTranscription(transcriptId)
}
