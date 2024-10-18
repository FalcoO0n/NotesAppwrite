'use client'
import { Query } from 'appwrite'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { databases, account, ID } from '@/lib/appwrite'
import ExpenseForm from '@/components/ExpenseForm'
import ExpenseList from '@/components/ExpenseList'
import BalanceSummary from '@/components/BalanceSummary'
import SettlementForm from '@/components/SettlementForm'
import { createNotification } from '@/utils/createNotification'
import ErrorMessage from '@/components/ErrorMessage'

export default function GroupDetails({ params }: { params: { id: string } }) {
  const [group, setGroup] = useState<any>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const [settlements, setSettlements] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchGroup = useCallback(async () => {
    try {
      const response = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID!,
        params.id
      )
      setGroup(response)
    } catch (error: any) {
      setError(`Error fetching group: ${error.message}`)
    }
  }, [params.id])

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_EXPENSES_COLLECTION_ID!,
        [Query.equal('groupId', params.id)]
      )
      setExpenses(response.documents)
    } catch (error: any) {
      setError(`Error fetching expenses: ${error.message}`)
    }
  }, [params.id])

  const fetchSettlements = useCallback(async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_SETTLEMENTS_COLLECTION_ID!,
        [Query.equal('groupId', params.id)]
      )
      setSettlements(response.documents)
    } catch (error: any) {
      setError(`Error fetching settlements: ${error.message}`)
    }
  }, [params.id])

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await account.get()
        setUser(session)
        await Promise.all([fetchGroup(), fetchExpenses(), fetchSettlements()])
      } catch (error: any) {
        if (error.code === 401) {
          router.push('/login')
        } else {
          setError(`Session error: ${error.message}`)
        }
      }
    }

    checkSession()
  }, [router, fetchGroup, fetchExpenses, fetchSettlements])

  const handleAddExpense = async (expenseData: any) => {
    try {
      const newExpense = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_EXPENSES_COLLECTION_ID!,
        ID.unique(),
        {
          ...expenseData,
          groupId: params.id,
          createdBy: user.$id
        }
      )
      setExpenses((prevExpenses) => [...prevExpenses, newExpense])

      // Create notifications for all group members except the expense creator
      group.members.forEach((memberId: string) => {
        if (memberId !== user.$id) {
          createNotification(
            memberId,
            `New expense added in ${group.name}: ${expenseData.description} (${expenseData.amount} ${expenseData.currency})`
          )
        }
      })
    } catch (error: any) {
      setError(`Error adding expense: ${error.message}`)
    }
  }

  const handleSettle = async (from: string, to: string, amount: number, currency: string) => {
    try {
      const newSettlement = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_SETTLEMENTS_COLLECTION_ID!,
        ID.unique(),
        {
          from,
          to,
          amount,
          currency,
          groupId: params.id,
          createdBy: user.$id,
          date: new Date().toISOString()
        }
      )
      setSettlements((prevSettlements) => [...prevSettlements, newSettlement])

      // Create notifications for the involved parties
      createNotification(
        from,
        `You have settled ${amount} ${currency} with ${to} in ${group.name}`
      )
      createNotification(
        to,
        `${from} has settled ${amount} ${currency} with you in ${group.name}`
      )
    } catch (error: any) {
      setError(`Error adding settlement: ${error.message}`)
    }
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!group) {
    return <div>Loading...</div>
  }
  // console.log(group, "group ")

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{group.name}</h1>
        <Link href={`/groups/${params.id}/history`} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          View History
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <ExpenseForm groupId={params.id} onAddExpense={handleAddExpense} members={group.members} />
          <ExpenseList expenses={expenses} />
        </div>
        <div>
          <BalanceSummary expenses={expenses} settlements={settlements} members={group.members} />
          <SettlementForm members={group.members} onSettle={handleSettle} />
        </div>
      </div>
    </div>
  )
}