import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import pinoHttp from 'pino-http'
import { corsMiddleware } from './middleware/cors'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { metricsMiddleware, getMetrics, getPrometheusMetrics } from './middleware/metrics'
import { logger } from './utils/logger'
import { logStartup } from './utils/startupLog'
import cityRoutes from './routes/cityRoutes'
import tripRoutes from './routes/tripRoutes'
import currencyRoutes from './routes/currencyRoutes'
import travelBotRoutes from './routes/travelBotRoutes'
import authRoutes from './routes/authRoutes'

const app = express()
const PORT = process.env.PORT || 5000

// Security
app.use(helmet())

// CORS (single source of truth — defined in middleware/cors.ts)
app.use(corsMiddleware)

// Structured HTTP logging
app.use(
  pinoHttp({
    logger,
    customLogLevel: (_req, res) => (res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'),
    customSuccessMessage: (req, res) => `${req.method} ${req.url} → ${res.statusCode}`,
    autoLogging: { ignore: (req) => req.url === '/health' },
  }),
)

// Metrics collection
app.use(metricsMiddleware)

// Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API routes
app.use('/api/cities', cityRoutes)
app.use('/api/trips', tripRoutes)
app.use('/api/currencies', currencyRoutes)
app.use('/api/travelbot', travelBotRoutes)
app.use('/api/auth', authRoutes)

// Health check (silent in logs)
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
})

// Metrics endpoints
app.get('/metrics', (_req, res) => {
  res.json(getMetrics())
})

app.get('/metrics/prometheus', (_req, res) => {
  res.set('Content-Type', 'text/plain; version=0.0.4')
  res.send(getPrometheusMetrics())
})

app.use(notFoundHandler)
app.use(errorHandler)

app.listen(PORT, () => {
  logStartup(PORT)
})

export default app
