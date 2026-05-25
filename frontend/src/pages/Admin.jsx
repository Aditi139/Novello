import React, { useEffect, useState } from 'react'
import {
  LayoutDashboard, BookOpen, ShoppingBag, Users,
  Package, TrendingUp, Plus, Edit, Trash2, Eye
} from 'lucide-react'
import { booksApi, ordersApi, usersApi, inventoryApi, paymentsApi, categoriesApi } from '../api/axios'
import toast from 'react-hot-toast'

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { key: 'books', label: 'Books', icon: <BookOpen size={16} /> },
  { key: 'orders', label: 'Orders', icon: <ShoppingBag size={16} /> },
  { key: 'inventory', label: 'Inventory', icon: <Package size={16} /> },
  { key: 'users', label: 'Users', icon: <Users size={16} /> },
  { key: 'payments', label: 'Payments', icon: <TrendingUp size={16} /> },
]

const ORDER_STATUSES = ['PENDING', 'PAYMENT_PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [books, setBooks] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [inventory, setInventory] = useState([])
  const [payments, setPayments] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)

  // Book form
  const [showBookForm, setShowBookForm] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [bookForm, setBookForm] = useState({
    title: '', author: '', description: '', isbn: '', price: '', originalPrice: '',
    coverImageUrl: '', publisher: '', publicationYear: '', language: 'English',
    pages: '', bookType: 'HARDCOPY', categoryId: ''
  })

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'dashboard' || activeTab === 'books') {
        const [bRes, cRes] = await Promise.all([booksApi.getAll(0, 50), categoriesApi.getAll()])
        setBooks(bRes.data.content || [])
        setCategories(cRes.data)
      }
      if (activeTab === 'orders' || activeTab === 'dashboard') {
        const oRes = await ordersApi.getAll()
        setOrders(oRes.data)
      }
      if (activeTab === 'users') {
        const uRes = await usersApi.getAll()
        setUsers(uRes.data)
      }
      if (activeTab === 'inventory') {
        const [iRes, cRes] = await Promise.all([inventoryApi.getAll(), categoriesApi.getAll()])
        setInventory(iRes.data)
        setCategories(cRes.data)
      }
      if (activeTab === 'payments') {
        const pRes = await paymentsApi.getAll()
        setPayments(pRes.data)
      }
    } catch (e) {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  const handleBookSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...bookForm,
        price: parseFloat(bookForm.price),
        originalPrice: bookForm.originalPrice ? parseFloat(bookForm.originalPrice) : null,
        publicationYear: bookForm.publicationYear ? parseInt(bookForm.publicationYear) : null,
        pages: bookForm.pages ? parseInt(bookForm.pages) : null,
        categoryId: bookForm.categoryId ? parseInt(bookForm.categoryId) : null,
      }
      if (editingBook) {
        await booksApi.update(editingBook.id, data)
        toast.success('Book updated!')
      } else {
        await booksApi.create(data)
        toast.success('Book created!')
      }
      setShowBookForm(false)
      setEditingBook(null)
      setBookForm({ title: '', author: '', description: '', isbn: '', price: '', originalPrice: '', coverImageUrl: '', publisher: '', publicationYear: '', language: 'English', pages: '', bookType: 'HARDCOPY', categoryId: '' })
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save book')
    }
  }

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Archive this book?')) return
    try {
      await booksApi.delete(id)
      toast.success('Book archived')
      loadData()
    } catch {
      toast.error('Failed to delete book')
    }
  }

  const handleEditBook = (book) => {
    setEditingBook(book)
    setBookForm({
      title: book.title || '', author: book.author || '', description: book.description || '',
      isbn: book.isbn || '', price: book.price || '', originalPrice: book.originalPrice || '',
      coverImageUrl: book.coverImageUrl || '', publisher: book.publisher || '',
      publicationYear: book.publicationYear || '', language: book.language || 'English',
      pages: book.pages || '', bookType: book.bookType || 'HARDCOPY',
      categoryId: book.categoryId || ''
    })
    setShowBookForm(true)
  }

  const handleOrderStatus = async (orderId, status) => {
    try {
      await ordersApi.updateStatus(orderId, status)
      toast.success('Order status updated')
      loadData()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleToggleUser = async (id) => {
    try {
      await usersApi.toggleStatus(id)
      toast.success('User status toggled')
      loadData()
    } catch {
      toast.error('Failed to toggle user')
    }
  }

  const handleSetStock = async (bookId) => {
    const qty = window.prompt('Enter new stock quantity:')
    if (qty === null || isNaN(parseInt(qty))) return
    try {
      await inventoryApi.setStock(bookId, parseInt(qty))
      toast.success('Stock updated')
      loadData()
    } catch {
      toast.error('Failed to update stock')
    }
  }

  // Stats
  const totalRevenue = payments.filter(p => p.status === 'SUCCESS').reduce((s, p) => s + Number(p.amount), 0)
  const paidOrders = orders.filter(o => o.status === 'PAID' || o.status === 'DELIVERED' || o.status === 'PROCESSING').length

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem', padding: '0 0.5rem' }}>
          ⚙️ Admin Panel
        </div>
        {TABS.map(tab => (
          <div
            key={tab.key}
            className={`sidebar-link ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            id={`admin-tab-${tab.key}`}
          >
            {tab.icon} {tab.label}
          </div>
        ))}
      </aside>

      {/* Content */}
      <main className="admin-content">

        {/* ── Dashboard ─────────────────── */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', marginBottom: '2rem' }}>Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
              {[
                { label: 'Total Books', value: books.length, icon: <BookOpen size={22} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
                { label: 'Total Orders', value: orders.length, icon: <ShoppingBag size={22} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
                { label: 'Paid Orders', value: paidOrders, icon: <TrendingUp size={22} />, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
                { label: 'Total Revenue', value: `₹${totalRevenue.toFixed(0)}`, icon: '💰', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', isText: true },
              ].map((stat, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-card-icon" style={{ background: stat.bg, color: stat.color }}>
                    {typeof stat.icon === 'string' ? <span style={{ fontSize: '1.25rem' }}>{stat.icon}</span> : stat.icon}
                  </div>
                  <div className="stat-card-value" style={{ color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Recent Orders</h3>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map(o => (
                    <tr key={o.id}>
                      <td><code style={{ color: 'var(--purple-400)' }}>{o.orderNumber}</code></td>
                      <td style={{ color: 'var(--gold)' }}>₹{Number(o.totalAmount).toFixed(2)}</td>
                      <td><span className={`badge ${o.status === 'DELIVERED' ? 'badge-green' : o.status === 'CANCELLED' ? 'badge-red' : 'badge-purple'}`}>{o.status}</span></td>
                      <td style={{ color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Books ─────────────────────── */}
        {activeTab === 'books' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem' }}>Books</h2>
              <button className="btn btn-primary" onClick={() => { setShowBookForm(true); setEditingBook(null) }} id="admin-add-book-btn">
                <Plus size={16} /> Add Book
              </button>
            </div>

            {/* Book Form Modal */}
            {showBookForm && (
              <div className="modal-overlay" onClick={() => setShowBookForm(false)}>
                <div className="modal" style={{ maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                  <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>
                    {editingBook ? 'Edit Book' : 'Add New Book'}
                  </h3>
                  <form onSubmit={handleBookSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                      <div className="form-group">
                        <label className="form-label">Title *</label>
                        <input className="form-input" value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Author *</label>
                        <input className="form-input" value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea className="form-input" rows={3} value={bookForm.description} onChange={e => setBookForm({...bookForm, description: e.target.value})} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                      <div className="form-group">
                        <label className="form-label">ISBN *</label>
                        <input className="form-input" value={bookForm.isbn} onChange={e => setBookForm({...bookForm, isbn: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Category</label>
                        <select className="form-select" value={bookForm.categoryId} onChange={e => setBookForm({...bookForm, categoryId: e.target.value})}>
                          <option value="">Select category</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem' }}>
                      <div className="form-group">
                        <label className="form-label">Price (₹) *</label>
                        <input className="form-input" type="number" step="0.01" value={bookForm.price} onChange={e => setBookForm({...bookForm, price: e.target.value})} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Original Price (₹)</label>
                        <input className="form-input" type="number" step="0.01" value={bookForm.originalPrice} onChange={e => setBookForm({...bookForm, originalPrice: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Book Type</label>
                        <select className="form-select" value={bookForm.bookType} onChange={e => setBookForm({...bookForm, bookType: e.target.value})}>
                          <option value="HARDCOPY">Hardcopy</option>
                          <option value="EBOOK">eBook</option>
                          <option value="BOTH">Both</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Cover Image URL</label>
                      <input className="form-input" placeholder="https://..." value={bookForm.coverImageUrl} onChange={e => setBookForm({...bookForm, coverImageUrl: e.target.value})} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem' }}>
                      <div className="form-group">
                        <label className="form-label">Publisher</label>
                        <input className="form-input" value={bookForm.publisher} onChange={e => setBookForm({...bookForm, publisher: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Year</label>
                        <input className="form-input" type="number" value={bookForm.publicationYear} onChange={e => setBookForm({...bookForm, publicationYear: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Pages</label>
                        <input className="form-input" type="number" value={bookForm.pages} onChange={e => setBookForm({...bookForm, pages: e.target.value})} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowBookForm(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary" id="book-form-submit">{editingBook ? 'Update' : 'Create'}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Books Table */}
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Cover</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map(book => (
                    <tr key={book.id}>
                      <td>
                        {book.coverImageUrl
                          ? <img src={book.coverImageUrl} alt={book.title} style={{ width: 40, height: 56, objectFit: 'cover', borderRadius: 4 }} />
                          : <div style={{ width: 40, height: 56, background: 'var(--bg-secondary)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>📚</div>
                        }
                      </td>
                      <td style={{ maxWidth: 200, fontWeight: 500, fontSize: '0.875rem' }}>{book.title}</td>
                      <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{book.author}</td>
                      <td>{book.categoryName && <span className="badge badge-purple">{book.categoryName}</span>}</td>
                      <td><span className={`badge ${book.bookType === 'EBOOK' ? 'badge-green' : book.bookType === 'BOTH' ? 'badge-blue' : 'badge-purple'}`}>{book.bookType}</span></td>
                      <td style={{ color: 'var(--gold)', fontWeight: 600 }}>₹{Number(book.price).toFixed(2)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleEditBook(book)} id={`edit-book-${book.id}`}>
                            <Edit size={14} />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteBook(book.id)} id={`delete-book-${book.id}`}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Orders ─────────────────────── */}
        {activeTab === 'orders' && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', marginBottom: '1.5rem' }}>Orders</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>User ID</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td><code style={{ color: 'var(--purple-400)', fontSize: '0.8rem' }}>{o.orderNumber}</code></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{o.userId}</td>
                      <td style={{ color: 'var(--gold)', fontWeight: 600 }}>₹{Number(o.totalAmount).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${o.status === 'DELIVERED' ? 'badge-green' : o.status === 'CANCELLED' ? 'badge-red' : o.status === 'PAID' ? 'badge-blue' : 'badge-purple'}`}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td>
                        <select
                          className="form-select"
                          style={{ padding: '0.375rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                          value={o.status}
                          onChange={e => handleOrderStatus(o.id, e.target.value)}
                          id={`order-status-${o.id}`}
                        >
                          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Inventory ─────────────────── */}
        {activeTab === 'inventory' && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', marginBottom: '1.5rem' }}>Inventory</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Book ID</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Low Stock Threshold</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(inv => (
                    <tr key={inv.id}>
                      <td style={{ color: 'var(--purple-400)' }}>#{inv.bookId}</td>
                      <td style={{ fontWeight: 700, fontSize: '1.1rem' }}>{inv.quantity}</td>
                      <td>
                        <span className={`badge ${inv.quantity === 0 ? 'badge-red' : inv.quantity <= inv.lowStockThreshold ? 'badge-gold' : 'badge-green'}`}>
                          {inv.quantity === 0 ? 'Out of Stock' : inv.quantity <= inv.lowStockThreshold ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{inv.lowStockThreshold}</td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleSetStock(inv.bookId)} id={`set-stock-${inv.bookId}`}>
                          Update Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Users ─────────────────────── */}
        {activeTab === 'users' && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', marginBottom: '1.5rem' }}>Users</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 500 }}>{u.firstName} {u.lastName}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'ADMIN' ? 'badge-gold' : 'badge-purple'}`}>{u.role}</span>
                      </td>
                      <td>
                        <span className={`badge ${u.enabled ? 'badge-green' : 'badge-red'}`}>
                          {u.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td>
                        <button className={`btn btn-sm ${u.enabled ? 'btn-danger' : 'btn-secondary'}`}
                                onClick={() => handleToggleUser(u.id)} id={`toggle-user-${u.id}`}>
                          {u.enabled ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Payments ──────────────────── */}
        {activeTab === 'payments' && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', marginBottom: '1.5rem' }}>Payments</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
              {[
                { label: 'Total Revenue', value: `₹${totalRevenue.toFixed(2)}`, color: 'var(--success)' },
                { label: 'Successful', value: payments.filter(p => p.status === 'SUCCESS').length, color: 'var(--info)' },
                { label: 'Failed', value: payments.filter(p => p.status === 'FAILED').length, color: 'var(--error)' },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Order ID</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Razorpay Payment ID</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>#{p.id}</td>
                      <td style={{ color: 'var(--purple-400)' }}>#{p.orderId}</td>
                      <td style={{ color: 'var(--gold)', fontWeight: 600 }}>₹{Number(p.amount).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${p.status === 'SUCCESS' ? 'badge-green' : p.status === 'FAILED' ? 'badge-red' : 'badge-purple'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.razorpayPaymentId || '-'}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
