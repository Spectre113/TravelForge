import { Router } from 'express'
import { CityController } from '../controllers/CityController'

const router = Router()

router.get('/', CityController.getAllCities)
router.get('/search', CityController.searchCities)
router.get('/:id', CityController.getCityById)

export default router
