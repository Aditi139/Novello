import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Star, Zap, Shield, Download } from 'lucide-react'
import BookCard from '../components/BookCard'
import { booksApi, categoriesApi } from '../api/axios'

export default function Home() {
  const [featuredBooks, setFeaturedBooks] = useState([])
  const [topRated, setTopRated] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      booksApi.getFeatured(),
      booksApi.getTopRated(),
      categoriesApi.getAll(),
    ]).then(([featured, rated, cats]) => {
      setFeaturedBooks(featured.data)
      setTopRated(rated.data)
      setCategories(cats.data.slice(0, 8))
    }).catch(() => {
      // Demo: show placeholders
      setFeaturedBooks([])
      setTopRated([])
    }).finally(() => setLoading(false))
  }, [])

  const features = [
    { icon: <BookOpen size={24} />, title: 'Curated Collection', desc: 'Handpicked titles spanning fiction, non-fiction, business, science, and more' },
    { icon: <Download size={24} />, title: 'Instant eBooks', desc: 'Purchase once, download your PDF immediately — read anywhere, anytime' },
    { icon: <Shield size={24} />, title: 'Secure Payments', desc: 'Every transaction protected by Razorpay with bank-grade encryption' },
    { icon: <Zap size={24} />, title: 'Reliable Delivery', desc: 'Hardcopy orders dispatched promptly with real-time tracking support' },
  ]

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-content">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <div className="badge badge-purple" style={{ marginBottom: '1.5rem' }}>
                <Star size={12} fill="currentColor" /> Premium Online Bookstore
              </div>
              <h1 className="hero-title">
                <span className="text-gradient">Discover</span> Your Next
                <br />
                <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
                  Great Story
                </span>
              </h1>
              <p className="hero-subtitle">
                Browse thousands of hardcopy and digital books. Secure payments via Razorpay.
                Instant eBook downloads. Your perfect read is just a click away.
              </p>
              <div className="hero-actions">
                <Link to="/catalog" className="btn btn-primary btn-lg" id="hero-browse-btn">
                  Browse Books <ArrowRight size={18} />
                </Link>
                <Link to="/catalog?type=EBOOK" className="btn btn-secondary btn-lg" id="hero-ebook-btn">
                  <Download size={18} /> eBook Store
                </Link>
              </div>

            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {[
                { name: 'Fiction', img: '/images/fiction.jpg', link: '/catalog?category=1', desc: 'Captivating stories & modern novels' },
                { name: 'Fantasy', img: '/images/fantasy.jpg', link: '/catalog?q=Fantasy', desc: 'Magical realms & epic journeys' },
                { name: 'Sci-Fi', img: '/images/scifi.png', link: '/catalog?category=3', desc: 'Futuristic worlds & technology' },
                { name: 'Bestsellers', img: '/images/bestseller.png', link: '/catalog?sort=rating', desc: 'Top trending & highly rated' }
              ].map((cat, i) => (
                <Link
                  key={i}
                  to={cat.link}
                  className="home-category-card"
                  style={{
                    transform: i % 2 === 1 ? 'translateY(20px)' : 'none',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = i % 2 === 1 ? 'translateY(10px) scale(1.03)' : 'translateY(-10px) scale(1.03)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = i % 2 === 1 ? 'translateY(20px)' : 'none';
                  }}
                >
                  <div className="bg-img" style={{ backgroundImage: `url(${cat.img})` }} />
                  <div className="gradient-overlay" />
                  <div className="content">
                    <div className="title">{cat.name}</div>
                    <div className="desc">{cat.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {features.map((f, i) => (
              <div key={i} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 'var(--radius-lg)',
                  background: 'rgba(139,92,246,0.15)', color: 'var(--purple-400)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  {f.icon}
                </div>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────── */}
      {categories.length > 0 && (
        <section style={{ padding: '4rem 0' }}>
          <div className="container">
            <h2 className="section-title">Browse by Genre</h2>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/catalog?category=${cat.id}`}
                  className="category-pill"
                  id={`cat-pill-${cat.id}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Books ─────────────────────────────────── */}
      <section style={{ padding: '2rem 0 4rem' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>New Arrivals</h2>
            <Link to="/catalog" className="btn btn-secondary btn-sm" id="see-all-new">
              See All <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="loading-page"><div className="spinner" /></div>
          ) : featuredBooks.length > 0 ? (
            <div className="books-grid">
              {featuredBooks.map(book => <BookCard key={book.id} book={book} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <h3>No books yet</h3>
              <p>Books added via Admin Dashboard will appear here.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Top Rated ──────────────────────────────────────── */}
      {topRated.length > 0 && (
        <section style={{ padding: '2rem 0 4rem', background: 'var(--bg-secondary)' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                <Star size={24} style={{ color: 'var(--gold)', display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} />
                Top Rated
              </h2>
              <Link to="/catalog?sort=rating" className="btn btn-secondary btn-sm">
                See All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="books-grid">
              {topRated.map(book => <BookCard key={book.id} book={book} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ────────────────────────────────────────────── */}
      <section style={{ padding: '6rem 0' }}>
        <div className="container">
          <div className="gradient-border" style={{ padding: '3rem', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.25rem', marginBottom: '1rem' }}>
              Start Your Reading Journey Today
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
              Create a free account and get access to thousands of books. Secure payments powered by Razorpay.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/register" className="btn btn-primary btn-lg" id="cta-signup-btn">
                Get Started Free
              </Link>
              <Link to="/catalog" className="btn btn-secondary btn-lg">
                Browse Books
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="navbar-logo" style={{ marginBottom: '1rem' }}>📚 Novello</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: 300 }}>
                Your premium online bookstore for hardcopy and digital books. Powered by microservices architecture.
              </p>
            </div>
            <div>
              <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>Catalog</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Fiction', 'Non-Fiction', 'Science', 'Business'].map(g => (
                  <Link key={g} to="/catalog" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.target.style.color = 'var(--purple-400)'}
                        onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                  >{g}</Link>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>Account</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[['My Orders', '/orders'], ['Downloads', '/downloads'], ['Login', '/login'], ['Register', '/register']].map(([label, path]) => (
                  <Link key={label} to={path} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.target.style.color = 'var(--purple-400)'}
                        onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                  >{label}</Link>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>Payments</h4>
              <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Secured by</div>
                <div style={{ fontWeight: 700, color: 'var(--purple-400)' }}>Razorpay</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>256-bit SSL Encrypted</div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Novello. All rights reserved. Built by Aditi Kumari.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
