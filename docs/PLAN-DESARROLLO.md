# Plan de Desarrollo — Plataforma LA RESERVA (Café y Tostadería)

> Documento de trabajo para continuar el desarrollo. Pensado para usarse como
> contexto/spec en un agente de código (Codex): contiene el estado actual, las
> decisiones técnicas, el modelo de datos, el contrato de API que el frontend ya
> espera, y el roadmap por fases con tareas concretas.

---

## 0. Cómo usar este documento en Codex

1. Apuntá Codex al repositorio del frontend (carpeta `frontend/`).
2. Objetivo inmediato: **Fase 1 — construir el backend .NET 10 + PostgreSQL** y
   conectarlo al frontend existente **sin cambiar las firmas** de la capa de
   servicios.
3. Regla de oro: el frontend ya define el contrato. No inventar endpoints ni
   DTOs nuevos; implementar exactamente lo que consume `frontend/src/services/index.ts`
   (marcado con `TODO(backend)`).

---

## 1. Contexto y estado actual

Plataforma de gestión y comercialización de café para **LA RESERVA** (Honduras).
El **frontend está construido y aprobado** (demo funcional en línea); los datos
hoy viven en una capa CSV/localStorage que es un *placeholder* de la base de
datos real.

**Stack frontend (ya hecho):** React 19 + Vite + Tailwind 4 + React Router 7 + TypeScript.

**Superficies:**
- Tienda pública: `/`, `/tienda`, `/tienda/:id`, `/checkout`, `/origen`
- Cuentas de cliente: `/registro` (con quiz de preferencias + recomendación), `/ingresar`, `/cuenta`
- Panel admin (por rol): `/admin`, `/admin/productos`, `/admin/ordenes`, `/admin/calidad`, `/admin/clientes`, `/admin/reportes`, `/admin/usuarios`

**Capa de datos actual (a reemplazar):**
- `frontend/src/storage/` — `Repository<T>` + `CsvRepository<T>`, semillas en `frontend/public/data/*.csv`, persistencia en `localStorage`.
- `frontend/src/services/index.ts` — **única frontera UI ↔ datos**. Cada método tiene su endpoint marcado con `TODO(backend)`.
- `frontend/src/config/api.ts` — wrapper `api<T>()` con `Authorization: Bearer` + flujo de refresh ya preparado. Proxy dev de Vite: `/api` → `http://localhost:5120`.
- `docs/STORAGE.md` — mapeo entidad ↔ tabla y plan de swap.

---

## 2. Decisiones técnicas (confirmadas con el cliente)

| Tema | Decisión |
|---|---|
| Backend | **.NET 10**, Clean Architecture (Domain / Application / Infrastructure / API) |
| ORM / BD | **EF Core + PostgreSQL** (`Npgsql.EntityFrameworkCore.PostgreSQL`) |
| Auth | JWT (access + refresh) + hashing de contraseñas (ASP.NET Core Identity o `PasswordHasher`) |
| PDF | **QuestPDF** (órdenes imprimibles, export de reportes) |
| Excel | **ClosedXML** (export de reportes) |
| Hosting | Postgres en Supabase/Neon · API en Render/Railway · Frontend en Vercel |
| Tienda | Catálogo + captura de pedidos, **sin pasarela de pago** (fuera de alcance) |

---

## 3. Arquitectura objetivo (.NET 10)

```
backend/
├── src/
│   ├── LaReserva.Domain/          # Entidades, enums, reglas de dominio
│   ├── LaReserva.Application/     # DTOs, interfaces de repos/servicios, casos de uso (CQRS opcional)
│   ├── LaReserva.Infrastructure/  # EF Core DbContext, migraciones, repos, JWT, QuestPDF, ClosedXML
│   └── LaReserva.Api/             # Minimal API o Controllers, DI, middleware, Swagger
└── tests/
```

- API base: `/api`. CORS habilitado para el origen del frontend.
- Devolver DTOs con los **mismos nombres de campo (camelCase)** que los tipos de
  `frontend/src/types/index.ts` para no tocar la UI.
- Puerto de desarrollo: **5120** (coincide con el proxy de Vite).

---

## 4. Modelo de datos (entidades → tablas PostgreSQL)

Fuente de verdad de los tipos: `frontend/src/types/index.ts`. Enums en español
(coinciden con los datos y la UI).

