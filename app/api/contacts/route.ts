import { NextResponse } from 'next/server'
import { loadContacts } from '@/lib/contacts'

export async function GET() {
  try {
    const contacts = await loadContacts()
    return NextResponse.json({ contacts })
  } catch (error) {
    console.error('Contacts load error:', error)
    return NextResponse.json(
      { error: 'Failed to load contacts' },
      { status: 500 }
    )
  }
}
