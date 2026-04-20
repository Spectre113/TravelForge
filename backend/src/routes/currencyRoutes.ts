import { Router } from 'express'
import { CurrencyController } from '../controllers/CurrencyController'

const router = Router()

router.get('/rates', CurrencyController.getRates)
router.get('/convert', CurrencyController.convertCurrency)

export default router
