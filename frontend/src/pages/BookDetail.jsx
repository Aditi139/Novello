import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ShoppingCart, Star, BookOpen, Download, ArrowLeft, Package } from 'lucide-react'
import { booksApi, inventoryApi } from '../api/axios'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addToCart, buyNow } = useCart()
  const [book, setBook] = useState(null)
  const [inventory, setInventory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('HARDCOPY')

  useEffect(() => {
    Promise.all([
      booksApi.getById(id),
      inventoryApi.getByBook(id).catch(() => ({ data: null }))
    ]).then(([bookRes, invRes]) => {
      setBook(bookRes.data)
      setInventory(invRes.data)
      
      const bookFormat = bookRes.data?.bookType
      const urlFormat = searchParams.get('format')
      
      if (bookFormat === 'EBOOK') {
        setSelectedType('EBOOK')
      } else if (bookFormat === 'BOTH') {
        if (urlFormat === 'EBOOK') {
          setSelectedType('EBOOK')
        } else {
          setSelectedType('HARDCOPY')
        }
      } else {
        setSelectedType('HARDCOPY')
      }
    }).catch(() => {
      toast.error('Book not found')
      navigate('/catalog')
    }).finally(() => setLoading(false))
  }, [id, searchParams])

  const handleAddToCart = () => {
    addToCart(book, selectedType)
    toast.success(`Added to cart!`)
  }

  const handleBuyNow = () => {
    buyNow(book, selectedType)
    navigate('/checkout')
  }

  if (loading) return <div className="loading-page"><div className="spinner" /></div>
  if (!book) return null

  const isEbook = selectedType === 'EBOOK'
  const currentPrice = isEbook ? book.price * 0.5 : book.price
  const currentOriginalPrice = book.originalPrice ? (isEbook ? book.originalPrice * 0.5 : book.originalPrice) : null

  const stars = Array.from({ length: 5 }, (_, i) => i < Math.floor(book.rating || 4.5))
  const discount = currentOriginalPrice && currentOriginalPrice > currentPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : null

  return (
    <div className="page">
      <div className="container">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} id="book-back-btn"
                style={{ marginBottom: '2rem' }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '3rem', alignItems: 'start' }}>
          {/* Book Cover */}
          <div>
            {book.coverImageUrl ? (
              <img src={book.coverImageUrl} alt={book.title} className="book-detail-cover" />
            ) : (
              <div style={{
                width: '100%', maxWidth: 300, aspectRatio: '2/3',
                background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-card))',
                borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '5rem', boxShadow: 'var(--shadow-lg)'
              }}>
                📚
              </div>
            )}

            {/* Inventory Status */}
            {inventory && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <Package size={16} style={{ color: inventory.quantity > 0 ? 'var(--success)' : 'var(--error)' }} />
                  <span style={{ color: inventory.quantity > 0 ? 'var(--success)' : 'var(--error)', fontWeight: 600 }}>
                    {inventory.quantity > 0 ? `${inventory.quantity} in stock` : 'Out of stock'}
                  </span>
                </div>
                {inventory.quantity <= 5 && inventory.quantity > 0 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '0.25rem' }}>
                    ⚡ Only {inventory.quantity} left!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Book Details */}
          <div>
            {/* Category Badge */}
            {book.categoryName && (
              <span className="badge badge-purple" style={{ marginBottom: '1rem' }}>
                {book.categoryName}
              </span>
            )}
            {book.bookType === 'EBOOK' && (
              <span className="badge badge-green" style={{ marginBottom: '1rem', marginLeft: '0.5rem' }}>
                <Download size={12} /> eBook
              </span>
            )}
            {book.bookType === 'BOTH' && (
              <span className="badge badge-blue" style={{ marginBottom: '1rem', marginLeft: '0.5rem' }}>
                Available in Both
              </span>
            )}

            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', lineHeight: 1.2, marginBottom: '0.5rem' }}>
              {book.title}
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              by <strong style={{ color: 'var(--purple-400)' }}>{book.author}</strong>
            </p>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div className="rating-stars">
                {stars.map((filled, i) => (
                  <Star key={i} size={18} fill={filled ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {(book.rating || 4.5).toFixed(1)} ({book.reviewCount || 128} reviews)
              </span>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="price-tag">
                <span className="price-currency">₹</span>
                <span className="price-amount">{Number(currentPrice).toFixed(2)}</span>
              </div>
              {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                <>
                  <span style={{ fontSize: '1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    ₹{Number(currentOriginalPrice).toFixed(2)}
                  </span>
                  <span className="badge badge-red">{discount}% OFF</span>
                </>
              )}
            </div>

            {/* Format Selection */}
            {book.bookType === 'BOTH' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                  Select Format
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {[['HARDCOPY', '📦 Hardcopy'], ['EBOOK', '📱 eBook']].map(([type, label]) => (
                    <button
                      key={type}
                      className={`category-pill ${selectedType === type ? 'active' : ''}`}
                      onClick={() => setSelectedType(type)}
                      id={`format-${type}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary btn-lg"
                onClick={handleAddToCart}
                id="detail-add-cart-btn"
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>
              <button
                className="btn btn-gold btn-lg"
                onClick={handleBuyNow}
                id="detail-buy-now-btn"
              >
                ⚡ Buy Now
              </button>
            </div>

            {/* Meta info */}
            <div className="divider" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                ['Publisher', book.publisher],
                ['Year', book.publicationYear],
                ['Pages', book.pages],
                ['Language', book.language],
                ['ISBN', book.isbn],
                ['Format', book.bookType?.toLowerCase() || '-'],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            {book.description && (
              <>
                <div className="divider" />
                <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>About this book</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem' }}>
                  {book.description}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
