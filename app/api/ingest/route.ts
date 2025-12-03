import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Verify secret
  const auth = request.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.INGEST_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get file from form data - try multiple field names
  const formData = await request.formData()

  // iOS Shortcuts might use different field names
  let file = formData.get('file') as File | null
  if (!file) {
    // Try to find any file in the form data
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        file = value
        break
      }
    }
  }

  if (!file || !(file instanceof File)) {
    // Debug: return what we received
    const keys = Array.from(formData.keys())
    return NextResponse.json({
      error: 'No file provided',
      debug: { receivedFields: keys }
    }, { status: 400 })
  }

  // Validate audio file
  if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
    return NextResponse.json(
      { error: 'Invalid file type. Must be audio or video.' },
      { status: 400 }
    )
  }

  try {
    // Upload to Blob
    const blob = await put(`audio/${file.name}`, file, {
      access: 'public',
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
    })
  } catch (error) {
    console.error('Blob upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
