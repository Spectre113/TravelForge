import { Router } from 'express'
import { TripController } from '../controllers/TripController'
import { optionalAuth } from '../middleware/auth'

const router = Router()

router.get('/', optionalAuth, TripController.getAllTrips)
router.get('/:id', optionalAuth, TripController.getTripById)
router.post('/', optionalAuth, TripController.saveTrip)
router.delete('/:id', optionalAuth, TripController.deleteTrip)

export default router
