import type { Metadata } from 'next'
import ChatInterface from './ChatInterface'

export const metadata: Metadata = {
  title: 'Chat Warga',
}

export default function ChatPage() {
  return <ChatInterface />
}
