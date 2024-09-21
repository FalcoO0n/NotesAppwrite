import { convertCurrency } from './currencyConversion'

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

interface Balance {
  [key: string]: { [currency: string]: number }
}

export async function calculateBalances(expenses: Expense[], settlements: Settlement[], members: string[], baseCurrency: string = 'USD'): Promise<Balance> {
  const balances: Balance = {}
  members.forEach(member => balances[member] = { [baseCurrency]: 0 })

  /**
   * Calculates the initial balances for each member based on the expenses.
   * 
   * Iterates through each expense and distributes the cost equally among all members.
   * The payer of the expense is credited with the full amount, while each other member
   * is debited with their share. All amounts are converted to the base currency.
   * 
   * @param expenses An array of expenses.
   * @param members An array of member names.
   * @param baseCurrency The base currency for calculations.
   * @param balances The object to store the calculated balances.
   */
  for (const expense of expenses) {
    const share = expense.amount / members.length
    const convertedShare = await convertCurrency(share, expense.currency, baseCurrency)
    const convertedAmount = await convertCurrency(expense.amount, expense.currency, baseCurrency)

    if (!balances[expense.paidBy][baseCurrency]) {
      balances[expense.paidBy][baseCurrency] = 0
    }
    balances[expense.paidBy][baseCurrency] += convertedAmount - convertedShare

    for (const member of members) {
      if (member !== expense.paidBy) {
        if (!balances[member][baseCurrency]) {
          balances[member][baseCurrency] = 0
        }
        balances[member][baseCurrency] -= convertedShare
      }
    }
  }

  for (const settlement of settlements) {
    const convertedAmount = await convertCurrency(settlement.amount, settlement.currency, baseCurrency)
    
    if (!balances[settlement.from][baseCurrency]) {
      balances[settlement.from][baseCurrency] = 0
    }
    balances[settlement.from][baseCurrency] -= convertedAmount

    if (!balances[settlement.to][baseCurrency]) {
      balances[settlement.to][baseCurrency] = 0
    }
    balances[settlement.to][baseCurrency] += convertedAmount
  }

  return balances
}


export async function getSettlements(balances: Balance, baseCurrency: string = 'USD'): Promise<{ from: string; to: string; amount: number; currency: string }[]> {
  const settlements: { from: string; to: string; amount: number; currency: string }[] = []
  const debtors = Object.entries(balances).filter(([, balance]) => balance[baseCurrency] < 0)
  const creditors = Object.entries(balances).filter(([, balance]) => balance[baseCurrency] > 0)

  debtors.sort((a, b) => a[1][baseCurrency] - b[1][baseCurrency])
  creditors.sort((a, b) => b[1][baseCurrency] - a[1][baseCurrency])

  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const [debtor, debtAmount] = debtors[i]
    const [creditor, creditAmount] = creditors[j]
    const settlementAmount = Math.min(-debtAmount[baseCurrency], creditAmount[baseCurrency])

    settlements.push({
      from: debtor,
      to: creditor,
      amount: Number(settlementAmount.toFixed(2)),
      currency: baseCurrency
    })

    debtors[i][1][baseCurrency] += settlementAmount
    creditors[j][1][baseCurrency] -= settlementAmount

    if (debtors[i][1][baseCurrency] === 0) i++
    if (creditors[j][1][baseCurrency] === 0) j++
  }

  return settlements
}