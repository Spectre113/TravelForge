import React, { useMemo, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useBudget } from '../context/BudgetContext'
import { apiService } from '../services/api'
import { City } from '../types'
import BudgetPie from '../components/BudgetPie'
import BudgetSlider from '../components/BudgetSlider'
import CurrencyConverter from '../components/CurrencyConverter'
import TravelBot from '../components/TravelBot'
import Toast from '../components/Toast'

function clamp01(x: number) {
  return Math.max(0, Math.min(100, x))
}

export default function CityDetail() {
  const [showToast, setShowToast] = useState(false)
  const [city, setCity] = useState<City | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { id } = useParams()
  const { params, setParams, adjusted, setAdjusted, saveTrip } = useBudget()
  const [budgetInput, setBudgetInput] = useState<string>(params.budget.toString())

  // Синхронизируем локальное состояние с глобальным
  useEffect(() => {
    setBudgetInput(params.budget.toString())
  }, [params.budget])

  useEffect(() => {
    const loadCity = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError(null)
        const cityData = await apiService.getCityById(id)
        setCity(cityData)
      } catch (err) {
        console.error('Failed to load city:', err)
        setError('Не удалось загрузить информацию о городе')
      } finally {
        setLoading(false)
      }
    }

    loadCity()
  }, [id])

  const total = useMemo(() => params.budget, [params.budget])
  const apply = (key: keyof typeof adjusted) => (v: number) =>
    setAdjusted({ [key]: clamp01(v) } as any)
  const sum =
    adjusted.flights +
    adjusted.lodging +
    adjusted.food +
    adjusted.local +
    adjusted.buffer
  const overBudget = sum > 100

  if (loading) {
    return <div className="card">Загрузка информации о городе...</div>
  }

  if (error) {
    return (
      <div className="card" style={{ color: 'red' }}>
        {error}
      </div>
    )
  }

  if (!city) {
    return <div className="card">Город не найден</div>
  }

  return (
    <div className="city-detail-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--space-xl) var(--space-xl)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
        <h1 className="city-detail-title" style={{ marginBottom: 'var(--space-sm)', fontSize: '2.5rem' }}>{city.name}</h1>
        <div className="chips" style={{ justifyContent: 'center' }}>
          <span className="chip">{city.country}</span>
        </div>
      </div>
      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
          <TravelBot city={city} />
        </div>
        <div className="grid" style={{ gap: 'var(--space-sm)' }}>
          <BudgetPie b={adjusted} />
          <div className="grid cols-2" style={{ gap: 'var(--space-md)' }}>
            <BudgetSlider
              label="Перелёты"
              value={adjusted.flights}
              onChange={apply('flights')}
            />
            <BudgetSlider
              label="Жильё"
              value={adjusted.lodging}
              onChange={apply('lodging')}
            />
            <BudgetSlider
              label="Еда"
              value={adjusted.food}
              onChange={apply('food')}
            />
            <BudgetSlider
              label="Местное"
              value={adjusted.local}
              onChange={apply('local')}
            />
            <div></div>
            <BudgetSlider
              label="Резерв"
              value={adjusted.buffer}
              onChange={apply('buffer')}
            />
          </div>
        </div>
        {overBudget && (
          <div className="card" style={{ background: '#fff4f4', border: '1px solid #f5c2c7', marginTop: 'var(--space-lg)', gridColumn: '1 / -1' }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Вы вышли за рамки бюджета</div>
            <div style={{ marginBottom: 8 }}>Сумма категорий {sum}% превышает 100%. Вы можете изменить общий бюджет или переформировать проценты в чате.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label className="label">Изменить бюджет</label>
              <input
                className="input"
                type="number"
                value={budgetInput}
                onChange={(e) => {
                  const val = e.target.value
                  setBudgetInput(val)
                  if (val === '' || val === '-') return
                  const num = Number(val)
                  if (!Number.isNaN(num) && num >= 0) {
                    setParams({ budget: num })
                  }
                }}
                onBlur={(e) => {
                  const val = e.target.value
                  if (val === '' || val === '-' || Number(val) < 0) {
                    setBudgetInput(params.budget.toString())
                  }
                }}
                style={{ maxWidth: 160 }}
              />
            </div>
          </div>
        )}
        <div className="card" style={{ marginTop: 'var(--space-lg)', gridColumn: '1 / -1' }}>
          <div className="label" style={{ textAlign: 'center', fontSize: '1.125rem' }}>Проверка суммы</div>
          <div style={{ paddingLeft: 'var(--space-sm)' }}>
            Сумма процентов: <b>{sum}%</b>
          </div>
          <div style={{ marginTop: 8, paddingLeft: 'var(--space-sm)' }}>
            Итого бюджет: <b>${total}</b>
          </div>
          <div className="grid cols-2" style={{ marginTop: 8 }}>
            <div className="card">
              <div className="label">Оценка по категориям</div>
              <ul>
                <li>
                  Перелёты: ${Math.round((total * adjusted.flights) / 100)}
                </li>
                <li>Жильё: ${Math.round((total * adjusted.lodging) / 100)}</li>
                <li>Еда: ${Math.round((total * adjusted.food) / 100)}</li>
                <li>Местное: ${Math.round((total * adjusted.local) / 100)}</li>
                <li>Резерв: ${Math.round((total * adjusted.buffer) / 100)}</li>
              </ul>
            </div>
            <CurrencyConverter />
          </div>
          <button
            className="btn"
            style={{ marginTop: 'var(--space-lg)' }}
            onClick={() => {
              saveTrip({
                cityId: city.id,
                params,
                adjustedBudget: adjusted,
                total,
              })
              setShowToast(true)
            }}
          >
            Сохранить вариант
          </button>
        </div>
      </div>

      {showToast && (
        <Toast
          title="Сохранено"
          text="Вариант добавлен в список"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  )
}
