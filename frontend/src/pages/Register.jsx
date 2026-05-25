import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: ''
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone,
      })
      toast.success('Account created! Welcome to Novello!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📚</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join Novello and start reading today</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-firstname">First Name</label>
              <input id="reg-firstname" type="text" className="form-input" placeholder="John"
                     value={form.firstName} onChange={update('firstName')} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-lastname">Last Name</label>
              <input id="reg-lastname" type="text" className="form-input" placeholder="Doe"
                     value={form.lastName} onChange={update('lastName')} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <input id="reg-email" type="email" className="form-input" placeholder="you@example.com"
                   value={form.email} onChange={update('email')} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-phone">Phone (optional)</label>
            <input id="reg-phone" type="tel" className="form-input" placeholder="+91 98765 43210"
                   value={form.phone} onChange={update('phone')} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input id="reg-password" type="password" className="form-input" placeholder="Min. 6 characters"
                   value={form.password} onChange={update('password')} required minLength={6} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
            <input id="reg-confirm" type="password" className="form-input" placeholder="Repeat password"
                   value={form.confirmPassword} onChange={update('confirmPassword')} required />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} id="register-submit-btn"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', marginTop: '0.5rem' }}>
            {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Create Account'}
          </button>
        </form>

        <div className="divider" />
        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--purple-400)', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}
