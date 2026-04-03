import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login({ email, password })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="form-section">
      <div className="container">
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 className="form-section__title" style={{ marginBottom: '2rem' }}>
            Вход
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
                  placeholder="Введите пароль"
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                className="btn"
                type="submit"
                disabled={isLoading}
                style={{ width: '100%', marginBottom: '1rem' }}
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Нет аккаунта?{' '}
                </span>
                <Link
                  to="/register"
                  style={{
                    color: 'var(--accent-blue)',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Зарегистрироваться
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

