'use client'

import { useState, useEffect } from 'react'
import { calculateBalances, getSettlements } from '@/utils/calculateBalances'

interface Expense {
  amount: number
  paidBy: string
  currency: string
}

interface Settlement {
  from: string
  to: string
  amount: number
  currency: string
}

interface BalanceSummaryProps {
  expenses: Expense[]
  settlements: Settlement[]
  members: string[]
}

export default function BalanceSummary({ expenses, settlements, members }: BalanceSummaryProps) {
  const [balances, setBalances] = useState<any>({})
  const [suggestedSettlements, setSuggestedSettlements] = useState<any[]>([])
  const [baseCurrency, setBaseCurrency] = useState('USD')

  useEffect(() => {
    const updateBalances = async () => {
      const calculatedBalances = await calculateBalances(expenses, settlements, members, baseCurrency)
      setBalances(calculatedBalances)
      const calculatedSettlements = await getSettlements(calculatedBalances, baseCurrency)
      setSuggestedSettlements(calculatedSettlements)
    }

    updateBalances()
  }, [expenses, settlements, members, baseCurrency])

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Balance Summary</h2>
      <div className="mb-4">
        <label htmlFor="baseCurrency" className="block mb-2">Base Currency</label>
        <select
          id="baseCurrency"
          value={baseCurrency}
          onChange={(e) => setBaseCurrency(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="JPY">JPY</option>
          {/* Add more currency options as needed */}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-2">Individual Balances</h3>
          <ul className="space-y-2">
            {Object.entries(balances).map(([member, balance]: [string, any]) => (
              <li key={member} className="flex justify-between">
                <span>{member}</span>
                <span className={balance[baseCurrency] >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {balance[baseCurrency].toFixed(2)} {baseCurrency}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Suggested Settlements</h3>
          {suggestedSettlements.length === 0 ? (
            <p>No settlements needed.</p>
          ) : (
            <ul className="space-y-2">
              {suggestedSettlements.map((settlement, index) => (
                <li key={index}>
                  {settlement.from} pays {settlement.to} {settlement.amount.toFixed(2)} {settlement.currency}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}