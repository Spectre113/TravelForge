import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useBudget } from '../context/BudgetContext'
import { apiService } from '../services/api'
import { City } from '../types'

export default function SavedTrips() {
  const { saved, removeTrip } = useBudget()
  const [cities, setCities] = useState<City[]>([])

  useEffect(() => {
    const loadCities = async () => {
      try {
        const citiesData = await apiService.getCities()
        setCities(citiesData)
      } catch (error) {
        console.error('Failed to load cities:', error)
      }
    }
    loadCities()
  }, [])

  const cityName = (id: string) => cities.find((c) => c.id === id)?.name || id

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--space-xl) var(--space-xl)' }}>
      <div className="card">
        <div className="label" style={{ marginBottom: 16, fontSize: '1.125rem', textAlign: 'center' }}>
          Сохранённые поездки
        </div>
        {saved.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--text-secondary)' }}>
            У вас пока нет сохранённых поездок
          </div>
        )}
        {saved.length > 0 && (
          <>
            <table className="table table--desktop">
              <thead>
                <tr>
                  <th>Город</th>
                  <th>Итого, $</th>
                  <th>Дата</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {saved.map((it) => (
                  <tr key={it.id}>
                    <td>
                      <Link className="link" to={`/city/${it.cityId}`}>
                        {cityName(it.cityId)}
                      </Link>
                    </td>
                    <td>{it.total}</td>
                    <td>{new Date(it.savedAt).toLocaleString()}</td>
                    <td>
                      <button
                        className="btn secondary"
                        onClick={() => removeTrip(it.id)}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="saved-trips-mobile">
              {saved.map((it) => (
                <div key={it.id} className="saved-trip-card">
                  <div className="saved-trip-card__header">
                    <Link className="link saved-trip-card__title" to={`/city/${it.cityId}`}>
                      {cityName(it.cityId)}
                    </Link>
                    <button
                      className="btn secondary saved-trip-card__delete"
                      onClick={() => removeTrip(it.id)}
                    >
                      Удалить
                    </button>
                  </div>
                  <div className="saved-trip-card__info">
                    <div className="saved-trip-card__info-item">
                      <span className="saved-trip-card__label">Итого:</span>
                      <span className="saved-trip-card__value">${it.total}</span>
                    </div>
                    <div className="saved-trip-card__info-item">
                      <span className="saved-trip-card__label">Дата:</span>
                      <span className="saved-trip-card__value">{new Date(it.savedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
