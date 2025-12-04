import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Verify secret
  const auth = request.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.INGEST_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, transcript } = await request.json()

    if (!transcript) {
      return NextResponse.json({ error: 'Missing transcript' }, { status: 400 })
    }

    const filename = title || `transcript-${Date.now()}`

    // Create a JSON file with the transcript data
    // This will be recognized by the app as a pre-transcribed entry
    const data = {
      type: 'pre-transcribed',
      text: transcript,
      utterances: [
        {
          speaker: 'A',
          text: transcript,
        }
      ],
      confidence: 1.0,
      createdAt: new Date().toISOString(),
    }

    // Store as JSON in the transcripts folder
    const blob = await put(`transcripts/${filename}.json`, JSON.stringify(data), {
      access: 'public',
      contentType: 'application/json',
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
    })
  } catch (error) {
    console.error('Text ingest error:', error)
    return NextResponse.json(
      { error: 'Failed to save transcript' },
      { status: 500 }
    )
  }
}
