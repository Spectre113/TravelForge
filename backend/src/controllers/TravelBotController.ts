import { Request, Response } from 'express'
import { GigachatService } from '../services/GigachatService'
import { RebalanceRequest, TravelBotRequest } from '../types'

export class TravelBotController {
  static async askQuestion(req: Request, res: Response): Promise<void> {
    try {
      const { question, country, city, budget, budgetBreakdown, preferences, changeEvent } = req.body

      if (!question || typeof question !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Question is required and must be a string',
        })
        return
      }

      const request: TravelBotRequest = {
        question,
        country,
        city,
        budget,
        budgetBreakdown,
        preferences,
        changeEvent,
      }
      const response = await GigachatService.askQuestion(request)

      res.json({
        success: true,
        data: response,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to process question',
      })
    }
  }

  static async rebalance(req: Request, res: Response): Promise<void> {
    try {
      const body: RebalanceRequest = req.body
      if (!body || typeof body.budget !== 'number' || !body.current) {
        res.status(400).json({ success: false, error: 'Invalid request' })
        return
      }
      const result = await GigachatService.rebalanceBudget(body)
      res.json({ success: true, data: result })
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to rebalance' })
    }
  }
}
