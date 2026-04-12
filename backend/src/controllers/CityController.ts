import { Request, Response } from 'express'
import { CityModel } from '../models/CityModel'

export class CityController {
  static async getAllCities(req: Request, res: Response): Promise<void> {
    try {
      const cities = CityModel.getAllCities()
      res.json({
        success: true,
        data: cities,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch cities',
      })
    }
  }

  static async getCityById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const city = CityModel.getCityById(id)

      if (!city) {
        res.status(404).json({
          success: false,
          error: 'City not found',
        })
        return
      }

      res.json({
        success: true,
        data: city,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch city',
      })
    }
  }

  static async searchCities(req: Request, res: Response): Promise<void> {
    try {
      const { budget, startDate, endDate, prefCulture, prefNature, prefParty } =
        req.query

      if (!budget || !startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters: budget, startDate, endDate',
        })
        return
      }

      const searchParams = {
        budget: Number(budget),
        startDate: startDate as string,
        endDate: endDate as string,
        prefCulture: Number(prefCulture) || 50,
        prefNature: Number(prefNature) || 50,
        prefParty: Number(prefParty) || 50,
      }

      const cities = CityModel.searchCities(searchParams)

      res.json({
        success: true,
        data: cities,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to search cities',
      })
    }
  }
}
