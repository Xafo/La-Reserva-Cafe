# Plataforma de Cafe de Especialidad (nombre pendiente)

Plataforma web de gestion y comercializacion de cafe de especialidad hondureno,
segun la propuesta formal del 20 de mayo de 2026.

> Marca de trabajo: **ALTURA**. El nombre real, logo y copy institucional estan
> pendientes del cliente — buscar `TODO(brand)` y `TODO(copy)` en el codigo.

## Estado actual

- **Frontend 100% funcional con datos mock** (React 19 + Vite + Tailwind 4,
  base plantilla DotForge).
- **Backend .NET Core 10 pendiente.** Toda la UI consume `frontend/src/services/`,
  que define el contrato (firmas + DTOs en `src/types/`) y marca cada endpoint
  con `TODO(backend)`. Ver [docs/BACKEND-TODO.md](docs/BACKEND-TODO.md).

## Superficies

| Ruta | Que es | Acceso |
|---|---|---|
| `/`, `/tienda`, `/tienda/:id`, `/checkout`, `/origen` | Portal publico de venta | Abierto |
| `/admin/*` | Gestion interna: dashboard, catalogo, calidad, ordenes, clientes/proveedores, reporteria, usuarios | Login por rol |

Usuarios demo (cualquier contrasena): `admin@altura.hn`, `compras@altura.hn`,
`ventas@altura.hn`, `supervisor@altura.hn`.

## Correr en local

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
npm run build    # verificacion tsc + bundle
```

## Diseno

Sistema definido en [DESIGN.md](DESIGN.md) y [PRODUCT.md](PRODUCT.md), construido
con los skills `impeccable` y `taste` (instalados en `.claude/skills/`).
Paleta verde cafetal + dorado miel en OKLCH; tipografia Cabinet Grotesk +
General Sans (Fontshare).

## Equipo

Ver [docs/TEAM.md](docs/TEAM.md) para la division de trabajo y convenciones.
