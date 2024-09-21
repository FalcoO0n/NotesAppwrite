interface Expense {
  $id: string
  amount: number
  description: string
  paidBy: string
  date: string
  category: string
}

interface ExpenseListProps {
  expenses: Expense[]
}

export default function ExpenseList({ expenses }: ExpenseListProps) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Expenses</h2>
      {expenses.length === 0 ? (
        <p>No expenses recorded yet.</p>
      ) : (
        <ul className="space-y-4">
          {expenses.map((expense) => (
            <li key={expense.$id} className="bg-white shadow rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{expense.description}</h3>
                  <p className="text-gray-500">{expense.date} - {expense.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">${expense.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Paid by: {expense.paidBy}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}