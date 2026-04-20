import { Request, Response } from 'express'
import { TripModel } from '../models/TripModel'
import { SavedTrip, SearchParams, BudgetBreakdown } from '../types'
import { AuthenticatedRequest } from '../middleware/auth'

export class TripController {
  static async getAllTrips(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId
      
      const trips = userId 
        ? TripModel.getTripsByUserId(userId)
        : TripModel.getAllTrips().filter(trip => !trip.userId)
        
      res.json({
        success: true,
        data: trips,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch trips',
      })
    }
  }

  static async getTripById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const userId = (req as AuthenticatedRequest).userId
      const trip = TripModel.getTripById(id)

      if (!trip) {
        res.status(404).json({
          success: false,
          error: 'Trip not found',
        })
        return
      }

      if (trip.userId && trip.userId !== userId) {
        res.status(403).json({
          success: false,
          error: 'Access denied',
        })
        return
      }

      res.json({
        success: true,
        data: trip,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch trip',
      })
    }
  }

  static async saveTrip(req: Request, res: Response): Promise<void> {
    try {
      const { cityId, params, adjustedBudget, total } = req.body
      const userId = (req as AuthenticatedRequest).userId

      if (!cityId || !params || !adjustedBudget || !total) {
        res.status(400).json({
          success: false,
          error:
            'Missing required fields: cityId, params, adjustedBudget, total',
        })
        return
      }

      const trip = TripModel.saveTrip({
        cityId,
        params: params as SearchParams,
        adjustedBudget: adjustedBudget as BudgetBreakdown,
        total: Number(total),
        userId,
      })

      res.status(201).json({
        success: true,
        data: trip,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to save trip',
      })
    }
  }

  static async deleteTrip(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const userId = (req as AuthenticatedRequest).userId
      const deleted = TripModel.deleteTrip(id, userId)

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Trip not found or access denied',
        })
        return
      }

      res.json({
        success: true,
        message: 'Trip deleted successfully',
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete trip',
      })
    }
  }
}
