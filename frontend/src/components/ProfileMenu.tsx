import React, { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProfileMenu() {
  const { isAuthenticated, user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setIsOpen(false)
    navigate('/')
  }

  if (!isAuthenticated) {
    return (
      <div className="profile-menu" ref={menuRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="profile-menu__trigger"
          style={{
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-blue-light))',
            border: 'none',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            fontSize: '1.5rem',
            transition: 'all 0.2s ease',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          👤
        </button>

        {isOpen && (
          <div
            className="profile-menu__dropdown"
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 0.5rem)',
              background: 'white',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
              minWidth: '200px',
              zIndex: 1000,
              overflow: 'hidden',
              border: '1px solid var(--gray-200)',
            }}
          >
            <NavLink
              to="/register"
              onClick={() => setIsOpen(false)}
              style={{
                display: 'block',
                padding: '1rem',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                transition: 'background 0.2s ease',
                fontSize: '1rem',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gray-100)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
            >
              Зарегистрироваться
            </NavLink>
            <NavLink
              to="/login"
              onClick={() => setIsOpen(false)}
              style={{
                display: 'block',
                padding: '1rem',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                transition: 'background 0.2s ease',
                fontSize: '1rem',
                fontWeight: 500,
                borderTop: '1px solid var(--gray-200)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gray-100)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
            >
              Войти
            </NavLink>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="profile-menu" ref={menuRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="profile-menu__trigger"
        style={{
          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-blue-light))',
          border: 'none',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'white',
          fontSize: '1.25rem',
          fontWeight: 'bold',
          transition: 'all 0.2s ease',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {user?.name?.[0]?.toUpperCase() || '👤'}
      </button>

      {isOpen && (
        <div
          className="profile-menu__dropdown"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 0.5rem)',
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            minWidth: '200px',
            zIndex: 1000,
            overflow: 'hidden',
            border: '1px solid var(--gray-200)',
          }}
        >
          <div
            style={{
              padding: '1rem',
              borderBottom: '1px solid var(--gray-200)',
              background: 'var(--gray-50)',
            }}
          >
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Вход выполнен как
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {user?.name}
            </div>
          </div>

          <NavLink
            to="/saved"
            onClick={() => setIsOpen(false)}
            style={{
              display: 'block',
              padding: '1rem',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              transition: 'background 0.2s ease',
              fontSize: '1rem',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gray-100)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
          >
            Мои поездки
          </NavLink>

          <button
            onClick={handleLogout}
            style={{
              display: 'block',
              width: '100%',
              padding: '1rem',
              textAlign: 'left',
              background: 'white',
              border: 'none',
              borderTop: '1px solid var(--gray-200)',
              color: '#dc2626',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              fontSize: '1rem',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
          >
            Выйти
          </button>
        </div>
      )}
    </div>
  )
}

