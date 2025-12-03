import { readFile } from 'fs/promises'
import { homedir } from 'os'
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

const DEFAULT_CONTACTS_PATH = join(homedir(), 'symbiont', 'data', 'contacts.json')

export async function loadContacts(): Promise<Contact[]> {
  const contactsPath = process.env.CONTACTS_SOURCE || DEFAULT_CONTACTS_PATH

  try {
    const data = await readFile(contactsPath, 'utf-8')
    const parsed: ContactsData = JSON.parse(data)
    return parsed.contacts
  } catch (error) {
    console.warn(`Could not load contacts from ${contactsPath}:`, error)
    return []
  }
}

export function findContactByName(contacts: Contact[], name: string): Contact | undefined {
  const lowerName = name.toLowerCase()

  return contacts.find(contact => {
    if (contact.name.toLowerCase() === lowerName) return true
    if (contact.aliases?.some(alias => alias.toLowerCase() === lowerName)) return true
    return false
  })
}
