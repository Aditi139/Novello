import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, switchFormat, getTotalPrice, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (!Array.isArray(cart) || cart.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some books to get started!</p>
            <Link to="/catalog" className="btn btn-primary" style={{ marginTop: '1.5rem' }} id="cart-browse-btn">
              Browse Books
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleCheckout = () => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }
    navigate('/checkout')
  }

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem' }}>
            Shopping Cart
            <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.75rem' }}>
              ({Array.isArray(cart) ? cart.length : 0} {(Array.isArray(cart) && cart.length === 1) ? 'item' : 'items'})
            </span>
          </h1>
          <button className="btn btn-danger btn-sm" onClick={clearCart} id="cart-clear-btn">
            Clear Cart
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Array.isArray(cart) && cart.map((item, idx) => (
              <div key={idx} className="cart-item">
                {/* Cover */}
                <div style={{
                  width: 80, height: 110, borderRadius: 'var(--radius)',
                  background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', overflow: 'hidden', flexShrink: 0
                }}>
                  {item.coverImageUrl
                    ? <img src={item.coverImageUrl} alt={item.bookTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '📚'}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.95rem' }}>{item.bookTitle}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{item.bookAuthor}</div>
                  
                  {item.bookType === 'BOTH' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <span className="badge badge-purple" style={{ margin: 0 }}>Format:</span>
                      <select
                        value={item.itemType}
                        onChange={(e) => switchFormat(item.bookId, item.itemType, e.target.value)}
                        className="form-input"
                        style={{
                          padding: '0.15rem 0.4rem',
                          fontSize: '0.8rem',
                          width: 'auto',
                          height: 'auto',
                          borderRadius: 'var(--radius)',
                          borderColor: 'var(--border)',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer'
                        }}
                        id={`format-select-${item.bookId}`}
                      >
                        <option value="HARDCOPY">📦 Hardcopy</option>
                        <option value="EBOOK">📱 eBook</option>
                      </select>
                    </div>
                  ) : (
                    <span className={`badge ${item.itemType === 'EBOOK' ? 'badge-green' : 'badge-purple'}`} style={{ marginBottom: '0.75rem' }}>
                      {item.itemType === 'EBOOK' ? '📱 eBook' : '📦 Hardcopy'}
                    </span>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="qty-controls">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.bookId, item.itemType, item.quantity - 1)}
                        id={`qty-dec-${item.bookId}`}
                      >−</button>
                      <span style={{ minWidth: '2rem', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.bookId, item.itemType, item.quantity + 1)}
                        id={`qty-inc-${item.bookId}`}
                      >+</button>
                    </div>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removeFromCart(item.bookId, item.itemType)}
                      id={`remove-${item.bookId}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold)' }}>
                    ₹{(Number(item.unitPrice) * item.quantity).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ₹{Number(item.unitPrice).toFixed(2)} each
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '90px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Order Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal ({Array.isArray(cart) ? cart.reduce((s, i) => s + i.quantity, 0) : 0} items)</span>
                <span>₹{getTotalPrice().toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <span>Delivery</span>
                <span style={{ color: 'var(--success)' }}>Free</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <span>GST (18%)</span>
                <span>₹{(getTotalPrice() * 0.18).toFixed(2)}</span>
              </div>
            </div>

            <div className="divider" />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.125rem', marginBottom: '1.5rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--gold)' }}>₹{(getTotalPrice() * 1.18).toFixed(2)}</span>
            </div>

            <button
              className="btn btn-gold"
              style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', marginBottom: '0.75rem' }}
              onClick={handleCheckout}
              id="cart-checkout-btn"
            >
              <ShoppingBag size={18} /> Proceed to Checkout
            </button>

            <Link to="/catalog" className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
              <ArrowLeft size={16} /> Continue Shopping
            </Link>

            <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              🔒 Secure checkout powered by Razorpay
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
