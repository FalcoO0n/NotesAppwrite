'use client'

import { useState, useEffect } from 'react'
import { databases, account, ID } from '@/lib/appwrite'
import { useRouter } from 'next/navigation'
import GroupList from '@/components/GroupList'
import CreateGroupForm from '@/components/CreateGroupForm'
import { Query } from 'appwrite'

export default function Groups() {
  const [user, setUser] = useState<any>(null)
  const [groups, setGroups] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await account.get()
        setUser(session)
        fetchGroups(session.$id)
      } catch (error) {
        router.push('/login')
      }
    }

    checkSession()
  }, [router])
  console.log(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID)
  // console.log(userId)

  const fetchGroups = async (userId: string) => {
    console.log(Query.contains("members", ["userId"]), "www")
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID!,
        [Query.contains("members", [userId])]
      )
      setGroups(response.documents)
    } catch (error) {
      console.error('Error fetching groups:', error)
    }
  }

  const handleCreateGroup = async (name: string) => {
    try {
      const newGroup = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID!,
        ID.unique(),
        {
          name,
          members: [user.$id],
          createdBy: user.$id
        }
      )
      console.log(newGroup, "newGroup")
      setGroups([...groups, newGroup])
    } catch (error) {
      console.error('Error creating group:', error)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Groups</h1>
      <CreateGroupForm onCreateGroup={handleCreateGroup} />
      <GroupList groups={groups} />
    </div>
  )
}