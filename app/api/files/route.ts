import { list } from '@vercel/blob'
import { NextResponse } from 'next/server'

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
