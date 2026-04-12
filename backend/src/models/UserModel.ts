import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { User, AuthRequest, RegisterRequest } from '../types'

export class UserModel {
  private static users: User[] = []

  static async register(userData: RegisterRequest): Promise<User> {
    const existingUser = this.users.find(user => user.email === userData.email)
    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует')
    }

    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds)

    const user: User = {
      id: uuidv4(),
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      createdAt: new Date().toISOString(),
    }

    this.users.push(user)
    return user
  }

  static async login(credentials: AuthRequest): Promise<User | null> {
    const user = this.users.find(user => user.email === credentials.email)
    
    if (!user) {
      return null
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
    
    if (!isPasswordValid) {
      return null
    }

    return user
  }

  static getUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id)
  }

  static getUserByEmail(email: string): User | undefined {
    return this.users.find(user => user.email === email)
  }

  static getAllUsers(): User[] {
    return [...this.users]
  }

  static deleteUser(id: string): boolean {
    const index = this.users.findIndex(user => user.id === id)
    if (index !== -1) {
      this.users.splice(index, 1)
      return true
    }
    return false
  }
}
