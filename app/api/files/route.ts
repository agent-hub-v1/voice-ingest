import { list, put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // List both audio files and pre-transcribed text entries
    const [audioResult, transcriptResult] = await Promise.all([
      list({ prefix: 'audio/' }),
      list({ prefix: 'transcripts/' }),
    ])

    const audioFiles = audioResult.blobs.map(blob => ({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
      type: 'audio' as const,
    }))

    const transcriptFiles = transcriptResult.blobs.map(blob => ({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
      type: 'transcript' as const,
    }))

    // Combine and sort by upload date (newest first)
    const allFiles = [...audioFiles, ...transcriptFiles].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )

    return NextResponse.json({ files: allFiles })
  } catch (error) {
    console.error('Blob list error:', error)
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    )
  }
}

// Create a new empty transcript file for pasting text
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    // Generate a filename based on the provided name or current timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const filename = name?.trim()
      ? `${name.trim().replace(/[^a-zA-Z0-9-_ ]/g, '')}.json`
      : `pasted-text-${timestamp}.json`

    const pathname = `transcripts/${filename}`

    // Create an empty transcript structure
    const emptyTranscript = {
      text: "",
      utterances: [
        {
          speaker: "A",
          text: "",
          start: 0,
          end: 0,
          confidence: 1.0
        }
      ],
      confidence: 1.0
    }

    // Upload to Vercel Blob
    const blob = await put(pathname, JSON.stringify(emptyTranscript), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    })

    return NextResponse.json({
      file: {
        url: blob.url,
        pathname: blob.pathname,
        size: JSON.stringify(emptyTranscript).length,
        uploadedAt: new Date().toISOString(),
        type: 'transcript' as const,
      }
    })
  } catch (error) {
    console.error('Create transcript error:', error)
    return NextResponse.json(
      { error: 'Failed to create transcript' },
      { status: 500 }
    )
  }
}