### Product → `products` (+ `quality_profiles` 1:1)
```
id            text PK            (ej. 'p-blend')
name          text
origin        text              (ej. 'Campamento, Olancho')
region        text
process       text              enum: 'Lavado' | 'Honey' | 'Natural'
roast         text              enum: 'Claro' | 'Medio' | 'Oscuro'
presentation_grams int
price_lps     numeric
stock         int
active        bool
description    text
image_url     text
image_alt     text
-- quality (tabla quality_profiles, FK product_id):
grain_type    text
altitude_masl int
humidity_pct  numeric
harvest_date  date
producer      text
grade         text              enum: 'Premium' | 'Exportacion' | 'Estandar'
cupping_score numeric
notes         text[]            (o tabla hija product_notes)
```

### Order → `orders` (+ `order_items`)
```
orders:      id text PK ('OC-2026-0149'), customer_name text,
             status text enum('Pendiente'|'Aprobada'|'Cancelada'|'Finalizada'),
             created_at timestamptz, total_lps numeric
order_items: id serial PK, order_id FK, product_id, product_name, quantity int, unit_price_lps numeric
```

### Customer → `customers`
```
id text PK, name, email, phone, type text enum('Cliente'|'Proveedor'), city, total_orders int
```

### User (equipo/admin) → `users`
```
id text PK, name, email, role text enum('Administrador'|'Compras'|'Ventas'|'Supervisor'),
password_hash text
```
Matriz de permisos (de `services/index.ts`, replicar en backend para autorización):
```
Administrador: productos, calidad, ordenes, clientes, reportes, usuarios
Compras:       productos, calidad, ordenes, clientes
Ventas:        ordenes, clientes, reportes
Supervisor:    productos, calidad, ordenes, clientes, reportes
```

### CustomerAccount (cliente de la tienda) → `customer_accounts` (+ `customer_preferences`)
```
customer_accounts:   id, name, email, password_hash, phone, city, created_at,
                     recommended_product_id (FK products, nullable)
customer_preferences (1:1, nullable): goals[], brew_methods[], drink_styles[],
                     flavor_families[], intensity, budget, updated_at
```
Enums de preferencias (ver tipos): `PlatformGoal`, `BrewMethod`, `DrinkStyle`,
`FlavorFamily`, `Intensity`, `Budget`.

> Semillas iniciales: importar desde `frontend/public/data/*.csv` (products, orders,
> customers, users, accounts) como datos de arranque de la BD.

---

## 5. Contrato de API (lo que el frontend ya consume)

Implementar exactamente estas firmas. Los tipos de retorno son los DTOs de
`frontend/src/types/index.ts`.

### Auth (equipo)
```
POST   /api/auth/login              { email, password } → { user, accessToken, refreshToken }
POST   /api/auth/refresh            { refreshToken } → { accessToken }
POST   /api/auth/forgot-password    { email } → 204   (envío de correo de recuperación)
```

### Productos
```
GET    /api/products?activeOnly=true   → Product[]
GET    /api/products/{id}              → Product
POST   /api/products                   (multipart: datos + imagen) → Product
PUT    /api/products/{id}              → Product
```

### Órdenes
```
GET    /api/orders                     → Order[]
POST   /api/orders                     { customerName, items[] } → Order
PATCH  /api/orders/{id}/status         { status } → 204
GET    /api/orders/{id}/pdf            → application/pdf   (QuestPDF)
```

### Clientes y proveedores
```
GET    /api/customers                  → Customer[]
POST   /api/customers                  → Customer
PUT    /api/customers/{id}             → Customer
```

### Usuarios (solo Administrador)
```
GET    /api/users                      → User[]
POST   /api/users                      (invitar) → User
PUT    /api/users/{id}                 → User
GET    /api/audit-log                  → AuditEntry[]   (bitácora)
```

### Cuentas de cliente (tienda)
```
POST   /api/accounts                   (registro) → CustomerAccount
POST   /api/accounts/login             → { account, token }
PUT    /api/accounts/{id}/preferences  { preferences, recommendedProductId } → CustomerAccount
GET    /api/accounts                   → CustomerAccount[]   (inteligencia de ventas, admin)
```

### Reportes
```
GET    /api/reports/summary            → { salesLps, pendingOrders, activeProducts, lowStock[], recentOrders[], topProducts[] }
GET    /api/reports/export?type={t}&format=pdf|xlsx → archivo
```

> La recomendación de café (`recommendationService`) hoy es lógica pura en el
> frontend (`frontend/src/services/recommendation.ts`). Puede quedarse en el
> cliente o exponerse como `POST /api/recommendations`. No es bloqueante.

---

