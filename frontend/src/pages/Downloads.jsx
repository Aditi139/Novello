import React, { useEffect, useState } from 'react'
import { Download, BookOpen } from 'lucide-react'
import { ordersApi, ebooksApi } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Downloads() {
  const { user } = useAuth()
  const [ebookOrders, setEbookOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState({})

  useEffect(() => {
    if (user) {
      ordersApi.getByUser(user.id)
        .then(r => {
          // Filter orders that have eBook items and are PAID
          const paid = r.data.filter(o =>
            o.status === 'PAID' || o.status === 'DELIVERED' || o.status === 'PROCESSING'
          )
          const ebookItems = paid.flatMap(order =>
            (order.items || [])
              .filter(item => item.itemType === 'EBOOK')
              .map(item => ({ ...item, orderId: order.id, orderNumber: order.orderNumber }))
          )
          setEbookOrders(ebookItems)
        })
        .catch(() => setEbookOrders([]))
        .finally(() => setLoading(false))
    }
  }, [user])

  const handleDownload = async (item) => {
    const key = `${item.bookId}-${item.orderId}`
    setDownloading(prev => ({ ...prev, [key]: true }))
    try {
      // Generate download token
      const tokenRes = await ebooksApi.generateToken(user.id, item.bookId, item.orderId)
      const token = tokenRes.data.token

      // Download the eBook
      const res = await ebooksApi.download(token, user.id)
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `${item.bookTitle.replace(/\s+/g, '-')}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
      toast.success(`Downloaded "${item.bookTitle}"!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed. The eBook may not be uploaded yet.')
    } finally {
      setDownloading(prev => ({ ...prev, [key]: false }))
    }
  }

  if (loading) return <div className="loading-page"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: '0.5rem' }}>My Downloads</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Access all your purchased eBooks. Downloads are valid for 7 days per session.
        </p>

        {ebookOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📱</div>
            <h3>No eBooks yet</h3>
            <p>Purchase eBooks to see them available for download here</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {ebookOrders.map((item, idx) => {
              const key = `${item.bookId}-${item.orderId}`
              return (
                <div key={idx} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: 60, height: 80, borderRadius: 'var(--radius)',
                      background: 'linear-gradient(135deg, #1e1e3f, #2d2d5e)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.75rem', flexShrink: 0
                    }}>
                      📱
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9rem' }}>{item.bookTitle}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.bookAuthor}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Order #{item.orderNumber}
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => handleDownload(item)}
                    disabled={downloading[key]}
                    id={`download-${item.bookId}`}
                  >
                    {downloading[key] ? (
                      <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    ) : (
                      <><Download size={16} /> Download PDF</>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
