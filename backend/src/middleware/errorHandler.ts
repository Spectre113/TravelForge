import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

/** Кастомный класс для клиентских ошибок (4xx) */
export class ClientError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = 'ClientError'
  }
}

function isClientError(err: Error): boolean {
  return err instanceof ClientError
}

/**
 * Глобальный обработчик ошибок.
 *
 * Клиентские (4xx) — level info:  неверный запрос, нет прав, не найдено.
 * Серверные  (5xx) — level fatal: необработанные исключения, баги.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const context = {
    err: { name: err.name, message: err.message, stack: err.stack },
    req: { method: req.method, url: req.url, ip: req.ip },
  }

  if (isClientError(err)) {
    const status = (err as ClientError).statusCode
    // Клиентская ошибка — пользователь сделал что-то не так, не будим дежурного
    logger.info(context, `Client error ${status}: ${err.message}`)
    res.status(status).json({ success: false, error: err.message })
    return
  }

  // Серверная ошибка — что-то сломалось на нашей стороне
  logger.fatal(context, `Server error 500: ${err.message}`)
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
}

/** 404 — клиентская ошибка, просто info */
export const notFoundHandler = (req: Request, res: Response): void => {
  logger.info({ method: req.method, url: req.url }, '404 Not Found')
  res.status(404).json({ success: false, error: 'Route not found' })
}
