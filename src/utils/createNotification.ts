import { databases, ID } from '@/lib/appwrite'

export async function createNotification(userId: string, message: string) {
  try {
    await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!,
      ID.unique(),
      {
        userId,
        message,
        read: false,
        createdAt: new Date().toISOString()
      }
    )
  } catch (error) {
    console.error('Error creating notification:', error)
  }
}