import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, rename } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import os from 'os'

// Sanitize category name for filesystem use
function sanitizeCategory(category: string): string {
  return category
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Generate unique filename if collision exists
function getUniqueFilename(dir: string, filename: string): string {
  const ext = path.extname(filename)
  const base = path.basename(filename, ext)
  let finalPath = path.join(dir, filename)
  let counter = 1

  while (existsSync(finalPath)) {
    finalPath = path.join(dir, `${base}-${counter}${ext}`)
    counter++
  }

  return path.basename(finalPath)
}

export async function POST(request: NextRequest) {
  try {
    const { content, filename, exportPath, category } = await request.json()

    if (!content || !filename) {
      return NextResponse.json(
        { error: 'Missing content or filename' },
        { status: 400 }
      )
    }

    // Expand ~ to home directory
    let targetDir = exportPath || '~/Downloads'
    if (targetDir.startsWith('~/')) {
      targetDir = path.join(os.homedir(), targetDir.slice(2))
    }

    // If category is provided and not "uncategorized", create subfolder
    if (category && category !== 'uncategorized') {
      const sanitizedCategory = sanitizeCategory(category)
      if (sanitizedCategory) {
        targetDir = path.join(targetDir, sanitizedCategory)
      }
    }

    // Create directory if it doesn't exist
    if (!existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true })
    }

    // Handle filename collisions
    const uniqueFilename = getUniqueFilename(targetDir, filename)
    const filePath = path.join(targetDir, uniqueFilename)

    // Write file atomically by writing to temp then renaming
    const tempPath = filePath + '.tmp'
    await writeFile(tempPath, content, 'utf-8')
    await rename(tempPath, filePath)

    return NextResponse.json({
      success: true,
      path: filePath,
      category: category || null
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to export file' },
      { status: 500 }
    )
  }
}
