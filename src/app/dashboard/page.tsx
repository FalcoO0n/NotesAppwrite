'use client'

import { useEffect, useState } from 'react'
import { account } from '@/lib/appwrite'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await account.get()
        setUser(session)
      } catch (error) {
        router.push('/login')
      }
    }

    checkSession()
  }, [router])

  const handleLogout = async () => {
    try {
      await account.deleteSession('current')
      router.push('/')
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Welcome, {user.name}!</h1>
      <p className="mb-4">This is your dashboard. Here you can manage your groups and expenses.</p>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Logout
      </button>
    </div>
  )
}