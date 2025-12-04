import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Verify secret
  const auth = request.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.INGEST_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { filename } = await request.json()

    if (!filename) {
      return NextResponse.json({ error: 'Missing filename' }, { status: 400 })
    }

    const pathname = `audio/${filename}`

    // Generate a client token that allows uploading to this specific path
    const clientToken = await generateClientTokenFromReadWriteToken({
      token: process.env.BLOB_READ_WRITE_TOKEN!,
      pathname,
      addRandomSuffix: false,
      allowedContentTypes: [
        'audio/mpeg',
        'audio/mp4',
        'audio/m4a',
        'audio/x-m4a',
        'audio/wav',
        'audio/webm',
        'audio/ogg',
        'audio/aac',
        'video/mp4',
        'video/quicktime',
        'application/octet-stream',
      ],
      maximumSizeInBytes: 500 * 1024 * 1024, // 500MB max
      validUntil: Date.now() + 60 * 60 * 1000, // 1 hour
    })

    // Return the token and upload URL
    // iOS Shortcuts should PUT the file to: https://blob.vercel-storage.com/?pathname={pathname}
    // with headers: Authorization: Bearer {clientToken}, x-api-version: 11
    return NextResponse.json({
      clientToken,
      uploadUrl: `https://blob.vercel-storage.com/?pathname=${encodeURIComponent(pathname)}`,
      pathname,
    })
  } catch (error) {
    console.error('Token generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload token' },
      { status: 500 }
    )
  }
}
