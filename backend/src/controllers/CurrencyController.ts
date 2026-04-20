import { Request, Response } from 'express'
import { CurrencyModel } from '../models/CurrencyModel'

export class CurrencyController {
  static async getRates(req: Request, res: Response): Promise<void> {
    try {
      const rates = CurrencyModel.getRates()
      res.json({
        success: true,
        data: rates,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch currency rates',
      })
    }
  }

  static async convertCurrency(req: Request, res: Response): Promise<void> {
    try {
      const { amount, from, to } = req.query

      if (!amount || !from || !to) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters: amount, from, to',
        })
        return
      }

      const result = CurrencyModel.convertCurrency(
        Number(amount),
        from as any,
        to as any,
      )

      res.json({
        success: true,
        data: {
          amount: Number(amount),
          from,
          to,
          result,
        },
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to convert currency',
      })
    }
  }
}
