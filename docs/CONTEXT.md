# Contexto del proyecto — CafeStore

Snapshot generado: 2026-06-10
Estado: **frontend completo con mocks, backend pendiente**

---

## Qué es

Plataforma web de gestión y comercialización de café de especialidad hondureño.
Nombre de trabajo: **ALTURA** (cliente aún no entrega nombre real ni logo).

Dos superficies:
- **Storefront público** — venta directa al cliente final
- **Portal admin por roles** — gestión interna de catálogo, órdenes, clientes/proveedores, reportería

---

## Cómo retomar en una nueva sesión

```
Directorio: /Users/desarrollo/Proyectos Net/cafe-platform
Frontend:   /frontend  (React 19 + Vite 8 + TS + Tailwind 4)
Backend:    NO iniciado — base será DotForge (.NET Core 10)
```

```bash
cd "/Users/desarrollo/Proyectos Net/cafe-platform/frontend"
npm install
npm run dev      # http://localhost:5173
npm run build    # verifica tipos + bundle
```

Usuarios demo (cualquier contraseña):
- `admin@altura.hn` → Administrador (acceso total)
- `compras@altura.hn` → Compras
- `ventas@altura.hn` → Ventas
- `supervisor@altura.hn` → Supervisor

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19, Vite 8, TypeScript 6 |
| Estilos | Tailwind CSS 4 (Vite plugin), OKLCH color space |
| Fuentes | Cabinet Grotesk (display) + General Sans (body) — Fontshare |
| Routing | React Router v7 |
| Estado | Context API (Auth en sessionStorage, Cart en localStorage) |
| Backend | .NET Core 10 — Clean Architecture (DotForge) — PENDIENTE |

---

## Diseño

Sistema definido en `PRODUCT.md` y `DESIGN.md`.
Skills aplicados: `impeccable` + `taste` (en `.claude/skills/`).

Paleta OKLCH principal:
- `--background: oklch(1 0 0)` — blanco puro
- `--primary: oklch(0.43 0.1 132)` — verde cafetal
- `--forest: oklch(0.26 0.055 135)` — hero / footer
- `--accent: oklch(0.76 0.13 80)` — dorado miel
- `--ink: oklch(0.20 0.015 130)` — texto cuerpo

**Prohibido**: café-marrón/crema, glassmorphism, gradient text, secciones con numeración al estilo "01 / 02", eyebrows en mayúsculas en cada sección, border-stripe lateral.

---

## Arquitectura frontend

```
frontend/src/
├── types/index.ts          ← DTOs completos (Product, Order, Customer, User, Cart)
├── data/
│   ├── mock.ts             ← 6 cafés, 5 órdenes, 5 clientes, 4 usuarios
│   └── images.ts           ← Unsplash IDs verificados HTTP 200
├── services/index.ts       ← Contrato de servicios (TODO(backend) por endpoint)
├── context/
│   ├── AuthContext.tsx      ← login/logout mock; TODO(backend): JWT DotForge
│   └── CartContext.tsx      ← persistencia localStorage
├── lib/
│   ├── format.ts           ← lps(), shortDate() con locale es-HN
│   └── utils.ts            ← cn() helper (clsx + tailwind-merge)
├── components/
│   ├── store/              ← BrandMark, StoreNav, ProductCard, CartDrawer
│   └── AdminLayout.tsx     ← sidebar + StatusBadge
└── pages/
    ├── store/              ← HomePage, ShopPage, ProductPage, CheckoutPage, OriginPage
    └── admin/              ← DashboardPage, ProductsPage, QualityPage, OrdersPage,
                               CustomersPage, ReportsPage, UsersPage, LoginPage
```

---

## Contrato de servicios (para el backend)

Ver `docs/BACKEND-TODO.md` para la lista completa de endpoints.

Regla de integración: sustituir el cuerpo de cada función en `services/index.ts`
por `api<T>()` (ya implementado en `frontend/src/config/api.ts` del template DotForge).
No tocar las firmas; no tocar los componentes.

---

## Roles y permisos

| Permiso | Administrador | Compras | Ventas | Supervisor |
|---|---|---|---|---|
| dashboard | X | X | X | X |
| productos | X | X | | X |
| calidad | X | X | | X |
| ordenes | X | X | X | X |
| clientes | X | X | X | |
| reportes | X | | | X |
| usuarios | X | | | |

Función: `hasPermission(role, permission)` en `services/index.ts`.
La autorización real (policies) va en el backend — el frontend solo oculta nav items.

---

## Equipo (emulado)

| Persona | Commits |
|---|---|
| Karla M. | Arquitectura, tipos, servicios, docs |
| Fable | Diseño, storefront, sistema de diseño |
| Rodrigo P. | Admin, contextos, routing |

---

## Placeholders pendientes del cliente

- `TODO(brand)` — nombre real de la empresa, logo SVG
- `TODO(copy)` — textos institucionales: misión, historia, descripción de productos
- Buscar con: `grep -r "TODO(brand)\|TODO(copy)" frontend/src`

---

## Git

```
git log --oneline
8ac993f  Portal administrativo por roles, contextos de auth/carrito y routing completo
0fff192  Sistema de diseno y storefront: paleta verde cafetal OKLCH, Cabinet Grotesk, hero cinematografico
2d79148  Arquitectura base: tipos, contrato de servicios mock y docs de integracion .NET
Tag:     cafestore-v1.0  ← snapshot de plantilla frontend completa
```
