# TODO — CafeStore

Estado al 2026-06-10. Frontend completo; backend pendiente.

---

## Del cliente (bloqueantes)

- [ ] Nombre real de la empresa (reemplaza "ALTURA" — buscar `TODO(brand)`)
- [ ] Logo SVG entregado por el cliente
- [ ] Copy institucional: misión, historia, descripción de cada café (`TODO(copy)`)
- [ ] Fotos propias de los productos (actualmente Unsplash)
- [ ] Definir pasarela de pagos (tarjeta / transferencia bancaria)
- [ ] Credenciales de producción (dominio, hosting, base de datos)

---

## Backend .NET Core 10

Ver `docs/BACKEND-TODO.md` para detalle completo de endpoints.

### Auth
- [ ] `POST /api/auth/login` — adaptar el de DotForge; agregar roles hondureños
- [ ] `POST /api/auth/refresh` — ya en DotForge; verificar claims de rol
- [ ] `POST /api/auth/forgot-password`

### Catálogo
- [ ] `GET /api/products` con filtros (activeOnly, proceso, tueste)
- [ ] `POST /api/products` + subida de imagen (S3 / local)
- [ ] `PUT /api/products/{id}`
- [ ] QualityProfile anidado en el DTO de Product

### Órdenes
- [ ] `GET /api/orders` con paginación y filtros por estado
- [ ] `POST /api/orders` (checkout)
- [ ] `PATCH /api/orders/{id}/status`
- [ ] `GET /api/orders/{id}/pdf` — QuestPDF sugerido

### Clientes / Proveedores
- [ ] `GET /api/customers`
- [ ] `POST /api/customers`
- [ ] `PUT /api/customers/{id}`

### Reportería
- [ ] `GET /api/reports/summary` — KPIs del dashboard
- [ ] `GET /api/reports/export?type=ventas&format=xlsx`
- [ ] `GET /api/reports/export?type=inventario&format=pdf`
- [ ] Los 6 reportes definidos en `ReportsPage.tsx`

### Infraestructura
- [ ] `GET /api/audit-log` — bitácora por usuario
- [ ] Configurar roles en Identity (Administrador/Compras/Ventas/Supervisor)
- [ ] Policies de autorización por endpoint (el frontend solo oculta nav)
- [ ] Variables de entorno: `VITE_API_URL` en `.env.production`
- [ ] CI/CD pipeline (GitHub Actions sugerido)

---

## Frontend — mejoras post-cliente

- [ ] Sustituir `data/mock.ts` por `api<T>()` en cada función de `services/index.ts`
- [ ] Cambiar AuthContext de sessionStorage a JWT real (patrón DotForge)
- [ ] Completar flujo de recuperación de contraseña (`/admin/forgot-password`)
- [ ] Página de auditoría (`/admin/auditoria`)
- [ ] Botón "Invitar usuario" en `/admin/usuarios`
- [ ] Botones de exportar PDF/Excel en ReportsPage (habilitados cuando exista backend)
- [ ] Internacionalización si el cliente quiere inglés (estructura i18n ya eliminada del DotForge base — reintegrar solo si se pide)
- [ ] SEO: Open Graph, sitemap, robots.txt para el storefront público
- [ ] PWA offline (si el cliente vende en zonas con conectividad baja)

---

## Diseño / UX

- [ ] Reemplazar BrandMark SVG placeholder por logo real (`TODO(brand)` en BrandMark.tsx)
- [ ] Fotos de producto con fondo blanco / lifestyle real
- [ ] Revisar copy de todos los `TODO(copy)` con el cliente
- [ ] Colores exactos de la marca real (la paleta OKLCH actual es provisional)
- [ ] Favicon real

---

## Infraestructura / Producción

- [ ] Definir hosting (Azure / Hetzner / VPS Honduras)
- [ ] SSL y dominio
- [ ] Base de datos: Oracle o SQL Server (DotForge soporta ambos)
- [ ] Storage de imágenes (S3-compatible o local)
- [ ] Plan de backups

---

## Hecho (no mover)

- [x] Arquitectura de tipos y DTOs (`src/types/index.ts`)
- [x] Contrato de servicios con `TODO(backend)` por endpoint
- [x] 6 cafés mock con perfiles de calidad auténticos hondureños
- [x] Storefront: Home, Tienda, Producto, Checkout, Origen
- [x] Portal admin: Dashboard, Catálogo, Calidad, Órdenes, Clientes, Reportes, Usuarios
- [x] Sistema de roles y `hasPermission()`
- [x] CartContext (localStorage) + AuthContext (sessionStorage mock)
- [x] Sistema de diseño: OKLCH + Fontshare + PRODUCT.md + DESIGN.md
- [x] Git con 3 commits emulando equipo (Karla / Fable / Rodrigo)
- [x] Build limpio: 334 KB JS, 40 KB CSS, 0 errores TypeScript
- [x] Verificado en navegador: desktop + móvil 375 px
