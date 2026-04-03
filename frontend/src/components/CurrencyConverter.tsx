import React, { useMemo, useState, useEffect } from 'react'
import { apiService } from '../services/api'

export default function CurrencyConverter() {
  const [from, setFrom] = useState<'USD' | 'EUR' | 'TRY' | 'GEL'>('USD')
  const [to, setTo] = useState<'USD' | 'EUR' | 'TRY' | 'GEL'>('EUR')
  const [amount, setAmount] = useState(100)
  const [rates, setRates] = useState({ USD: 1, EUR: 0.92, TRY: 34, GEL: 2.7 })

  useEffect(() => {
    const loadRates = async () => {
      try {
        const ratesData = await apiService.getCurrencyRates()
        setRates(ratesData)
      } catch (error) {
        console.error('Failed to load currency rates:', error)
      }
    }
    loadRates()
  }, [])

  const result = useMemo(
    () => (amount / rates[from]) * rates[to],
    [from, to, amount, rates],
  )

  return (
    <div className="card">
      <div className="grid cols-3" style={{ alignItems: 'end' }}>
        <div>
          <div className="label">Сумма</div>
          <input
            className="input"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>
        <div>
          <div className="label">Из</div>
          <select
            className="input"
            value={from}
            onChange={(e) => setFrom(e.target.value as any)}
          >
            {Object.keys(rates).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="label">В</div>
          <select
            className="input"
            value={to}
            onChange={(e) => setTo(e.target.value as any)}
          >
            {Object.keys(rates).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ marginTop: 12, fontWeight: 700 }}>
        ≈ {result.toFixed(2)} {to}
      </div>
    </div>
  )
}
