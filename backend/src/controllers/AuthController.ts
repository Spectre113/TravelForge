import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { UserModel } from '../models/UserModel'
import { AuthRequest, RegisterRequest, AuthResponse } from '../types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name }: RegisterRequest = req.body

      if (!email || !password || !name) {
        res.status(400).json({
          success: false,
          error: 'Email, password и name обязательны',
        })
        return
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          error: 'Пароль должен содержать минимум 6 символов',
        })
        return
      }

      const user = await UserModel.register({ email, password, name })
      
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      const response: AuthResponse = {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      }

      res.status(201).json(response)
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка регистрации',
      })
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: AuthRequest = req.body

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email и password обязательны',
        })
        return
      }

      const user = await UserModel.login({ email, password })

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Неверный email или пароль',
        })
        return
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      const response: AuthResponse = {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      }

      res.json(response)
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Ошибка входа',
      })
    }
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId
      const user = UserModel.getUserById(userId)

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Пользователь не найден',
        })
        return
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Ошибка получения профиля',
      })
    }
  }
}
