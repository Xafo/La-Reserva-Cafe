import { useState, type ReactNode } from 'react'
import type { CoffeeFormat, Product } from '../../types'
import { useCart } from '../../context/CartContext'
import { Dialog } from '../ui/dialog'

interface AddToCartButtonProps {
  product: Product
  quantity?: number
  className: string
  children: ReactNode
}

export function AddToCartButton({ product, quantity = 1, className, children }: AddToCartButtonProps) {
  const { add } = useCart()
  const [open, setOpen] = useState(false)
  const [grind, setGrind] = useState<CoffeeFormat>('En grano')

  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>{children}</button>
      <Dialog open={open} onOpenChange={setOpen}>
        <div>
          <p className="text-sm font-medium text-primary">Preparación del café</p>
          <h2 className="mt-1 font-display text-2xl font-bold">¿Cómo lo preferís?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Elegí la presentación para {product.name}.</p>
          <div className="mt-6 grid gap-3">
            {(['En grano', 'Molido'] as CoffeeFormat[]).map((option) => (
              <label key={option} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 has-checked:border-primary has-checked:bg-primary/5">
                <input type="radio" name={`grind-${product.id}`} value={option} checked={grind === option} onChange={() => setGrind(option)} />
                <span><span className="block font-semibold">{option}</span><span className="text-sm text-muted-foreground">{option === 'En grano' ? 'Para moler en casa.' : 'Listo para preparar.'}</span></span>
              </label>
            ))}
          </div>
          <button onClick={() => { add(product, grind, quantity); setOpen(false) }} className="mt-6 w-full cursor-pointer rounded-full bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-forest">
            Agregar al carrito
          </button>
        </div>
      </Dialog>
    </>
  )
}
