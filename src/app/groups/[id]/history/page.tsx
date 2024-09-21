'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { databases, account } from '@/lib/appwrite'
import { Query } from 'appwrite'

interface Expense {
  $id: string
  amount: number
  description: string
  paidBy: string
  date: string
  category: string
}

interface Settlement {
  $id: string
  from: string
  to: string
  amount: number
  date: string
}

export default function GroupHistory({ params }: { params: { id: string } }) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [category, setCategory] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        await account.get()
        fetchExpenses()
        fetchSettlements()
      } catch (error) {
        router.push('/login')
      }
    }

    checkSession()
  }, [router])

  const fetchExpenses = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_EXPENSES_COLLECTION_ID!,
        [
          Query.equal('groupId', params.id),
          ...(dateRange.start ? [Query.greaterThanEqual('date', dateRange.start)] : []),
          ...(dateRange.end ? [Query.lessThanEqual('date', dateRange.end)] : []),
          ...(category ? [Query.equal('category', category)] : [])
        ]
      )
      setExpenses(response.documents)
    } catch (error) {
      console.error('Error fetching expenses:', error)
    }
  }

  const fetchSettlements = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_SETTLEMENTS_COLLECTION_ID!,
        [
          Query.equal('groupId', params.id),
          ...(dateRange.start ? [Query.greaterThanEqual('date', dateRange.start)] : []),
          ...(dateRange.end ? [Query.lessThanEqual('date', dateRange.end)] : [])
        ]
      )
      setSettlements(response.documents)
    } catch (error) {
      console.error('Error fetching settlements:', error)
    }
  }

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault()
    fetchExpenses()
    fetchSettlements()
  }

  const generateReport = () => {
    const report = {
      totalExpenses: expenses.reduce((sum, expense) => sum + expense.amount, 0),
      expensesByCategory: expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
      }, {} as { [key: string]: number }),
      totalSettlements: settlements.reduce((sum, settlement) => sum + settlement.amount, 0)
    }

    console.log('Generated Report:', report)
    // In a real application, you might want to display this report in a modal or download it as a PDF/CSV
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Expense History</h1>
      <form onSubmit={handleFilter} className="mb-8 space-y-4">
        <div className="flex space-x-4">
          <div>
            <label htmlFor="startDate" className="block">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block">End Date</label>
            <input
              type="date"
              id="endDate"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="category" className="block">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="">All Categories</option>
              <option value="food">Food</option>
              <option value="transportation">Transportation</option>
              <option value="accommodation">Accommodation</option>
              <option value="entertainment">Entertainment</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Apply Filters
        </button>
      </form>
      <button onClick={generateReport} className="mb-8 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
        Generate Report
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Expenses</h2>
          <ul className="space-y-4">
            {expenses.map((expense) => (
              <li key={expense.$id} className="bg-white shadow rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{expense.description}</h3>
                    <p className="text-gray-500">{new Date(expense.date).toLocaleDateString()} - {expense.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">${expense.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Paid by: {expense.paidBy}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Settlements</h2>
          <ul className="space-y-4">
            {settlements.map((settlement) => (
              <li key={settlement.$id} className="bg-white shadow rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{settlement.from} paid {settlement.to}</h3>
                    <p className="text-gray-500">{new Date(settlement.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">${settlement.amount.toFixed(2)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}