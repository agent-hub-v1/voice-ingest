import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Verify secret
  const auth = request.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.INGEST_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Try to get file from form data or raw body
  const contentType = request.headers.get('content-type') || ''
  let file: File | null = null
  let filename = 'recording.m4a'

  if (contentType.includes('multipart/form-data')) {
    // Form data upload
    const formData = await request.formData()
    file = formData.get('file') as File | null
    if (!file) {
      for (const [, value] of formData.entries()) {
        if (value instanceof File) {
          file = value
          break
        }
      }
    }
  } else {
    // Raw file upload (iOS Shortcuts "File" body type)
    const buffer = await request.arrayBuffer()
    if (buffer.byteLength > 0) {
      // Try to get filename from content-disposition header
      const disposition = request.headers.get('content-disposition')
      if (disposition) {
        const match = disposition.match(/filename="?([^";\n]+)"?/i)
        if (match) filename = match[1]
      }
      // Create a File from the buffer
      const mimeType = contentType.split(';')[0] || 'audio/m4a'
      file = new File([buffer], filename, { type: mimeType })
    }
  }

  if (!file) {
    return NextResponse.json({
      error: 'No file provided',
      debug: { contentType }
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
