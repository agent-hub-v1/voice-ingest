import { NextRequest, NextResponse } from 'next/server'
import { removeFillers, improveTranscript, enhancePrompt } from '@/lib/openrouter'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

async function logRequest(mode: string, model: string, text: string, result?: string, error?: string) {
  try {
    const logsDir = join(process.cwd(), 'logs')
    await mkdir(logsDir, { recursive: true })

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `${timestamp}_${mode}.json`

    const logData = {
      timestamp: new Date().toISOString(),
      mode,
      model,
      inputLength: text.length,
      input: text,
      ...(result && { outputLength: result.length, output: result }),
      ...(error && { error }),
    }

    await writeFile(join(logsDir, filename), JSON.stringify(logData, null, 2))
  } catch (e) {
    console.error('Failed to write log:', e)
  }
}

export async function POST(request: NextRequest) {
  let text = '', mode = '', model = ''

  try {
    const body = await request.json()
    text = body.text || ''
    mode = body.mode || ''
    model = body.model || ''
    const { pricing, splitParagraphs } = body

    if (!text || !mode) {
      return NextResponse.json(
        { error: 'Missing text or mode' },
        { status: 400 }
      )
    }

    if (mode !== 'filler' && mode !== 'improve' && mode !== 'enhance') {
      return NextResponse.json(
        { error: 'Invalid mode. Use "filler", "improve", or "enhance"' },
        { status: 400 }
      )
    }

    let chatResult

    if (mode === 'filler') {
      chatResult = await removeFillers(text, model, pricing, splitParagraphs)
    } else if (mode === 'improve') {
      chatResult = await improveTranscript(text, model, pricing, splitParagraphs)
    } else {
      // enhance mode - for prompt improvement, not transcript cleaning
      chatResult = await enhancePrompt(text, model, pricing)
    }

    // Log successful request
    await logRequest(mode, model, text, chatResult.content)

    return NextResponse.json({
      result: chatResult.content,
      cost: chatResult.cost,
      usage: chatResult.usage,
    })
  } catch (error) {
    console.error('OpenRouter error:', error)

    // Log failed request
    await logRequest(mode, model, text, undefined, error instanceof Error ? error.message : 'Unknown error')

    if (error instanceof Error) {
      if (error.message.includes('429')) {
        return NextResponse.json(
          { error: 'Rate limited. Please try again in a moment.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Text cleaning failed' },
      { status: 500 }
    )
  }
}
