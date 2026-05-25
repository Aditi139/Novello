import React, { useEffect, useState } from 'react'
import { Package, Clock, CheckCircle, Truck } from 'lucide-react'
import { ordersApi } from '../api/axios'
import { useAuth } from '../context/AuthContext'

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'var(--warning)', icon: '⏳' },
  PAYMENT_PENDING: { label: 'Payment Pending', color: 'var(--warning)', icon: '💳' },
  PAID: { label: 'Paid', color: 'var(--info)', icon: '✅' },
  PROCESSING: { label: 'Processing', color: 'var(--info)', icon: '⚙️' },
  SHIPPED: { label: 'Shipped', color: 'var(--purple-400)', icon: '🚚' },
  DELIVERED: { label: 'Delivered', color: 'var(--success)', icon: '🎉' },
  CANCELLED: { label: 'Cancelled', color: 'var(--error)', icon: '❌' },
  REFUNDED: { label: 'Refunded', color: 'var(--text-muted)', icon: '↩️' },
}

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      ordersApi.getByUser(user.id)
        .then(r => setOrders(r.data))
        .catch(() => setOrders([]))
        .finally(() => setLoading(false))
    }
  }, [user])

  if (loading) return <div className="loading-page"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: '0.5rem' }}>My Orders</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Track and manage your book orders</p>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Place your first order to see it here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map(order => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING
              return (
                <div key={order.id} className="order-card" id={`order-${order.id}`}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>
                        Order #{order.orderNumber}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>{status.icon}</span>
                      <span className="badge" style={{
                        background: `${status.color}20`,
                        color: status.color,
                        border: `1px solid ${status.color}40`,
                      }}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    {order.items?.map(item => (
                      <div key={item.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)' }}>
                        <span style={{ fontSize: '1.25rem' }}>📚</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{item.bookTitle}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {item.itemType === 'EBOOK' ? '📱 eBook' : '📦 Hardcopy'} × {item.quantity}
                          </div>
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gold)', flexShrink: 0 }}>
                          ₹{Number(item.totalPrice).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="divider" />

                  {/* Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      {order.shippingAddress && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          📍 {order.shippingAddress}
                        </div>
                      )}
                      {order.paymentId && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          Payment ID: {order.paymentId}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total</div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--gold)' }}>
                        ₹{Number(order.totalAmount).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
