import { Router } from 'express'
import { TravelBotController } from '../controllers/TravelBotController'

const router = Router()

router.post('/ask', TravelBotController.askQuestion)
router.post('/rebalance', TravelBotController.rebalance)

export default router
