import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов')
      return
    }

    setIsLoading(true)

    try {
      await register({ name, email, password })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="form-section">
      <div className="container">
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 className="form-section__title" style={{ marginBottom: '2rem' }}>
            Регистрация
          </h2>

          <div className="card">
            <form onSubmit={handleSubmit}>
              {error && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#dc2626',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem',
                    fontSize: '0.875rem',
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Имя</label>
                <input
                  className="input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ваше имя"
                  required
                  disabled={isLoading}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Пароль</label>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Подтвердите пароль</label>
                <input
                  className="input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите пароль"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>

              <button
                className="btn"
                type="submit"
                disabled={isLoading}
                style={{ width: '100%', marginBottom: '1rem' }}
              >
                {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Уже есть аккаунт?{' '}
                </span>
                <Link
                  to="/login"
                  style={{
                    color: 'var(--accent-blue)',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Войти
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