## 6. Integración con el frontend (punto de swap)

Dos opciones equivalentes; **mantener las firmas** de `services/index.ts` intactas:

- **A (recomendada):** crear `ApiRepository<T>` que implemente `Repository<T>`
  (misma interfaz que `CsvRepository`) usando `api<T>()` de `config/api.ts`, y
  cambiar las instancias en `frontend/src/storage/index.ts` (una línea por entidad).
- **B:** reemplazar el cuerpo de cada método de `services/index.ts` por una
  llamada `api<T>(endpoint)`.

Checklist de conexión:
- [x] `config/api.ts`: base URL configurable mediante `VITE_API_URL` (por defecto `/api`).
- [x] Auth real: `accessToken` de corta duración en `sessionStorage`; refresh token rotativo en cookie `HttpOnly` (no accesible desde JavaScript). `AuthContext` y `CustomerAuthContext` usan sesiones reales.
- [x] CORS restringido a los orígenes configurados del frontend.
- [x] Migrar los CSV a la BD (seed) y validar que la UI se ve igual.

---

## 7. Roadmap por fases

### Fase 0 — Demo funcional + marca (ENTREGADO)
Diseño, tienda, quiz de recomendación, panel admin y publicación en línea.

### Fase 1 — Backend seguro + base de datos (COMPLETADA)
- [x] Solución .NET 10 con capas Domain/Application/Infrastructure/Api.
- [x] EF Core + PostgreSQL, entidades y migraciones (sección 4).
- [x] Seed desde `frontend/public/data/*.csv`.
- [x] Auth: contraseñas hasheadas + JWT de corta duración + refresh token rotativo revocable.
- [x] Endpoints de lectura + login (sección 5).
- [x] Conectar el frontend (sección 6). **Meta: la UI se ve idéntica, ahora con datos reales.**
- Completa módulo **3.1 (base)**.

### Fase 2 — Gestión administrativa completa
- [x] CRUD de productos con **carga de imágenes** (POST/PUT `/api/products`).
- [x] Ficha de calidad editable.
- [x] CRUD de usuarios (invitar/editar/desactivar) + asignación de rol.
- [x] CRUD de clientes y proveedores.
- [x] Creación manual de órdenes multiproducto en el admin.
- Completa módulos **3.2 · 3.3 · 3.4 · 3.5**. Habilitar los botones hoy marcados `TODO(backend)` en las páginas admin.

### Fase 3 — Documentos y reportería
- [ ] `GET /api/orders/{id}/pdf` con **QuestPDF**.
- [ ] `/api/reports/summary` calculado con datos reales.
- [ ] `/api/reports/export?format=pdf|xlsx` (**QuestPDF** + **ClosedXML**): ventas, inventario, más vendidos, movimientos por fecha.
- Completa módulos **3.6 · 3.7**.
- **➤ HITO: Entrega de avance funcional → pago 30%.**

### Fase 4 — Seguridad avanzada y auditoría
- [ ] `POST /api/auth/forgot-password` (correo de recuperación).
- [ ] Bitácora de acciones por usuario + `GET /api/audit-log`.
- [ ] "Actividad reciente" del dashboard alimentada por la bitácora.
- Completa módulo **3.1 (completo)**.

### Fase 5 — Puesta en producción y entrega
- [ ] Publicar Postgres + API + frontend, dominio propio.
- [ ] Pruebas finales, capacitación al equipo y manual de uso.
- [ ] Inicia garantía de 30 días de soporte correctivo.
- [ ] Definir el almacenamiento persistente y cifrado de claves de ASP.NET Data Protection si se incorporan funciones que dependan de él en producción.
- **➤ HITO: Entrega final → pago 20%.**

---

## 8. Convenciones

- Clean Architecture; dependencias hacia adentro (Api → Application → Domain; Infrastructure implementa interfaces de Application).
- DTOs en **camelCase** para calzar con los tipos del frontend.
- Enums en español, tal cual la UI (`'Lavado'`, `'Pendiente'`, `'Administrador'`, …).
- Sin emojis en el código. Comentarios y mensajes en español.
- Precios en Lempiras (`priceLps`, `totalLps`). Fechas ISO 8601 / `timestamptz`.

---

## 9. Fuera de alcance (cotizar aparte si el cliente lo pide)

- Pasarela de pago en línea (tarjeta/transferencia). La tienda es catálogo + captura de pedidos; el pago se coordina fuera del sistema.
- App móvil nativa.
- Facturación electrónica / integración fiscal.
