'use client'

import { useState, useEffect } from 'react'
import { databases, account } from '@/lib/appwrite'
import { Query } from 'appwrite'

interface Notification {
  $id: string
  message: string
  createdAt: string
  read: boolean
}

export default function Notification() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const session = await account.get()
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!,
          [
            Query.equal('userId', session.$id),
            Query.equal('read', false),
            Query.orderDesc('$createdAt'),
            Query.limit(5)
          ]
        )
        setNotifications(response.documents)
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }

    fetchNotifications()
    const intervalId = setInterval(fetchNotifications, 60000) // Fetch notifications every minute

    return () => clearInterval(intervalId)
  }, [])

  const markAsRead = async (notificationId: string) => {
    try {
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!,
        notificationId,
        { read: true }
      )
      setNotifications(notifications.filter(n => n.$id !== notificationId))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 w-64 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-blue-500 text-white px-4 py-2 font-bold">Notifications</div>
      <ul className="divide-y divide-gray-200">
        {notifications.map((notification) => (
          <li key={notification.$id} className="px-4 py-2 hover:bg-gray-100">
            <p className="text-sm">{notification.message}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {new Date(notification.createdAt).toLocaleString()}
              </span>
              <button
                onClick={() => markAsRead(notification.$id)}
                className="text-xs text-blue-500 hover:text-blue-700"
              >
                Mark as read
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}