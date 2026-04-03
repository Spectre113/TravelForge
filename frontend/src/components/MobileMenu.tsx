import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function MobileMenu() {
  const { isAuthenticated, user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleLogout = () => {
    logout()
    setIsOpen(false)
    navigate('/')
  }

  const handleNavClick = () => {
    setIsOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mobile-menu__toggle"
        aria-label="Открыть меню"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          zIndex: 1001,
        }}
      >
        <span
          style={{
            display: 'block',
            width: '24px',
            height: '3px',
            background: isOpen ? 'var(--white)' : 'var(--primary-dark)',
            borderRadius: '2px',
            transition: 'all 0.3s ease',
            transform: isOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
          }}
        />
        <span
          style={{
            display: 'block',
            width: '24px',
            height: '3px',
            background: isOpen ? 'var(--white)' : 'var(--primary-dark)',
            borderRadius: '2px',
            transition: 'all 0.3s ease',
            opacity: isOpen ? 0 : 1,
          }}
        />
        <span
          style={{
            display: 'block',
            width: '24px',
            height: '3px',
            background: isOpen ? 'var(--white)' : 'var(--primary-dark)',
            borderRadius: '2px',
            transition: 'all 0.3s ease',
            transform: isOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none',
          }}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="mobile-menu__overlay"
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
            }}
          />
          <div
            className="mobile-menu__sidebar"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '280px',
              height: '100vh',
              background: 'var(--white)',
              boxShadow: 'var(--shadow-2xl)',
              zIndex: 1000,
              padding: 'var(--space-xl)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.3s ease',
            }}
          >
            <div style={{ marginBottom: 'var(--space-2xl)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-dark)' }}>
                Меню
              </h2>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)' }}>
              <NavLink
                to="/"
                end
                onClick={handleNavClick}
                className={({ isActive }) => `mobile-menu__link ${isActive ? 'mobile-menu__link--active' : ''}`}
              >
                Главная
              </NavLink>
              <NavLink
                to="/results"
                onClick={handleNavClick}
                className={({ isActive }) => `mobile-menu__link ${isActive ? 'mobile-menu__link--active' : ''}`}
              >
                Результаты
              </NavLink>
              {isAuthenticated && (
                <NavLink
                  to="/saved"
                  onClick={handleNavClick}
                  className={({ isActive }) => `mobile-menu__link ${isActive ? 'mobile-menu__link--active' : ''}`}
                >
                  Мои поездки
                </NavLink>
              )}
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: 'var(--space-xl)', borderTop: '1px solid var(--gray-200)' }}>
              {isAuthenticated ? (
                <>
                  <div style={{ marginBottom: 'var(--space-md)', padding: 'var(--space-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      Вход выполнен как
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {user?.name}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: 'var(--space-md)',
                      background: 'transparent',
                      border: '1px solid var(--gray-300)',
                      borderRadius: 'var(--radius-md)',
                      color: '#dc2626',
                      cursor: 'pointer',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/register"
                    onClick={handleNavClick}
                    className="btn"
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'center',
                      marginBottom: 'var(--space-sm)',
                      textDecoration: 'none',
                    }}
                  >
                    Зарегистрироваться
                  </NavLink>
                  <NavLink
                    to="/login"
                    onClick={handleNavClick}
                    className="btn btn--outline"
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'center',
                      textDecoration: 'none',
                    }}
                  >
                    Войти
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}

