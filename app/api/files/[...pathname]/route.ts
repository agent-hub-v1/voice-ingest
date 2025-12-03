import { del, head } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ pathname: string[] }> }
) {
  const { pathname } = await params
  const fullPath = pathname.join('/')

  try {
    // Get blob URL from the pathname
    // The pathname is relative to the blob store
    const { blobs } = await import('@vercel/blob').then(m => m.list({ prefix: fullPath }))

    if (blobs.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    await del(blobs[0].url)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Blob delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pathname: string[] }> }
) {
  const { pathname } = await params
  const fullPath = pathname.join('/')

  try {
    const { blobs } = await import('@vercel/blob').then(m => m.list({ prefix: fullPath }))

    if (blobs.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const info = await head(blobs[0].url)

    return NextResponse.json({
      url: info.url,
      pathname: info.pathname,
      size: info.size,
      uploadedAt: info.uploadedAt,
      contentType: info.contentType,
    })
  } catch (error) {
    console.error('Blob head error:', error)
    return NextResponse.json(
      { error: 'Failed to get file info' },
      { status: 500 }
    )
  }
}
