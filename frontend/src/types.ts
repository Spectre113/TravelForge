export type CityId = string

export type BudgetBreakdown = {
  flights: number
  lodging: number
  food: number
  local: number // транспорт и развлечения
  buffer: number
}

export type City = {
  id: CityId
  name: string
  country: string
  lat: number
  lng: number
  avgDailyCost: number // усредненная дневная стоимость
  mockBudget: BudgetBreakdown // базовое распределение
  image?: string
  scores?: {
    culture: number
    nature: number
    party: number
  }
}

export type SearchParams = {
  budget: number
  startDate: string
  endDate: string
  origin: string
  prefCulture: number // 0..100
  prefNature: number
  prefParty: number
}

export type SavedTrip = {
  id: string // uuid
  cityId: CityId
  params: SearchParams
  adjustedBudget: BudgetBreakdown
  total: number
  savedAt: string
}

export type CurrencyRates = {
  USD: number
  EUR: number
  TRY: number
  GEL: number
}

export type TravelBotRequest = {
  question: string
  country?: string
  origin?: string
  city?: { name: string; country?: string }
  budget?: number
  budgetBreakdown?: BudgetBreakdown
  preferences?: { culture?: number; nature?: number; party?: number }
  startDate?: string
  endDate?: string
  changeEvent?: { key: 'flights' | 'lodging' | 'food' | 'local' | 'buffer'; oldValue: number; newValue: number }
}

export type TravelBotResponse = {
  answer: string
}

export type User = {
  id: string
  email: string
  name: string
}

export type AuthResponse = {
  success: boolean
  token?: string
  user?: User
  error?: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  email: string
  password: string
  name: string
}
