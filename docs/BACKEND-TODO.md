# Backend .NET Core 10 — Pendientes

> Estado vigente (21 de septiembre de 2026): la API .NET 10 y la conexión del
> frontend ya existen. Este inventario es histórico. Seguir el
> [diagnóstico por fases](DIRECTO-CAFE-PLAN-POR-FASES.md): faltan onboarding por
> perfil, solicitudes comerciales, datos completos de entrega, reglas de stock,
> correcciones de reportes, recuperación de acceso y auditoría. La pasarela sigue
> fuera del alcance inicial; no añadirla por la fila histórica de esta tabla.

El frontend ya define el contrato completo en `frontend/src/services/index.ts`
(buscar `TODO(backend)`) y los DTOs en `frontend/src/types/index.ts`.
La base sera el backbone DotForge (Clean Architecture: Domain / Application /
Infrastructure / Web), que ya trae auth JWT + refresh, multi-tenant y tests.

## Endpoints requeridos

| Modulo | Endpoint | Notas |
|---|---|---|
| Auth | `POST /api/auth/login`, `POST /api/auth/refresh` | Ya existe en DotForge; agregar roles Administrador/Compras/Ventas/Supervisor |
| Auth | `POST /api/auth/forgot-password` | Recuperacion de contrasena (propuesta 3.1) |
| Auditoria | `GET /api/audit-log` | Bitacora de acciones por usuario (propuesta 3.1) |
| Catalogo | `GET/POST/PUT /api/products` | Incluye carga de imagenes y estado activo/inactivo |
| Calidad | dentro de Product DTO (`quality`) | Tipo de grano, altura, humedad, cosecha, productor, clasificacion |
| Ordenes | `GET/POST /api/orders`, `PATCH /api/orders/{id}/status` | Estados: Pendiente/Aprobada/Cancelada/Finalizada |
| Ordenes | `GET /api/orders/{id}/pdf` | PDF imprimible (QuestPDF sugerido) |
| Clientes | `GET/POST/PUT /api/customers` | Clientes y proveedores con historial |
| Reportes | `GET /api/reports/summary` | Alimenta el dashboard |
| Reportes | `GET /api/reports/export?type=&format=pdf\|xlsx` | 6 reportes definidos en ReportsPage |
| Pagos | pasarela (tarjeta/transferencia) | Checkout hoy registra orden Pendiente, pago contra entrega |

## Reglas de integracion

1. No cambiar firmas de `services/` sin actualizar tipos y backend a la vez.
2. `frontend/src/config/api.ts` (del template) ya implementa Bearer + refresh;
   los servicios mock se sustituyen por `api<T>()` y se elimina `data/mock.ts`.
3. Permisos por rol viven en `hasPermission()` del frontend SOLO como UX;
   la autorizacion real va en el backend (policies por rol).
