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
    culture: number // 0..100
    nature: number // 0..100
    party: number // 0..100
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
  userId?: string
}

export type CurrencyRates = {
  USD: number
  EUR: number
  TRY: number
  GEL: number
  RUB: number
  PLN: number
  CZK: number
  HUF: number
  RON: number
  BGN: number
  RSD: number
  HRK: number
  ALL: number
  MKD: number
  UAH: number
  BYN: number
  MDL: number
  LTL: number
  LVL: number
  EEK: number
}

export type User = {
  id: string
  email: string
  password: string
  name: string
  createdAt: string
}

export type AuthRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  email: string
  password: string
  name: string
}

export type AuthResponse = {
  success: boolean
  token?: string
  user?: {
    id: string
    email: string
    name: string
  }
  error?: string
}

export type TravelBotRequest = {
  question: string
  country?: string
  origin?: string
  city?: {
    name: string
    country?: string
  }
  budget?: number
  budgetBreakdown?: {
    flights: number
    lodging: number
    food: number
    local: number
    buffer: number
  }
  preferences?: {
    culture?: number
    nature?: number
    party?: number
  }
  startDate?: string
  endDate?: string
  changeEvent?: {
    key: 'flights' | 'lodging' | 'food' | 'local' | 'buffer'
    oldValue: number
    newValue: number
  }
}

export type TravelBotResponse = {
  answer: string
}

export type RebalanceRequest = {
  budget: number
  current: BudgetBreakdown
  lock: Array<'flights' | 'lodging' | 'food' | 'local' | 'buffer'>
  city?: { name: string; country?: string }
  preferences?: { culture?: number; nature?: number; party?: number }
  chatContext?: string // optional: last assistant suggestions text
}

export type RebalanceResponse = {
  breakdown: BudgetBreakdown
  note?: string
}
