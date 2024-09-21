'use client'

import { useState } from 'react'

interface SettlementFormProps {
  members: string[]
  onSettle: (from: string, to: string, amount: number, currency: string) => void
}

const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'] // Add more currencies as needed

export default function SettlementForm({ members, onSettle }: SettlementFormProps) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (from && to && amount) {
      onSettle(from, to, parseFloat(amount), currency)
      setFrom('')
      setTo('')
      setAmount('')
      setCurrency('USD')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold mb-2">Record Settlement</h3>
      <div>
        <label htmlFor="from" className="block">From</label>
        <select
          id="from"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        >
          <option value="">Select a member</option>
          {members.map((member) => (
            <option key={member} value={member}>{member}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="to" className="block">To</label>
        <select
          id="to"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        >
          <option value="">Select a member</option>
          {members.map((member) => (
            <option key={member} value={member}>{member}</option>
          ))}
        </select>
      </div>
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
      <button type="submit" className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
        Record Settlement
      </button>
    </form>
  )
}