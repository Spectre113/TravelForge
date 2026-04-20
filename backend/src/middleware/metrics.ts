import { Request, Response, NextFunction } from 'express'
import { monitorEventLoopDelay } from 'node:perf_hooks'

interface RouteMetrics {
  count: number
  errors: number
  totalDurationMs: number
}

interface DependencyMetrics {
  success: number
  error: number
  durationCount: number
  durationSumMs: number
  durationBuckets: Map<number, number>
}

interface AppMetrics {
  startedAt: Date
  requestsTotal: number
  requestsSuccess: number
  requestsClientError: number
  requestsServerError: number
  inFlight: number
  routes: Record<string, RouteMetrics>
  gigachat: Record<string, DependencyMetrics>
}

const HTTP_HISTOGRAM_BUCKETS_MS = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000]
const GIGACHAT_HISTOGRAM_BUCKETS_MS = [100, 250, 500, 1000, 2500, 5000, 10000, 30000, 60000]

const requestDurationBuckets = new Map<number, number>(HTTP_HISTOGRAM_BUCKETS_MS.map((b) => [b, 0]))
let requestDurationCount = 0
let requestDurationSumMs = 0

const metrics: AppMetrics = {
  startedAt: new Date(),
  requestsTotal: 0,
  requestsSuccess: 0,
  requestsClientError: 0,
  requestsServerError: 0,
  inFlight: 0,
  routes: {},
  gigachat: {},
}

const eventLoopDelay = monitorEventLoopDelay({ resolution: 20 })
eventLoopDelay.enable()

function escapeLabelValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')
}

function normalizeRouteKey(req: Request): string {
  const routePath = typeof req.route?.path === 'string' ? req.route.path : ''
  const baseUrl = req.baseUrl || ''

  if (routePath) {
    const fullPath = `${baseUrl}${routePath === '/' ? '' : routePath}` || '/'
    return `${req.method} ${fullPath}`
  }

  return `${req.method} ${req.path}`
}

function shouldIgnoreRoute(routeKey: string): boolean {
  return (
    routeKey === 'GET /health' ||
    routeKey === 'GET /metrics' ||
    routeKey === 'GET /metrics/prometheus' ||
    routeKey === 'GET /metrics/json'
  )
}

function observeHttpRequestDuration(durationMs: number): void {
  requestDurationCount++
  requestDurationSumMs += durationMs

  for (const bucket of HTTP_HISTOGRAM_BUCKETS_MS) {
    if (durationMs <= bucket) {
      requestDurationBuckets.set(bucket, (requestDurationBuckets.get(bucket) ?? 0) + 1)
    }
  }
}

function createDependencyMetrics(): DependencyMetrics {
  return {
    success: 0,
    error: 0,
    durationCount: 0,
    durationSumMs: 0,
    durationBuckets: new Map<number, number>(GIGACHAT_HISTOGRAM_BUCKETS_MS.map((b) => [b, 0])),
  }
}

function getDependencyMetrics(scope: string): DependencyMetrics {
  if (!metrics.gigachat[scope]) {
    metrics.gigachat[scope] = createDependencyMetrics()
  }

  return metrics.gigachat[scope]
}

function observeDependencyDuration(scope: string, durationMs: number): void {
  const dep = getDependencyMetrics(scope)

  dep.durationCount++
  dep.durationSumMs += durationMs

  for (const bucket of GIGACHAT_HISTOGRAM_BUCKETS_MS) {
    if (durationMs <= bucket) {
      dep.durationBuckets.set(bucket, (dep.durationBuckets.get(bucket) ?? 0) + 1)
    }
  }
}

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startAt = process.hrtime.bigint()
  metrics.inFlight++

  let settled = false
  const finalize = () => {
    if (settled) return
    settled = true

    metrics.inFlight = Math.max(0, metrics.inFlight - 1)

    const durationMs = Number(process.hrtime.bigint() - startAt) / 1e6
    const routeKey = normalizeRouteKey(req)

    metrics.requestsTotal++

    if (res.statusCode >= 500) {
      metrics.requestsServerError++
    } else if (res.statusCode >= 400) {
      metrics.requestsClientError++
    } else {
      metrics.requestsSuccess++
    }

    observeHttpRequestDuration(durationMs)

    if (shouldIgnoreRoute(routeKey)) {
      return
    }

    if (!metrics.routes[routeKey]) {
      metrics.routes[routeKey] = { count: 0, errors: 0, totalDurationMs: 0 }
    }

    metrics.routes[routeKey].count++
    metrics.routes[routeKey].totalDurationMs += durationMs

    if (res.statusCode >= 400) {
      metrics.routes[routeKey].errors++
    }
  }

  res.on('finish', finalize)
  res.on('close', finalize)

  next()
}

