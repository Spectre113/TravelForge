import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface AuthenticatedRequest extends Request {
  userId?: string
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Токен доступа не предоставлен',
    })
    return
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({
        success: false,
        error: 'Недействительный токен',
      })
      return
    }

    const payload = decoded as { userId: string; email: string }
    req.userId = payload.userId
    next()
  })
}

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    next()
    return
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      const payload = decoded as { userId: string; email: string }
      req.userId = payload.userId
    }
    next()
  })
}
