import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CustomerAuthProvider, useCustomerAuth } from './context/CustomerAuthContext'
import { CartProvider } from './context/CartContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { CartDrawer } from './components/store/CartDrawer'
import { HomePage } from './pages/store/HomePage'
import { ShopPage } from './pages/store/ShopPage'
import { ProductDetailPage } from './pages/store/ProductDetailPage'
import { CheckoutPage } from './pages/store/CheckoutPage'
import { BusinessCatalogPage } from './pages/store/BusinessCatalogPage'
import { OriginPage } from './pages/store/OriginPage'
import { RegisterPage } from './pages/store/RegisterPage'
import { CustomerLoginPage } from './pages/store/CustomerLoginPage'
import { AccountPage } from './pages/store/AccountPage'
import { LoginPage } from './pages/admin/LoginPage'
import { DashboardPage } from './pages/admin/DashboardPage'
import { ProductsPage } from './pages/admin/ProductsPage'
import { OrdersPage } from './pages/admin/OrdersPage'
import { QualityPage } from './pages/admin/QualityPage'
import { CustomersPage } from './pages/admin/CustomersPage'
import { ReportsPage } from './pages/admin/ReportsPage'
import { UsersPage } from './pages/admin/UsersPage'
import { CommercialRequestsPage } from './pages/admin/CommercialRequestsPage'

const OnboardingDemoPage = import.meta.env.DEV ? lazy(() => import('./pages/store/OnboardingDemoPage')) : null

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

function CustomerRoute({ children }: { children: React.ReactNode }) {
  const { account } = useCustomerAuth()
  if (!account) return <Navigate to="/ingresar" replace />
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <CustomerAuthProvider>
            <CartProvider>
              <ScrollToTop />
              <CartDrawer />
              <Routes>
                {OnboardingDemoPage && <Route path="/demo/quiz" element={<Suspense fallback={<p role="status">Cargando demostración…</p>}><OnboardingDemoPage /></Suspense>} />}
                <Route path="/" element={<HomePage />} />
                <Route path="/tienda" element={<ShopPage />} />
                <Route path="/tienda/:id" element={<ProductDetailPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/empresas" element={<BusinessCatalogPage />} />
                <Route path="/origen" element={<OriginPage />} />
                <Route path="/registro" element={<RegisterPage />} />
                <Route path="/ingresar" element={<CustomerLoginPage />} />
                <Route path="/cuenta" element={<CustomerRoute><AccountPage /></CustomerRoute>} />
                <Route path="/admin/login" element={<LoginPage />} />
                <Route path="/admin" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/admin/productos" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
                <Route path="/admin/ordenes" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/admin/calidad" element={<ProtectedRoute><QualityPage /></ProtectedRoute>} />
                <Route path="/admin/clientes" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
                <Route path="/admin/solicitudes" element={<ProtectedRoute><CommercialRequestsPage /></ProtectedRoute>} />
                <Route path="/admin/reportes" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                <Route path="/admin/usuarios" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </CartProvider>
          </CustomerAuthProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
