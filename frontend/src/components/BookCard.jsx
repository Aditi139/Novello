import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ShoppingCart, BookOpen, Star } from 'lucide-react'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

export default function BookCard({ book }) {
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const typeFilter = searchParams.get('type')

  const handleAddToCart = (e) => {
    e.stopPropagation()
    let format = 'HARDCOPY'
    if (book.bookType === 'EBOOK') {
      format = 'EBOOK'
    } else if (book.bookType === 'BOTH') {
      if (typeFilter === 'EBOOK') {
        format = 'EBOOK'
      } else {
        format = 'HARDCOPY'
      }
    }
    addToCart(book, format)
    toast.success(`"${book.title}" (${format.toLowerCase()}) added to cart!`)
  }

  const isCardEbook = book.bookType === 'EBOOK' || (book.bookType === 'BOTH' && typeFilter === 'EBOOK')
  const cardPrice = isCardEbook ? book.price * 0.5 : book.price
  const cardOriginalPrice = book.originalPrice ? (isCardEbook ? book.originalPrice * 0.5 : book.originalPrice) : null

  const discount = cardOriginalPrice && cardOriginalPrice > cardPrice
    ? Math.round(((cardOriginalPrice - cardPrice) / cardOriginalPrice) * 100)
    : null

  const handleCardClick = () => {
    const formatParam = typeFilter ? `?format=${typeFilter}` : ''
    navigate(`/books/${book.id}${formatParam}`)
  }

  return (
    <div className="book-card" onClick={handleCardClick} id={`book-card-${book.id}`}>
      <div className="book-cover">
        {book.coverImageUrl ? (
          <img src={book.coverImageUrl} alt={book.title} loading="lazy" />
        ) : (
          <div className="book-cover-placeholder">📚</div>
        )}
        {discount && (
          <div style={{
            position: 'absolute', top: '0.5rem', left: '0.5rem',
            background: 'var(--error)', color: 'white',
            fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem',
            borderRadius: 'var(--radius-full)'
          }}>
            -{discount}%
          </div>
        )}
        {book.bookType === 'EBOOK' && (
          <div style={{
            position: 'absolute', top: '0.5rem', right: '0.5rem',
            background: 'rgba(16, 185, 129, 0.9)', color: 'white',
            fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.5rem',
            borderRadius: 'var(--radius-full)'
          }}>
            eBOOK
          </div>
        )}
        <div className="book-overlay">
          <button
            className="btn btn-primary btn-sm"
            onClick={handleAddToCart}
            id={`add-cart-${book.id}`}
          >
            <ShoppingCart size={14} /> Add to Cart
          </button>
        </div>
      </div>
      <div className="book-info">
        <div className="book-title">{book.title}</div>
        <div className="book-author">{book.author}</div>
        {book.categoryName && (
          <span className="badge badge-purple" style={{ marginBottom: '0.5rem' }}>
            {book.categoryName}
          </span>
        )}
        <div className="book-footer">
          <div>
            <div className="book-price">₹{Number(cardPrice).toFixed(2)}</div>
            {cardOriginalPrice && cardOriginalPrice > cardPrice && (
              <div className="book-price-original">₹{Number(cardOriginalPrice).toFixed(2)}</div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--gold)' }}>
            <Star size={12} fill="currentColor" />
            {book.rating?.toFixed(1) || '4.5'}
          </div>
        </div>
      </div>
    </div>
  )
}
