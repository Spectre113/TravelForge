import {
  City,
  SavedTrip,
  CurrencyRates,
  TravelBotResponse,
  TravelBotRequest,
  BudgetBreakdown,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from '../types'

const API_BASE_URL =
  process.env.REACT_APP_API_URL ?? 'http://localhost:5000/api'

const TOKEN_KEY = 'budget-compass.auth.token'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const token = this.getAuthToken()

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)
    const data: ApiResponse<T> = await response.json()

    if (!response.ok || !data.success) {
      const message = data.error ?? `HTTP ${response.status}`
      const err = new Error(message) as Error & { status: number }
      err.status = response.status
      console.error(`[API] ${options.method ?? 'GET'} ${endpoint} → ${response.status}: ${message}`)
      throw err
    }

    return data.data as T
  }

  private async requestAuth(endpoint: string, options: RequestInit = {}): Promise<AuthResponse> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    }

    const response = await fetch(url, config)
    const data: AuthResponse = await response.json()

    if (!response.ok || !data.success) {
      const err = new Error(data.error ?? 'Auth request failed') as Error & { response: AuthResponse }
      err.response = data
      throw err
    }

    return data
  }

  // ─── Cities ──────────────────────────────────────────────────────────────

  getCities(): Promise<City[]> {
    return this.request<City[]>('/cities')
  }

  getCityById(id: string): Promise<City> {
    return this.request<City>(`/cities/${id}`)
  }

  searchCities(params: {
    budget: number
    startDate: string
    endDate: string
    prefCulture?: number
    prefNature?: number
    prefParty?: number
  }): Promise<City[]> {
    const qs = new URLSearchParams({
      budget: params.budget.toString(),
      startDate: params.startDate,
      endDate: params.endDate,
      ...(params.prefCulture !== undefined && { prefCulture: params.prefCulture.toString() }),
      ...(params.prefNature !== undefined && { prefNature: params.prefNature.toString() }),
      ...(params.prefParty !== undefined && { prefParty: params.prefParty.toString() }),
    })
    return this.request<City[]>(`/cities/search?${qs}`)
  }

  // ─── Trips ───────────────────────────────────────────────────────────────

  getTrips(): Promise<SavedTrip[]> {
    return this.request<SavedTrip[]>('/trips')
  }

  getTripById(id: string): Promise<SavedTrip> {
    return this.request<SavedTrip>(`/trips/${id}`)
  }

  saveTrip(tripData: { cityId: string; params: any; adjustedBudget: any; total: number }): Promise<SavedTrip> {
    return this.request<SavedTrip>('/trips', { method: 'POST', body: JSON.stringify(tripData) })
  }

  deleteTrip(id: string): Promise<void> {
    return this.request<void>(`/trips/${id}`, { method: 'DELETE' })
  }

  // ─── Currency ─────────────────────────────────────────────────────────────

  getCurrencyRates(): Promise<CurrencyRates> {
    return this.request<CurrencyRates>('/currencies/rates')
  }

  convertCurrency(
    amount: number,
    from: string,
    to: string,
  ): Promise<{ amount: number; from: string; to: string; result: number }> {
    return this.request(`/currencies/convert?amount=${amount}&from=${from}&to=${to}`)
  }

  // ─── TravelBot ───────────────────────────────────────────────────────────

  askTravelBot(payload: TravelBotRequest): Promise<TravelBotResponse> {
    return this.request<TravelBotResponse>('/travelbot/ask', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  rebalanceBudget(payload: {
    budget: number
    current: BudgetBreakdown
    lock: Array<'flights' | 'lodging' | 'food' | 'local' | 'buffer'>
    city?: { name: string; country?: string }
    preferences?: { culture?: number; nature?: number; party?: number }
    chatContext?: string
  }): Promise<{ breakdown: BudgetBreakdown; note?: string }> {
    return this.request('/travelbot/rebalance', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  // ─── Auth ─────────────────────────────────────────────────────────────────

  login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.requestAuth('/auth/login', { method: 'POST', body: JSON.stringify(credentials) })
  }

  register(data: RegisterRequest): Promise<AuthResponse> {
    return this.requestAuth('/auth/register', { method: 'POST', body: JSON.stringify(data) })
  }

  getProfile(): Promise<User> {
    return this.request<User>('/auth/profile')
  }
}

export const apiService = new ApiService()
