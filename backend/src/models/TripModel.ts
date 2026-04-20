import { SavedTrip, SearchParams, BudgetBreakdown } from '../types'
import { v4 as uuidv4 } from 'uuid'

export class TripModel {
  private static trips: SavedTrip[] = []

  static getAllTrips(): SavedTrip[] {
    return [...this.trips]
  }

  static getTripById(id: string): SavedTrip | undefined {
    return this.trips.find((trip) => trip.id === id)
  }

  static saveTrip(tripData: {
    cityId: string
    params: SearchParams
    adjustedBudget: BudgetBreakdown
    total: number
    userId?: string
  }): SavedTrip {
    const trip: SavedTrip = {
      id: uuidv4(),
      cityId: tripData.cityId,
      params: tripData.params,
      adjustedBudget: tripData.adjustedBudget,
      total: tripData.total,
      savedAt: new Date().toISOString(),
      userId: tripData.userId,
    }

    this.trips.unshift(trip)
    return trip
  }

  static deleteTrip(id: string, userId?: string): boolean {
    const trip = this.trips.find((trip) => trip.id === id)
    
    if (userId && trip?.userId && trip.userId !== userId) {
      return false
    }

    const index = this.trips.findIndex((trip) => trip.id === id)
    if (index !== -1) {
      this.trips.splice(index, 1)
      return true
    }
    return false
  }

  static getTripsByCityId(cityId: string): SavedTrip[] {
    return this.trips.filter((trip) => trip.cityId === cityId)
  }

  static getTripsByUserId(userId: string): SavedTrip[] {
    return this.trips.filter((trip) => trip.userId === userId)
  }
}
