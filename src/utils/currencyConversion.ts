const API_KEY = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY

export async function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
  try {
    const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${fromCurrency}/${toCurrency}/${amount}`)
    const data = await response.json()
    
    if (data.result === 'success') {
      return data.conversion_result
    } else {
      throw new Error('Currency conversion failed')
    }
  } catch (error) {
    console.error('Error converting currency:', error)
    return amount // Return the original amount if conversion fails
  }
}