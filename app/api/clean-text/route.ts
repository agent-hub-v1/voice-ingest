import { NextRequest, NextResponse } from 'next/server'
import { removeFillers, rewriteForClarity } from '@/lib/openrouter'

export async function POST(request: NextRequest) {
  try {
    const { text, mode, model, pricing } = await request.json()

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

    let chatResult

    if (mode === 'filler') {
      chatResult = await removeFillers(text, model, pricing)
    } else {
      chatResult = await rewriteForClarity(text, model, pricing)
    }

    return NextResponse.json({ result: chatResult.content, cost: chatResult.cost })
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