export function getMetrics() {
  const uptimeSeconds = (Date.now() - metrics.startedAt.getTime()) / 1000
  const mem = process.memoryUsage()
  const cpu = process.cpuUsage()

  const routeStats = Object.entries(metrics.routes).map(([route, rm]) => ({
    route,
    count: rm.count,
    errors: rm.errors,
    avgLatencyMs: rm.count > 0 ? +(rm.totalDurationMs / rm.count).toFixed(2) : 0,
    errorRate: rm.count > 0 ? +((rm.errors / rm.count) * 100).toFixed(1) : 0,
  }))

  const gigachatScopes = Object.entries(metrics.gigachat).map(([scope, gm]) => ({
    scope,
    success: gm.success,
    error: gm.error,
    total: gm.success + gm.error,
    avgLatencyMs: gm.durationCount > 0 ? +(gm.durationSumMs / gm.durationCount).toFixed(2) : 0,
    durationCount: gm.durationCount,
    durationSumMs: +gm.durationSumMs.toFixed(3),
    durationBuckets: Object.fromEntries(Array.from(gm.durationBuckets.entries())),
  }))

  const gigachatTotalSuccess = gigachatScopes.reduce((sum, s) => sum + s.success, 0)
  const gigachatTotalError = gigachatScopes.reduce((sum, s) => sum + s.error, 0)

  return {
    startedAt: metrics.startedAt.toISOString(),
    uptimeSeconds: +uptimeSeconds.toFixed(0),
    requests: {
      total: metrics.requestsTotal,
      success: metrics.requestsSuccess,
      clientErrors: metrics.requestsClientError,
      serverErrors: metrics.requestsServerError,
      inFlight: metrics.inFlight,
      clientErrorRatePct:
        metrics.requestsTotal > 0
          ? +((metrics.requestsClientError / metrics.requestsTotal) * 100).toFixed(1)
          : 0,
      serverErrorRatePct:
        metrics.requestsTotal > 0
          ? +((metrics.requestsServerError / metrics.requestsTotal) * 100).toFixed(1)
          : 0,
    },
    gigachat: {
      success: gigachatTotalSuccess,
      error: gigachatTotalError,
      total: gigachatTotalSuccess + gigachatTotalError,
      scopes: gigachatScopes,
    },
    routes: routeStats,
    memory: {
      heapUsedBytes: mem.heapUsed,
      heapTotalBytes: mem.heapTotal,
      rssBytes: mem.rss,
    },
    cpu: {
      userSecondsTotal: +(cpu.user / 1e6).toFixed(6),
      systemSecondsTotal: +(cpu.system / 1e6).toFixed(6),
    },
    eventLoopLagMs: +(eventLoopDelay.mean / 1e6).toFixed(3),
    requestDuration: {
      count: requestDurationCount,
      sumMs: +requestDurationSumMs.toFixed(3),
      buckets: Object.fromEntries(Array.from(requestDurationBuckets.entries())),
    },
  }
}

