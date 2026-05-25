import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('novello_cart')
    if (saved) setCart(JSON.parse(saved))
  }, [])

  const saveCart = (items) => {
    setCart(items)
    localStorage.setItem('novello_cart', JSON.stringify(items))
  }

  const addToCart = (book, itemType = 'HARDCOPY') => {
    const unitPrice = itemType === 'EBOOK' ? Number((book.price * 0.5).toFixed(2)) : Number(book.price)
    const existing = cart.find((i) => i.bookId === book.id && i.itemType === itemType)
    if (existing) {
      saveCart(cart.map((i) =>
        i.bookId === book.id && i.itemType === itemType
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ))
    } else {
      saveCart([...cart, {
        bookId: book.id,
        bookTitle: book.title,
        bookAuthor: book.author,
        coverImageUrl: book.coverImageUrl,
        unitPrice: unitPrice,
        quantity: 1,
        itemType,
        bookType: book.bookType,
      }])
    }
  }

  const removeFromCart = (bookId, itemType) => {
    saveCart(cart.filter((i) => !(i.bookId === bookId && i.itemType === itemType)))
  }

  const updateQuantity = (bookId, itemType, quantity) => {
    if (quantity <= 0) {
      removeFromCart(bookId, itemType)
      return
    }
    saveCart(cart.map((i) =>
      i.bookId === bookId && i.itemType === itemType ? { ...i, quantity } : i
    ))
  }

  const switchFormat = (bookId, currentItemType, newFormat) => {
    if (currentItemType === newFormat) return

    const itemToSwitch = cart.find((i) => i.bookId === bookId && i.itemType === currentItemType)
    if (!itemToSwitch) return

    const remaining = cart.filter((i) => !(i.bookId === bookId && i.itemType === currentItemType))
    const existingNewFormatItem = remaining.find((i) => i.bookId === bookId && i.itemType === newFormat)

    let originalPrice = Number(itemToSwitch.unitPrice)
    if (currentItemType === 'EBOOK') {
      originalPrice = Number((originalPrice / 0.5).toFixed(2))
    }
    const newUnitPrice = newFormat === 'EBOOK' ? Number((originalPrice * 0.5).toFixed(2)) : originalPrice

    if (existingNewFormatItem) {
      saveCart(remaining.map((i) =>
        i.bookId === bookId && i.itemType === newFormat
          ? { ...i, quantity: i.quantity + itemToSwitch.quantity, unitPrice: newUnitPrice }
          : i
      ))
    } else {
      saveCart([...remaining, { ...itemToSwitch, itemType: newFormat, unitPrice: newUnitPrice }])
    }
  }

  const clearCart = () => saveCart([])

  const buyNow = (book, itemType = 'HARDCOPY') => {
    const unitPrice = itemType === 'EBOOK' ? Number((book.price * 0.5).toFixed(2)) : Number(book.price)
    saveCart([{
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      coverImageUrl: book.coverImageUrl,
      unitPrice: unitPrice,
      quantity: 1,
      itemType,
      bookType: book.bookType,
    }])
  }

  const getTotalItems = () => cart.reduce((sum, i) => sum + i.quantity, 0)

  const getTotalPrice = () =>
    cart.reduce((sum, i) => sum + Number(i.unitPrice) * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      cart, addToCart, buyNow, removeFromCart, updateQuantity, switchFormat, clearCart, getTotalItems, getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
