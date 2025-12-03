import { NextResponse } from 'next/server'
import { getAvailableModels } from '@/lib/model-scanner'

export async function GET() {
  try {
    const models = await getAvailableModels()
    return NextResponse.json({ models })
  } catch (error) {
    console.error('Model fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    )
  }
}
