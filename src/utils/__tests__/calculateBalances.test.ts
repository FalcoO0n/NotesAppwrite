import { calculateBalances, getSettlements } from '../calculateBalances'

jest.mock('../currencyConversion', () => ({
  convertCurrency: jest.fn((amount) => Promise.resolve(amount)) // Mock currency conversion to return the same amount
}))

describe('calculateBalances', () => {
  it('should calculate balances correctly', async () => {
    const expenses = [
      { amount: 100, paidBy: 'Alice', currency: 'USD' },
      { amount: 60, paidBy: 'Bob', currency: 'USD' },
    ]
    const settlements = []
    const members = ['Alice', 'Bob', 'Charlie']

    const balances = await calculateBalances(expenses, settlements, members, 'USD')

    expect(balances).toEqual({
      Alice: { USD: 66.67 },
      Bob: { USD: 20 },
      Charlie: { USD: -86.67 }
    })
  })

  it('should handle settlements correctly', async () => {
    const expenses = [
      { amount: 100, paidBy: 'Alice', currency: 'USD' },
      { amount: 60, paidBy: 'Bob', currency: 'USD' },
    ]
    const settlements = [
      { from: 'Charlie', to: 'Alice', amount: 50, currency: 'USD' }
    ]
    const members = ['Alice', 'Bob', 'Charlie']

    const balances = await calculateBalances(expenses, settlements, members, 'USD')

    expect(balances).toEqual({
      Alice: { USD: 116.67 },
      Bob: { USD: 20 },
      Charlie: { USD: -136.67 }
    })
  })
})

describe('getSettlements', () => {
  it('should suggest correct settlements', async () => {
    const balances = {
      Alice: { USD: 50 },
      Bob: { USD: -30 },
      Charlie: { USD: -20 }
    }

    const settlements = await getSettlements(balances, 'USD')

    expect(settlements).toEqual([
      { from: 'Bob', to: 'Alice', amount: 30, currency: 'USD' },
      { from: 'Charlie', to: 'Alice', amount: 20, currency: 'USD' }
    ])
  })
})