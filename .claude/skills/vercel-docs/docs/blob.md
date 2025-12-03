# Vercel Blob Storage

Complete guide for Vercel Blob SDK - file uploads, listing, and deletion.

---

## 1. Overview

Vercel Blob is object storage for files. Used in voice-ingest to store audio files uploaded from iOS Shortcuts.

**Free tier**: 1GB storage (~45 hours of voice memos at 48kbps)

**Key features:**
- Simple SDK (put, list, del, head)
- Public URLs for files (required for AssemblyAI access)
- Auto-configured when Blob store linked to project

---

## 2. Installation

```bash
pnpm add @vercel/blob
```

---

## 3. Setup

### Create Blob Store

1. Go to Vercel Dashboard → Storage → Create Database
2. Select "Blob"
3. Name it (e.g., `voice-ingest-blob`)
4. Select region closest to you
5. Connect to your project

This auto-creates `BLOB_READ_WRITE_TOKEN` environment variable.

### Pull Token Locally

```bash
vercel env pull .env.local
```

---

## 4. SDK Methods

### put() - Upload File

```typescript
import { put } from '@vercel/blob';

const blob = await put('audio/recording.m4a', file, {
  access: 'public',  // Required for AssemblyAI to access
});

// Returns:
// {
//   url: 'https://xyz.public.blob.vercel-storage.com/audio/recording.m4a',
//   downloadUrl: 'https://xyz.public.blob.vercel-storage.com/audio/recording.m4a?download=1',
//   pathname: 'audio/recording.m4a',
//   contentType: 'audio/mp4',
//   contentDisposition: 'inline; filename="recording.m4a"',
// }
```

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `access` | `'public'` | **Required**. Must be 'public' |
| `addRandomSuffix` | boolean | Add random string to filename (default: false) |
| `contentType` | string | Override MIME type (auto-detected) |

### list() - List Files

```typescript
import { list } from '@vercel/blob';

const { blobs, hasMore, cursor } = await list();

// Each blob:
// {
//   url: string,
//   downloadUrl: string,
//   pathname: string,
//   size: number,
//   uploadedAt: Date,
// }
```

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `prefix` | string | Filter by path prefix (e.g., `'audio/'`) |
| `limit` | number | Max results (default: 1000) |
| `cursor` | string | Pagination cursor |

**Pagination example:**

```typescript
let cursor: string | undefined;
const allBlobs = [];

do {
  const { blobs, hasMore, cursor: nextCursor } = await list({ cursor });
  allBlobs.push(...blobs);
  cursor = hasMore ? nextCursor : undefined;
} while (cursor);
```

### del() - Delete File

```typescript
import { del } from '@vercel/blob';

// Single file
await del('https://xyz.public.blob.vercel-storage.com/audio/recording.m4a');

// Multiple files
await del([url1, url2, url3]);
```

### head() - Get Metadata

```typescript
import { head } from '@vercel/blob';

const info = await head(blobUrl);

// Returns:
// {
//   url: string,
//   downloadUrl: string,
//   pathname: string,
//   contentType: string,
//   contentDisposition: string,
//   size: number,
//   uploadedAt: Date,
//   cacheControl: string,
// }
```

---

## 5. Next.js API Route Examples

### /api/ingest - Receive Upload from iOS Shortcut

```typescript
// app/api/ingest/route.ts
import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Verify secret
  const auth = request.headers.get('Authorization');
  if (auth !== `Bearer ${process.env.INGEST_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get file from form data
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Upload to Blob
  const blob = await put(`audio/${file.name}`, file, {
    access: 'public',
  });

  return NextResponse.json({
    success: true,
    url: blob.url,
    pathname: blob.pathname,
  });
}
```

### /api/files - List Pending Files

```typescript
// app/api/files/route.ts
import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET() {
  const { blobs } = await list({ prefix: 'audio/' });

  return NextResponse.json({
    files: blobs.map(blob => ({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
    })),
  });
}
```

### /api/files/[pathname] - Delete File

```typescript
// app/api/files/[...pathname]/route.ts
import { del } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ pathname: string[] }> }
) {
  const { pathname } = await params;
  const fullPath = pathname.join('/');

  // Construct the blob URL
  const blobUrl = `https://${process.env.BLOB_STORE_ID}.public.blob.vercel-storage.com/${fullPath}`;

  await del(blobUrl);

  return NextResponse.json({ success: true });
}
```

---

## 6. TypeScript Types

```typescript
import type { PutBlobResult, ListBlobResult, HeadBlobResult } from '@vercel/blob';

// PutBlobResult
interface PutBlobResult {
  url: string;
  downloadUrl: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
}

// ListBlobResult
interface ListBlobResult {
  blobs: {
    url: string;
    downloadUrl: string;
    pathname: string;
    size: number;
    uploadedAt: Date;
  }[];
  cursor?: string;
  hasMore: boolean;
}

// HeadBlobResult
interface HeadBlobResult {
  url: string;
  downloadUrl: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
  size: number;
  uploadedAt: Date;
  cacheControl: string;
}
```

---

## 7. Error Handling

```typescript
import { BlobAccessError } from '@vercel/blob';

try {
  const blob = await put('file.m4a', file, { access: 'public' });
} catch (error) {
  if (error instanceof BlobAccessError) {
    // Token invalid or missing
    console.error('Blob access error:', error.message);
  }
  throw error;
}
```

---

## 8. Important Notes

### Access Must Be Public

AssemblyAI needs to fetch the audio file via URL. Files must be `access: 'public'`.

### Audio MIME Types

Audio files (`audio/*`) are served with `content-disposition: inline` by default, which is fine for our use case.

### Caching

- Changes may take up to 60 seconds to propagate
- Treat blobs as immutable - create new files rather than overwriting

### Storage Limits

| Tier | Storage | Operations |
|------|---------|------------|
| Free | 1 GB | 1,000 put/month |
| Pro | 100 GB | 100,000 put/month |

For voice-ingest: 1GB ≈ 45 hours of audio. Delete files after processing.

---

## 9. Environment Variables

```bash
# Auto-configured when Blob store linked
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx

# For iOS Shortcut authentication
INGEST_SECRET=your-secret-here
```

Pull locally:
```bash
vercel env pull .env.local
```
