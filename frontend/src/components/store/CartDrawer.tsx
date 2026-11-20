import * as Dialog from '@radix-ui/react-dialog'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { lps } from '../../lib/format'

export function CartDrawer() {
  const { items, isOpen, close, setQuantity, remove, totalLps } = useCart()
  const navigate = useNavigate()
  const opener = useRef<HTMLElement | null>(null)

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) close() }}>
      <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-(--z-cart) bg-forest-deep/40" />
      <Dialog.Content aria-describedby={undefined} asChild
        onOpenAutoFocus={() => { opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null }}
        onCloseAutoFocus={(event) => { event.preventDefault(); if (opener.current?.isConnected) opener.current.focus() }}>
      <aside className="fixed inset-y-0 right-0 z-(--z-cart) flex w-full max-w-md flex-col bg-background shadow-2xl">
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <Dialog.Title asChild>
          <h2 className="font-display text-lg font-bold">Tu pedido</h2>
          </Dialog.Title>
          <button onClick={close} aria-label="Cerrar" className="cursor-pointer rounded-full p-2 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <p className="font-display text-lg font-bold">Aún no has elegido tu café</p>
            <p className="text-sm text-muted-foreground">
              Explora la tienda y arma tu pedido por origen, proceso o tueste.
            </p>
            <button
              onClick={() => { close(); navigate('/tienda') }}
              className="mt-2 cursor-pointer rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-forest"
            >
              Ver la carta
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-6">
              {items.map(({ product, quantity, grind }) => (
                <li key={`${product.id}-${grind}`} className="flex gap-4 py-5">
                  <img src={product.imageUrl} alt="" className="h-20 w-16 rounded-md object-cover" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <p className="font-display font-bold leading-tight">{product.name}</p>
                      <p className="font-medium">{lps(product.priceLps * quantity)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{product.presentationGrams} g · {product.roast} · {grind}</p>
                    <div className="mt-auto flex items-center gap-3 pt-2">
                      <div className="inline-flex items-center rounded-full border border-border">
                        <button onClick={() => setQuantity(product.id, grind, quantity - 1)} aria-label="Quitar uno" className="cursor-pointer p-1.5 hover:text-primary"><Minus className="h-3.5 w-3.5" /></button>
                        <span className="w-7 text-center text-sm font-medium">{quantity}</span>
                        <button onClick={() => setQuantity(product.id, grind, quantity + 1)} aria-label="Agregar uno" className="cursor-pointer p-1.5 hover:text-primary"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      <button onClick={() => remove(product.id, grind)} aria-label={`Eliminar ${product.name} ${grind.toLowerCase()}`} className="cursor-pointer p-1.5 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <footer className="space-y-3 border-t border-border px-6 py-5">
              <div className="flex justify-between font-display text-lg font-bold">
                <span>Total</span>
                <span>{lps(totalLps)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Envío, disponibilidad y forma de pago sujetos a confirmación.</p>
              <button
                onClick={() => { close(); navigate('/checkout') }}
                className="w-full cursor-pointer rounded-full bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-forest"
              >
                Confirmar pedido
              </button>
            </footer>
          </>
        )}
      </aside>
      </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
