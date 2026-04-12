import cors from 'cors'

const defaultOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000']

const allowedOrigins: string[] = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : defaultOrigins

export const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    // Allow server-to-server requests (no Origin header)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error(`CORS: origin ${origin} is not allowed`))
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
}

export const corsMiddleware = cors(corsOptions)
