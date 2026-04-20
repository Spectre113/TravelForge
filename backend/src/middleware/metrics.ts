import { Request, Response, NextFunction } from 'express'

interface RouteMetrics {
  count: number
  errors: number
  totalDurationMs: number
}

interface AppMetrics {
  startedAt: Date
  requestsTotal: number
  requestsSuccess: number
  /** 4xx — клиентские ошибки (неверный запрос, нет прав) */
  requestsClientError: number
  /** 5xx — серверные ошибки (баги, необработанные исключения) */
  requestsServerError: number
  routes: Record<string, RouteMetrics>
  latencyBuckets: Record<string, number>
}

const metrics: AppMetrics = {
  startedAt: new Date(),
  requestsTotal: 0,
  requestsSuccess: 0,
  requestsClientError: 0,
  requestsServerError: 0,
  routes: {},
  latencyBuckets: { '<50ms': 0, '<200ms': 0, '<500ms': 0, '<1000ms': 0, '>=1000ms': 0 },
}

function bucketLatency(ms: number): string {
  if (ms < 50) return '<50ms'
  if (ms < 200) return '<200ms'
  if (ms < 500) return '<500ms'
  if (ms < 1000) return '<1000ms'
  return '>=1000ms'
}

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startAt = process.hrtime.bigint()

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startAt) / 1e6
    const routeKey = `${req.method} ${req.route?.path ?? req.path}`

    metrics.requestsTotal++

    if (res.statusCode >= 500) {
      metrics.requestsServerError++
    } else if (res.statusCode >= 400) {
      metrics.requestsClientError++
    } else {
      metrics.requestsSuccess++
    }

    metrics.latencyBuckets[bucketLatency(durationMs)]++

    if (!metrics.routes[routeKey]) {
      metrics.routes[routeKey] = { count: 0, errors: 0, totalDurationMs: 0 }
    }
    metrics.routes[routeKey].count++
    metrics.routes[routeKey].totalDurationMs += durationMs
    if (res.statusCode >= 400) {
      metrics.routes[routeKey].errors++
    }
  })

  next()
}

export function getMetrics() {
  const uptimeSeconds = (Date.now() - metrics.startedAt.getTime()) / 1000

  const routeStats = Object.entries(metrics.routes).map(([route, rm]) => ({
    route,
    count: rm.count,
    errors: rm.errors,
    avgLatencyMs: rm.count > 0 ? +(rm.totalDurationMs / rm.count).toFixed(2) : 0,
    errorRate: rm.count > 0 ? +((rm.errors / rm.count) * 100).toFixed(1) : 0,
  }))

  return {
    startedAt: metrics.startedAt.toISOString(),
    uptimeSeconds: +uptimeSeconds.toFixed(0),
    requests: {
      total: metrics.requestsTotal,
      success: metrics.requestsSuccess,
      clientErrors: metrics.requestsClientError,
      serverErrors: metrics.requestsServerError,
      clientErrorRatePct:
        metrics.requestsTotal > 0
          ? +((metrics.requestsClientError / metrics.requestsTotal) * 100).toFixed(1)
          : 0,
      serverErrorRatePct:
        metrics.requestsTotal > 0
          ? +((metrics.requestsServerError / metrics.requestsTotal) * 100).toFixed(1)
          : 0,
    },
    latencyBuckets: metrics.latencyBuckets,
    routes: routeStats,
    memory: {
      heapUsedMb: +(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1),
      heapTotalMb: +(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(1),
      rssMb: +(process.memoryUsage().rss / 1024 / 1024).toFixed(1),
    },
  }
}

/** Prometheus text format export */
export function getPrometheusMetrics(): string {
  const m = getMetrics()
  const lines: string[] = [
    `# HELP travelforge_uptime_seconds Uptime in seconds`,
    `# TYPE travelforge_uptime_seconds gauge`,
    `travelforge_uptime_seconds ${m.uptimeSeconds}`,
    `# HELP travelforge_requests_total Total HTTP requests`,
    `# TYPE travelforge_requests_total counter`,
    `travelforge_requests_total{status="success"} ${m.requests.success}`,
    `travelforge_requests_total{status="client_error"} ${m.requests.clientErrors}`,
    `travelforge_requests_total{status="server_error"} ${m.requests.serverErrors}`,
    `# HELP travelforge_heap_used_bytes Node.js heap used`,
    `# TYPE travelforge_heap_used_bytes gauge`,
    `travelforge_heap_used_bytes ${Math.round(process.memoryUsage().heapUsed)}`,
  ]

  for (const rs of m.routes) {
    const label = rs.route.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()
    lines.push(
      `# HELP travelforge_route_requests_total{route="${rs.route}"}`,
      `travelforge_route_requests_total{route="${rs.route}"} ${rs.count}`,
      `travelforge_route_avg_latency_ms{route="${rs.route}"} ${rs.avgLatencyMs}`,
    )
  }

  return lines.join('\n')
}
