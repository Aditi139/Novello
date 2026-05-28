import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, Grid, List } from 'lucide-react'
import BookCard from '../components/BookCard'
import { booksApi, categoriesApi } from '../api/axios'

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [books, setBooks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const keyword = searchParams.get('q') || ''
  const categoryId = searchParams.get('category') || ''
  const bookType = searchParams.get('type') || ''
  const page = parseInt(searchParams.get('page') || '0')

  const [searchInput, setSearchInput] = useState(keyword)
  const [selectedCategory, setSelectedCategory] = useState(categoryId)
  const [selectedType, setSelectedType] = useState(bookType)

  useEffect(() => {
    categoriesApi.getAll()
      .then(r => setCategories(Array.isArray(r.data) ? r.data : []))
      .catch(() => setCategories([]))
  }, [])

  const fetchBooks = useCallback(async () => {
    setLoading(true)
    try {
      let res
      if (keyword) {
        res = await booksApi.search(keyword, page)
      } else if (categoryId) {
        res = await booksApi.getByCategory(categoryId, page)
      } else if (bookType) {
        res = await booksApi.getByType(bookType, page)
      } else {
        res = await booksApi.getAll(page)
      }
      const data = res.data || {}
      setBooks(Array.isArray(data.content) ? data.content : [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch {
      setBooks([])
    } finally {
      setLoading(false)
    }
  }, [keyword, categoryId, bookType, page])

  useEffect(() => { fetchBooks() }, [fetchBooks])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = {}
    if (searchInput.trim()) params.q = searchInput.trim()
    setSearchParams(params)
    setSelectedCategory('')
    setSelectedType('')
  }

  const handleCategory = (id) => {
    setSelectedCategory(id)
    setSelectedType('')
    setSearchInput('')
    if (id) setSearchParams({ category: id })
    else setSearchParams({})
  }

  const handleType = (type) => {
    setSelectedType(type)
    setSelectedCategory('')
    setSearchInput('')
    if (type) setSearchParams({ type })
    else setSearchParams({})
  }

  const handlePage = (p) => {
    const params = {}
    if (keyword) params.q = keyword
    if (categoryId) params.category = categoryId
    if (bookType) params.type = bookType
    params.page = p
    setSearchParams(params)
  }

  const bookTypes = [
    { key: '', label: 'All' },
    { key: 'HARDCOPY', label: '📦 Hardcopy' },
    { key: 'EBOOK', label: '📱 eBook' },
    { key: 'BOTH', label: '📚 Both' },
  ]

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: '0.5rem' }}>
            Book Catalog
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {totalElements > 0 ? `${totalElements} books found` : 'Browse our full collection'}
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="search-bar" style={{ marginBottom: '2rem', marginLeft: 0, maxWidth: '100%', display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} className="search-icon" />
            <input
              id="catalog-search-input"
              type="text"
              className="search-input"
              placeholder="Search by title, author, or ISBN..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" id="catalog-search-btn">Search</button>
        </form>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', marginBottom: '2rem' }}>
          {/* Book Type Filter */}
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {bookTypes.map(t => (
                <button
                  key={t.key}
                  className={`category-pill ${selectedType === t.key && !categoryId ? 'active' : ''}`}
                  onClick={() => handleType(t.key)}
                  id={`type-filter-${t.key || 'all'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Pills */}
        {Array.isArray(categories) && categories.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</div>
            <div className="category-pills">
              <button
                className={`category-pill ${!selectedCategory ? 'active' : ''}`}
                onClick={() => handleCategory('')}
                id="cat-filter-all"
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`category-pill ${selectedCategory === String(cat.id) ? 'active' : ''}`}
                  onClick={() => handleCategory(String(cat.id))}
                  id={`cat-filter-${cat.id}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Books Grid */}
        {loading ? (
          <div className="loading-page"><div className="spinner" /></div>
        ) : (Array.isArray(books) && books.length > 0) ? (
          <>
            <div className="books-grid">
              {books.map(book => <BookCard key={book.id} book={book} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button className="page-btn" onClick={() => handlePage(page - 1)} disabled={page === 0}>‹</button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = page < 4 ? i : page - 3 + i
                  if (p >= totalPages) return null
                  return (
                    <button key={p} className={`page-btn ${p === page ? 'active' : ''}`}
                            onClick={() => handlePage(p)}>{p + 1}</button>
                  )
                })}
                <button className="page-btn" onClick={() => handlePage(page + 1)} disabled={page >= totalPages - 1}>›</button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No books found</h3>
            <p>{keyword ? `No results for "${keyword}"` : 'No books available in this category'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
