import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingCart, Bell, User, LogOut, BookOpen, LayoutDashboard, Download } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { notificationsApi } from '../api/axios'

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const { getTotalItems } = useCart()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotif, setShowNotif] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showUserMenu, setShowUserMenu] = useState(false)
  const notifRef = useRef()
  const userRef = useRef()

  useEffect(() => {
    if (user) {
      notificationsApi.getUnreadCount(user.id)
        .then(r => setUnreadCount(r.data.unreadCount))
        .catch(() => {})
    }
  }, [user])

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNotifOpen = async () => {
    setShowNotif(!showNotif)
    if (!showNotif && user) {
      try {
        const r = await notificationsApi.getByUser(user.id)
        const data = Array.isArray(r.data) ? r.data : []
        setNotifications(data.slice(0, 8))
        await notificationsApi.markAllRead(user.id)
        setUnreadCount(0)
      } catch {
        setNotifications([])
      }
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setShowUserMenu(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          📚 Novello
        </Link>

        {/* Nav Links */}
        <div className="navbar-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>Home</NavLink>
          <NavLink to="/catalog" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Catalog</NavLink>
          {isAuthenticated() && (
            <>
              <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>My Orders</NavLink>
              <NavLink to="/downloads" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Downloads</NavLink>
            </>
          )}
          {isAdmin() && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Admin</NavLink>
          )}
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {/* Cart */}
          <Link to="/cart" className="cart-btn" id="nav-cart-btn">
            <ShoppingCart size={20} />
            {getTotalItems() > 0 && (
              <span className="cart-badge">{getTotalItems()}</span>
            )}
          </Link>

          {/* Notifications */}
          {isAuthenticated() && (
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button className="notification-btn" onClick={handleNotifOpen} id="nav-notif-btn">
                <Bell size={20} />
                {unreadCount > 0 && <span className="notification-dot" />}
              </button>
              {showNotif && (
                <div className="notif-dropdown">
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.875rem' }}>
                    Notifications
                  </div>
                  {(!Array.isArray(notifications) || notifications.length === 0) ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No notifications
                    </div>
                  ) : notifications.map(n => (
                    <div key={n.id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}>
                      <div style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.25rem' }}>{n.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{n.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* User Menu */}
          {isAuthenticated() ? (
            <div style={{ position: 'relative' }} ref={userRef}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                id="nav-user-btn"
                style={{ gap: '0.5rem' }}
              >
                <User size={16} />
                {user?.firstName}
              </button>
              {showUserMenu && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 200, background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', zIndex: 200
                }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {user?.email}
                  </div>
                  {isAdmin() && (
                    <Link to="/admin" className="sidebar-link" style={{ margin: '0.25rem' }} onClick={() => setShowUserMenu(false)}>
                      <LayoutDashboard size={16} /> Admin Panel
                    </Link>
                  )}
                  <Link to="/downloads" className="sidebar-link" style={{ margin: '0.25rem' }} onClick={() => setShowUserMenu(false)}>
                    <Download size={16} /> My Downloads
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="sidebar-link"
                    style={{ width: '100%', border: 'none', background: 'none', margin: '0.25rem', color: 'var(--error)' }}
                    id="nav-logout-btn"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm" id="nav-login-btn">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="nav-register-btn">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
