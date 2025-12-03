import { NextRequest, NextResponse } from 'next/server'
import { removeFillers, rewriteForClarity } from '@/lib/openrouter'

export async function POST(request: NextRequest) {
  try {
    const { text, mode, model } = await request.json()

    if (!text || !mode) {
      return NextResponse.json(
        { error: 'Missing text or mode' },
        { status: 400 }
      )
    }

    if (mode !== 'filler' && mode !== 'clarity') {
      return NextResponse.json(
        { error: 'Invalid mode. Use "filler" or "clarity"' },
        { status: 400 }
      )
    }

    let result: string

    if (mode === 'filler') {
      result = await removeFillers(text, model)
    } else {
      result = await rewriteForClarity(text, model)
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error('OpenRouter error:', error)

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
