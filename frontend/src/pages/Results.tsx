import React, { useMemo, useState, useEffect } from 'react'
import MapView from '../components/MapView'
import CityCard from '../components/CityCard'
import { useBudget } from '../context/BudgetContext'
import { apiService } from '../services/api'
import { City } from '../types'

function daysBetween(a: string, b: string) {
  return Math.max(
    1,
    Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000),
  )
}

export default function Results() {
  const { params } = useBudget()
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoading(true)
        setError(null)
        const searchResults = await apiService.searchCities(params)
        setCities(searchResults)
      } catch (err) {
        console.error('Failed to load cities:', err)
        setError('Не удалось загрузить города')
      } finally {
        setLoading(false)
      }
    }

    loadCities()
  }, [params])

  const { list, leftPct } = useMemo(() => {
    const days = daysBetween(params.startDate, params.endDate)
    const totals = cities.map((c) => ({ c, total: days * c.avgDailyCost }))
    return {
      list: totals,
      leftPct: (total: number) => Math.min(100, (params.budget / total) * 100),
    }
  }, [cities, params])

  if (loading) {
    return <div className="card">Загрузка городов...</div>
  }

  if (error) {
    return (
      <div className="card" style={{ color: 'red' }}>
        {error}
      </div>
    )
  }

  return (
    <div className="city-detail-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: 'var(--space-xl) var(--space-xl)' }}>
      <div className="grid cols-2">
        <div className="results-map-container" style={{ position: 'sticky', top: 'calc(60px + var(--space-md))', alignSelf: 'start', maxHeight: 'calc(100vh - 80px)' }}>
          <MapView cities={cities} />
        </div>
        <div className="grid">
          {[...list]
            .map((it) => {
            const s = it.c.scores || { culture: 60, nature: 60, party: 60 }
            const sum = Math.max(1, params.prefCulture + params.prefNature + params.prefParty)
            const wC = params.prefCulture / sum
            const wN = params.prefNature / sum
            const wP = params.prefParty / sum
            const weighted = Math.round(s.culture * wC + s.nature * wN + s.party * wP)
            return { it, match: { culture: s.culture, nature: s.nature, party: s.party, weighted } }
          })
          .sort((a, b) => b.match.weighted - a.match.weighted)
          .map(({ it, match }) => (
            <CityCard
              key={it.c.id}
              city={it.c}
              budgetLeftPct={leftPct(it.total)}
              match={match}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
