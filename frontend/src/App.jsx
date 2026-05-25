import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Catalog from './pages/Catalog'
import BookDetail from './pages/BookDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Downloads from './pages/Downloads'
import Admin from './pages/Admin'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div className="loading-page"><div className="spinner" /></div>
  return isAuthenticated() ? children : <Navigate to="/login" />
}

const AdminRoute = ({ children }) => {
  const { isAdmin, isAuthenticated, loading } = useAuth()
  if (loading) return <div className="loading-page"><div className="spinner" /></div>
  if (!isAuthenticated()) return <Navigate to="/login" />
  if (!isAdmin()) return <Navigate to="/" />
  return children
}

export default function App() {
  return (
    <>
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="/downloads" element={<PrivateRoute><Downloads /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      </Routes>
    </>
  )
}
