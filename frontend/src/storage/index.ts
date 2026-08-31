import { CsvRepository } from './repository'
import { productCodec, orderCodec, customerCodec, userCodec } from './codecs'
import type { Product, Order, Customer, User } from '../types'

// Instancias unicas de los repositorios. Cada uno siembra desde su .csv en
// public/data/ la primera vez y persiste mutaciones en localStorage.
// TODO(backend .NET 10): cambiar estas instancias por ApiRepository (misma
// interfaz Repository<T>) apuntando a los endpoints de docs/BACKEND-TODO.md.

export const productsRepo = new CsvRepository<Product>('products', '/data/products.csv', productCodec)
export const ordersRepo = new CsvRepository<Order>('orders', '/data/orders.csv', orderCodec)
export const customersRepo = new CsvRepository<Customer>('customers', '/data/customers.csv', customerCodec)
export const usersRepo = new CsvRepository<User>('users', '/data/users.csv', userCodec)
const ALL_REPOS = [productsRepo, ordersRepo, customersRepo, usersRepo]

/** Restaura el demo al estado semilla (util en presentaciones en vivo). */
export function resetDemoData(): void {
  for (const repo of ALL_REPOS) repo.reset()
  window.location.reload()
}

// Disponible en la consola del navegador para reiniciar el demo.
declare global {
  interface Window {
    resetDemoData: () => void
  }
}
window.resetDemoData = resetDemoData
