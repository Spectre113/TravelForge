import { logger } from './logger'

export function logStartup(port: number | string): void {
  const mem = process.memoryUsage()
  const env = process.env.NODE_ENV ?? 'development'

  logger.info(
    {
      port,
      env,
      node: process.version,
      pid: process.pid,
      memory: {
        heapUsedMb: +(mem.heapUsed / 1024 / 1024).toFixed(1),
        heapTotalMb: +(mem.heapTotal / 1024 / 1024).toFixed(1),
      },
      config: {
        gigachat: Boolean(process.env.GIGACHAT_CLIENT_ID),
        jwtConfigured: process.env.JWT_SECRET !== 'your-secret-key-change-in-production',
        allowedOrigins: process.env.ALLOWED_ORIGINS ?? 'localhost:3000 (default)',
        logLevel: process.env.LOG_LEVEL ?? 'info',
      },
    },
    'TravelForge API started',
  )

  logger.info(`  Health:    http://localhost:${port}/health`)
  logger.info(`  Metrics:   http://localhost:${port}/metrics`)
  logger.info(`  Prometheus:http://localhost:${port}/metrics/prometheus`)
  logger.info(`  API:       http://localhost:${port}/api`)

  if (!process.env.GIGACHAT_CLIENT_ID) {
    logger.warn('GIGACHAT_CLIENT_ID not set — TravelBot will use deterministic fallback only')
  }
  if (env === 'production' && process.env.JWT_SECRET === 'your-secret-key-change-in-production') {
    logger.error('SECURITY: JWT_SECRET is using the default insecure value in production!')
  }
}
