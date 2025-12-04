import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import os from 'os'

export async function POST(request: NextRequest) {
  try {
    const { content, filename, exportPath } = await request.json()

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

    // Create directory if it doesn't exist
    if (!existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true })
    }

    const filePath = path.join(targetDir, filename)
    await writeFile(filePath, content, 'utf-8')

    return NextResponse.json({
      success: true,
      path: filePath
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to export file' },
      { status: 500 }
    )
  }
}
