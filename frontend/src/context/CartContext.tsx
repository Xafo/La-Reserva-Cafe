import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import type { Product, CartItem } from '../types'

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  add: (product: Product, quantity?: number) => void
  remove: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clear: () => void
  open: () => void
  close: () => void
  totalLps: number
  count: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem('cart')
    return stored ? JSON.parse(stored) : []
  })
  const [isOpen, setIsOpen] = useState(false)

  const persist = (next: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(next))
    setItems(next)
  }

  const add = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      const next = existing
        ? prev.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i))
        : [...prev, { product, quantity }]
      localStorage.setItem('cart', JSON.stringify(next))
      return next
    })
    setIsOpen(true)
  }, [])

  const remove = useCallback((productId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.product.id !== productId)
      localStorage.setItem('cart', JSON.stringify(next))
      return next
    })
  }, [])

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      const next =
        quantity <= 0
          ? prev.filter((i) => i.product.id !== productId)
          : prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
      localStorage.setItem('cart', JSON.stringify(next))
      return next
    })
  }, [])

  const clear = useCallback(() => persist([]), [])

  const totalLps = useMemo(() => items.reduce((s, i) => s + i.product.priceLps * i.quantity, 0), [items])
  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items])

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        add,
        remove,
        setQuantity,
        clear,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        totalLps,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// El hook comparte el contexto con su Provider; no afecta el refresco de producción.
// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