export function getPrometheusMetrics(): string {
  const m = getMetrics()

  const lines: string[] = [
    '# HELP travelforge_uptime_seconds Uptime in seconds',
    '# TYPE travelforge_uptime_seconds gauge',
    `travelforge_uptime_seconds ${m.uptimeSeconds}`,

    '# HELP travelforge_requests_total Total HTTP requests',
    '# TYPE travelforge_requests_total counter',
    `travelforge_requests_total{status="success"} ${m.requests.success}`,
    `travelforge_requests_total{status="client_error"} ${m.requests.clientErrors}`,
    `travelforge_requests_total{status="server_error"} ${m.requests.serverErrors}`,

    '# HELP travelforge_http_requests_in_flight Current in-flight HTTP requests',
    '# TYPE travelforge_http_requests_in_flight gauge',
    `travelforge_http_requests_in_flight ${m.requests.inFlight}`,

    '# HELP travelforge_process_heap_used_bytes Node.js heap used in bytes',
    '# TYPE travelforge_process_heap_used_bytes gauge',
    `travelforge_process_heap_used_bytes ${m.memory.heapUsedBytes}`,

    '# HELP travelforge_heap_used_bytes Node.js heap used in bytes (legacy name)',
    '# TYPE travelforge_heap_used_bytes gauge',
    `travelforge_heap_used_bytes ${m.memory.heapUsedBytes}`,

    '# HELP travelforge_process_rss_bytes Node.js RSS memory in bytes',
    '# TYPE travelforge_process_rss_bytes gauge',
    `travelforge_process_rss_bytes ${m.memory.rssBytes}`,

    '# HELP travelforge_process_cpu_user_seconds_total Total user CPU time spent by the Node.js process',
    '# TYPE travelforge_process_cpu_user_seconds_total counter',
    `travelforge_process_cpu_user_seconds_total ${m.cpu.userSecondsTotal}`,

    '# HELP travelforge_process_cpu_system_seconds_total Total system CPU time spent by the Node.js process',
    '# TYPE travelforge_process_cpu_system_seconds_total counter',
    `travelforge_process_cpu_system_seconds_total ${m.cpu.systemSecondsTotal}`,

    '# HELP travelforge_event_loop_lag_ms Mean event loop lag in milliseconds',
    '# TYPE travelforge_event_loop_lag_ms gauge',
    `travelforge_event_loop_lag_ms ${m.eventLoopLagMs}`,

    '# HELP travelforge_request_duration_ms HTTP request duration histogram in milliseconds',
    '# TYPE travelforge_request_duration_ms histogram',
  ]

  for (const bucket of HTTP_HISTOGRAM_BUCKETS_MS) {
    lines.push(`travelforge_request_duration_ms_bucket{le="${bucket}"} ${m.requestDuration.buckets[bucket] ?? 0}`)
  }

  lines.push(`travelforge_request_duration_ms_bucket{le="+Inf"} ${m.requestDuration.count}`)
  lines.push(`travelforge_request_duration_ms_sum ${m.requestDuration.sumMs}`)
  lines.push(`travelforge_request_duration_ms_count ${m.requestDuration.count}`)

  lines.push('# HELP travelforge_gigachat_requests_total Total requests to GigaChat dependency')
  lines.push('# TYPE travelforge_gigachat_requests_total counter')

  lines.push('# HELP travelforge_gigachat_request_duration_ms GigaChat dependency request duration in milliseconds')
  lines.push('# TYPE travelforge_gigachat_request_duration_ms histogram')

  for (const scopeStat of m.gigachat.scopes) {
    const scope = escapeLabelValue(scopeStat.scope)

    lines.push(`travelforge_gigachat_requests_total{scope="${scope}",result="success"} ${scopeStat.success}`)
    lines.push(`travelforge_gigachat_requests_total{scope="${scope}",result="error"} ${scopeStat.error}`)

    for (const bucket of GIGACHAT_HISTOGRAM_BUCKETS_MS) {
      lines.push(
        `travelforge_gigachat_request_duration_ms_bucket{scope="${scope}",le="${bucket}"} ${
          scopeStat.durationBuckets[bucket] ?? 0
        }`,
      )
    }

    lines.push(`travelforge_gigachat_request_duration_ms_bucket{scope="${scope}",le="+Inf"} ${scopeStat.durationCount}`)
    lines.push(`travelforge_gigachat_request_duration_ms_sum{scope="${scope}"} ${scopeStat.durationSumMs}`)
    lines.push(`travelforge_gigachat_request_duration_ms_count{scope="${scope}"} ${scopeStat.durationCount}`)
  }

  lines.push('# HELP travelforge_route_requests_total Total HTTP requests by application route')
  lines.push('# TYPE travelforge_route_requests_total counter')

  lines.push('# HELP travelforge_route_avg_latency_ms Average HTTP latency by application route in milliseconds')
  lines.push('# TYPE travelforge_route_avg_latency_ms gauge')

  for (const rs of m.routes) {
    const route = escapeLabelValue(rs.route)
    lines.push(`travelforge_route_requests_total{route="${route}"} ${rs.count}`)
    lines.push(`travelforge_route_avg_latency_ms{route="${route}"} ${rs.avgLatencyMs}`)
  }

  return `${lines.join('\n')}\n`
}

export function recordGigachatRequest(
  scopeOrResult: string = 'error',
  resultOrDuration?: string | number,
  maybeDurationMs?: number,
): void {
  let scope = 'unknown'
  let result: 'success' | 'error' = 'error'
  let durationMs: number | undefined

  if (scopeOrResult === 'success' || scopeOrResult === 'error') {
    result = scopeOrResult
    if (typeof resultOrDuration === 'number') {
      durationMs = resultOrDuration
    }
  } else {
    scope = scopeOrResult || 'unknown'

    if (resultOrDuration === 'success' || resultOrDuration === 'error') {
      result = resultOrDuration
    }

    if (typeof maybeDurationMs === 'number') {
      durationMs = maybeDurationMs
    }
  }

  const dep = getDependencyMetrics(scope)

  if (result === 'success') {
    dep.success++
  } else {
    dep.error++
  }

  if (typeof durationMs === 'number' && Number.isFinite(durationMs) && durationMs >= 0) {
    observeDependencyDuration(scope, durationMs)
  }
}