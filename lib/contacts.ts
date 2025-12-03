import { readFile } from 'fs/promises'
import { join } from 'path'

export interface Contact {
  id: string
  name: string
  relationship_type?: string
  aliases?: string[]
}

export interface ContactsData {
  contacts: Contact[]
}

export async function loadContacts(): Promise<Contact[]> {
  // Try custom path from env, then local data folder
  const paths = [
    process.env.CONTACTS_SOURCE,
    join(process.cwd(), 'data', 'contacts.json'),
  ].filter(Boolean) as string[]

  for (const contactsPath of paths) {
    try {
      const data = await readFile(contactsPath, 'utf-8')
      const parsed: ContactsData = JSON.parse(data)
      return parsed.contacts
    } catch {
      // Try next path
    }
  }

  console.warn('Could not load contacts from any path')
  return []
}

export function findContactByName(contacts: Contact[], name: string): Contact | undefined {
  const lowerName = name.toLowerCase()

  return contacts.find(contact => {
    if (contact.name.toLowerCase() === lowerName) return true
    if (contact.aliases?.some(alias => alias.toLowerCase() === lowerName)) return true
    return false
  })
}
