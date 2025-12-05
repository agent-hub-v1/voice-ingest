import { NextRequest, NextResponse } from 'next/server'
import { removeFillers, improveTranscript, enhancePrompt } from '@/lib/openrouter'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const text = body.text || ''
    const mode = body.mode || ''
    const model = body.model || ''
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

    return NextResponse.json({
      result: chatResult.content,
      cost: chatResult.cost,
      usage: chatResult.usage,
    })
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
