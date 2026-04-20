import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react'
import { BudgetBreakdown, SavedTrip, SearchParams } from '../types'
import { apiService } from '../services/api'

const LS_KEY = 'budget-compass.savedTrips.v1'

type Ctx = {
  params: SearchParams
  setParams: (p: Partial<SearchParams>) => void
  adjusted: BudgetBreakdown
  setAdjusted: (b: Partial<BudgetBreakdown>) => void
  saved: SavedTrip[]
  saveTrip: (t: Omit<SavedTrip, 'id' | 'savedAt'>) => void
  removeTrip: (id: string) => void
}

const defaultParams: SearchParams = {
  budget: 1000,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5)
    .toISOString()
    .slice(0, 10),
  origin: 'Москва',
  prefCulture: 50,
  prefNature: 50,
  prefParty: 50,
}

const defaultBudget: BudgetBreakdown = {
  flights: 35,
  lodging: 30,
  food: 20,
  local: 10,
  buffer: 5,
}

const BudgetContext = createContext<Ctx | null>(null)

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [params, setParamsState] = useState<SearchParams>(defaultParams)
  const [adjusted, setAdjustedState] = useState<BudgetBreakdown>(defaultBudget)
  const [saved, setSaved] = useState<SavedTrip[]>([])

  useEffect(() => {
    const loadSavedTrips = async () => {
      try {
        const trips = await apiService.getTrips()
        setSaved(trips)
      } catch (error) {
        console.error('Failed to load saved trips:', error)
        try {
          const raw = localStorage.getItem(LS_KEY)
          if (raw) setSaved(JSON.parse(raw))
        } catch {}
      }
    }
    loadSavedTrips()
  }, [])

  useEffect(() => {
    let cancelled = false
    const detect = async () => {
      if (!('geolocation' in navigator)) return
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 3000,
            maximumAge: 60_000,
          }),
        )
        if (cancelled) return
        const { latitude, longitude } = pos.coords
        const cities = await apiService.getCities()
        if (!cities || !cities.length) return
        const dist = (aLat: number, aLng: number, bLat: number, bLng: number) => {
          const dLat = (aLat - bLat) * Math.PI / 180
          const dLng = (aLng - bLng) * Math.PI / 180
          const la1 = aLat * Math.PI / 180
          const la2 = bLat * Math.PI / 180
          const x = Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2
          return 2 * 6371 * Math.asin(Math.sqrt(x))
        }
        let best = cities[0]
        let bestD = dist(latitude, longitude, best.lat, best.lng)
        for (const c of cities) {
          const d = dist(latitude, longitude, c.lat, c.lng)
          if (d < bestD) { best = c; bestD = d }
        }
        setParamsState((prev) => ({ ...prev, origin: best.name }))
      } catch {
      }
    }
    detect()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(saved))
  }, [saved])

  const setParams = (p: Partial<SearchParams>) =>
    setParamsState((prev) => ({ ...prev, ...p }))
  const setAdjusted = (b: Partial<BudgetBreakdown>) =>
    setAdjustedState((prev) => ({ ...prev, ...b }))

  const saveTrip: Ctx['saveTrip'] = async (t) => {
    try {
      const savedTrip = await apiService.saveTrip(t)
      setSaved((prev) => [savedTrip, ...prev])
    } catch (error) {
      console.error('Failed to save trip:', error)
      const id = crypto.randomUUID()
      const savedAt = new Date().toISOString()
      setSaved((prev) => [{ id, savedAt, ...t }, ...prev])
    }
  }

  const removeTrip = async (id: string) => {
    try {
      await apiService.deleteTrip(id)
      setSaved((prev) => prev.filter((x) => x.id !== id))
    } catch (error) {
      console.error('Failed to delete trip:', error)
      setSaved((prev) => prev.filter((x) => x.id !== id))
    }
  }

  const value = useMemo(
    () => ({
      params,
      setParams,
      adjusted,
      setAdjusted,
      saved,
      saveTrip,
      removeTrip,
    }),
    [params, adjusted, saved],
  )
  return (
    <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
  )
}

export const useBudget = () => {
  const ctx = useContext(BudgetContext)
  if (!ctx) throw new Error('useBudget must be used within BudgetProvider')
  return ctx
}
