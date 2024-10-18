'use client'

import { useState } from 'react'

interface ExpenseFormProps {
  groupId: string
  members: string[]
  onAddExpense: (expense: {
    amount: number
    description: string
    paidBy: string
    date: string
    category: string
    currency: string
  }) => void
}

const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'] // Add more currencies as needed

export default function ExpenseForm({ groupId, onAddExpense, members }: ExpenseFormProps) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('')
  const [currency, setCurrency] = useState('USD')

  // console.log(members, "members")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddExpense({
      amount: parseFloat(amount),
      description,
      paidBy,
      date,
      category,
      currency,
    })
    setAmount('')
    setDescription('')
    setPaidBy('')
    setDate('')
    setCategory('')
    setCurrency('USD')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold">Add Expense</h2>
      <div className="flex space-x-2">
        <div className="flex-grow">
          <label htmlFor="amount" className="block">Amount</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="currency" className="block">Currency</label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          >
            {currencies.map((curr) => (
              <option key={curr} value={curr}>{curr}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="description" className="block">Description</label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label htmlFor="paidBy" className="block">Paid By</label>
        <select
          id="paidBy"
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        >
          {members.map((member) => (
            <option key={member} value={member}>{member}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="date" className="block">Date</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label htmlFor="category" className="block">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        >
          <option value="">Select a category</option>
          <option value="food">Food</option>
          <option value="transportation">Transportation</option>
          <option value="accommodation">Accommodation</option>
          <option value="entertainment">Entertainment</option>
          <option value="other">Other</option>
        </select>
      </div>
      <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
        Add Expense
      </button>
    </form>
  )
}