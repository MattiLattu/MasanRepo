import { useState, useEffect, useCallback } from 'react'
import './App.css'

const CATEGORIES = ['Electronics', 'Clothing', 'Food', 'Home & Garden', 'Sports']

function getCategoryClass(category) {
  const map = {
    'Electronics': 'badge-electronics',
    'Clothing': 'badge-clothing',
    'Food': 'badge-food',
    'Home & Garden': 'badge-home',
    'Sports': 'badge-sports',
  }
  return map[category] || 'badge-default'
}

function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{t.type === 'success' ? '✓' : '✕'}</span>
          {t.message}
        </div>
      ))}
    </div>
  )
}

function AddProductModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', description: '', price: '', quantity: '0', category: 'Electronics' })
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await onAdd({
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity, 10),
        category: form.category,
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title">
          <span>📦</span> Add New Product
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Product Name <span>*</span></label>
            <input className="form-input" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Wireless Mouse" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" name="description" value={form.description} onChange={handleChange} placeholder="Brief product description..." />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price ($) <span>*</span></label>
              <input className="form-input" name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input className="form-input" name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={loading || !form.name || !form.price}>
              {loading ? 'Adding...' : '+ Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ProductCard({ product, onDelete, onQuantityChange }) {
  const isOutOfStock = product.quantity === 0
  const isLowStock = product.quantity > 0 && product.quantity < 10
  const [updating, setUpdating] = useState(false)

  const handleQty = async (delta) => {
    const newQty = Math.max(0, product.quantity + delta)
    setUpdating(true)
    await onQuantityChange(product.id, newQty)
    setUpdating(false)
  }

  return (
    <div className="product-card">
      <div className="card-header">
        <div className="card-badges">
          <span className={`category-badge ${getCategoryClass(product.category)}`}>{product.category}</span>
          {isOutOfStock && <span className="stock-badge stock-out">Out of Stock</span>}
          {isLowStock && <span className="stock-badge stock-low">⚠ Low Stock</span>}
        </div>
        <button className="delete-btn" onClick={() => onDelete(product.id)} title="Delete product">✕</button>
      </div>
      <div className="card-body">
        <h3 className="product-name">{product.name}</h3>
        {product.description && <p className="product-description">{product.description}</p>}
      </div>
      <div className="card-footer">
        <span className="product-price">${product.price.toFixed(2)}</span>
        <div className="quantity-control">
          <button className="qty-btn" onClick={() => handleQty(-1)} disabled={product.quantity === 0 || updating} title="Decrease quantity">−</button>
          <span className="qty-display">{product.quantity}</span>
          <button className="qty-btn" onClick={() => handleQty(1)} disabled={updating} title="Increase quantity">+</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data)
    } catch {
      addToast('Failed to load products', 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleAdd = async (productData) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })
      if (!res.ok) throw new Error()
      const newProduct = await res.json()
      setProducts(prev => [newProduct, ...prev])
      addToast(`"${newProduct.name}" added successfully!`)
    } catch {
      addToast('Failed to add product', 'error')
      throw new Error()
    }
  }

  const handleDelete = async (id) => {
    const product = products.find(p => p.id === id)
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setProducts(prev => prev.filter(p => p.id !== id))
      addToast(`"${product?.name}" deleted`)
    } catch {
      addToast('Failed to delete product', 'error')
    }
  }

  const handleQuantityChange = async (id, quantity) => {
    try {
      const res = await fetch(`/api/products/${id}/quantity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setProducts(prev => prev.map(p => p.id === id ? updated : p))
    } catch {
      addToast('Failed to update quantity', 'error')
    }
  }

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !categoryFilter || p.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalProducts = products.length
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0)
  const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity < 10).length
  const outOfStockCount = products.filter(p => p.quantity === 0).length

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            <span className="header-icon">📦</span>
            <div>
              <div className="header-title">Inventory Manager</div>
              <div className="header-subtitle">Track and manage your products</div>
            </div>
          </div>
          <div className="product-count-badge">{totalProducts} Products</div>
        </div>
      </header>

      <main className="main-content">
        <div className="stats-bar">
          <div className="stat-card">
            <span className="stat-icon">🗂️</span>
            <div>
              <div className="stat-value">{totalProducts}</div>
              <div className="stat-label">Total Products</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📊</span>
            <div>
              <div className="stat-value">{totalItems.toLocaleString()}</div>
              <div className="stat-label">Total Items</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⚠️</span>
            <div>
              <div className="stat-value" style={{ color: lowStockCount > 0 ? '#d97706' : undefined }}>{lowStockCount}</div>
              <div className="stat-label">Low Stock</div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🚫</span>
            <div>
              <div className="stat-value" style={{ color: outOfStockCount > 0 ? '#dc2626' : undefined }}>{outOfStockCount}</div>
              <div className="stat-label">Out of Stock</div>
            </div>
          </div>
        </div>

        <div className="controls-bar">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="filter-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="add-btn" onClick={() => setShowModal(true)}>
            + Add Product
          </button>
        </div>

        {!loading && filtered.length > 0 && (search || categoryFilter) && (
          <p className="results-info">Showing {filtered.length} of {products.length} products</p>
        )}

        <div className="product-grid">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              Loading inventory...
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{search || categoryFilter ? '🔍' : '📦'}</div>
              <div className="empty-title">
                {search || categoryFilter ? 'No products found' : 'No products yet'}
              </div>
              <div className="empty-subtitle">
                {search || categoryFilter
                  ? 'Try adjusting your search or filter'
                  : 'Click "Add Product" to get started'}
              </div>
            </div>
          ) : (
            filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onDelete={handleDelete}
                onQuantityChange={handleQuantityChange}
              />
            ))
          )}
        </div>
      </main>

      {showModal && (
        <AddProductModal onClose={() => setShowModal(false)} onAdd={handleAdd} />
      )}

      <Toast toasts={toasts} />
    </>
  )
}
