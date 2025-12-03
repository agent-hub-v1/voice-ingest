import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudio } from '@/lib/assemblyai'

export async function POST(request: NextRequest) {
  try {
    const { blobUrl } = await request.json()

    if (!blobUrl) {
      return NextResponse.json(
        { error: 'Missing blobUrl' },
        { status: 400 }
      )
    }

    const result = await transcribeAudio(blobUrl)

    return NextResponse.json({
      text: result.text,
      utterances: result.utterances?.map(u => ({
        speaker: u.speaker,
        text: u.text,
        start: u.start,
        end: u.end,
        confidence: u.confidence,
      })) || [],
      confidence: result.confidence,
    })
  } catch (error) {
    console.error('Transcription error:', error)

    if (error instanceof Error) {
      if (error.message.includes('could not be downloaded')) {
        return NextResponse.json(
          { error: 'Audio file not accessible' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    )
  }
}
