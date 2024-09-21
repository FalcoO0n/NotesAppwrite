import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ExpenseForm from '../ExpenseForm'

describe('ExpenseForm', () => {
  const mockOnAddExpense = jest.fn()

  beforeEach(() => {
    render(<ExpenseForm groupId="123" onAddExpense={mockOnAddExpense} />)
  })

  it('renders the form correctly', () => {
    expect(screen.getByText('Add Expense')).toBeInTheDocument()
    expect(screen.getByLabelText('Amount')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Paid By')).toBeInTheDocument()
    expect(screen.getByLabelText('Date')).toBeInTheDocument()
    expect(screen.getByLabelText('Category')).toBeInTheDocument()
    expect(screen.getByLabelText('Currency')).toBeInTheDocument()
  })

  it('submits the form with correct data', () => {
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '50' } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Dinner' } })
    fireEvent.change(screen.getByLabelText('Paid By'), { target: { value: 'Alice' } })
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2023-05-01' } })
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'food' } })
    fireEvent.change(screen.getByLabelText('Currency'), { target: { value: 'EUR' } })

    fireEvent.click(screen.getByText('Add Expense'))

    expect(mockOnAddExpense).toHaveBeenCalledWith({
      amount: 50,
      description: 'Dinner',
      paidBy: 'Alice',
      date: '2023-05-01',
      category: 'food',
      currency: 'EUR'
    })
  })
})