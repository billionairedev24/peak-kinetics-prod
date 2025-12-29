export interface ContactMessage {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone: string
  address: string
  message?: string
  createdAt: string
  status: "new" | "read" | "responded"
}

// Mock storage for messages (in a real app, this would be a database)
export const mockMessages: ContactMessage[] = []
