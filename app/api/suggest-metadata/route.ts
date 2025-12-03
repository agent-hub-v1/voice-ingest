import { NextRequest, NextResponse } from 'next/server'
import { suggestMetadata } from '@/lib/openrouter'

export async function POST(request: NextRequest) {
  try {
    const { transcript, model } = await request.json()

    if (!transcript) {
      return NextResponse.json(
        { error: 'Missing transcript' },
        { status: 400 }
      )
    }

    const suggestions = await suggestMetadata(transcript, model)

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('Suggest metadata error:', error)

    if (error instanceof Error) {
      if (error.message.includes('429')) {
        return NextResponse.json(
          { error: 'Rate limited. Please try again in a moment.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
}
