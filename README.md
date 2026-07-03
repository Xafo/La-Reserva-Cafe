# Plataforma de Cafe de Especialidad (nombre pendiente)

Plataforma web de gestion y comercializacion de cafe de especialidad hondureno,
segun la propuesta formal del 20 de mayo de 2026.

> Marca de trabajo: **ALTURA**. El nombre real, logo y copy institucional estan
> pendientes del cliente — buscar `TODO(brand)` y `TODO(copy)` en el codigo.

> Este repo (`cafe-platform-Fable`) es la linea de trabajo demo derivada de
> `cafe-platform`; agrega cuentas de clientes, quiz de preferencias con
> recomendacion de cafe y storage CSV como placeholder de la base de datos.

## Estado actual

- **Frontend 100% funcional sin backend** (React 19 + Vite + Tailwind 4,
  base plantilla DotForge).
- **Datos en capa CSV** (`frontend/src/storage/`): semillas en
  `frontend/public/data/*.csv`, mutaciones en localStorage y export .csv desde
  el admin. Es el placeholder de la base de datos — ver [docs/STORAGE.md](docs/STORAGE.md).
- **Backend .NET Core 10 pendiente.** Toda la UI consume `frontend/src/services/`,
  que define el contrato (firmas + DTOs en `src/types/`) y marca cada endpoint
  con `TODO(backend)`. Ver [docs/BACKEND-TODO.md](docs/BACKEND-TODO.md).

## Superficies

| Ruta | Que es | Acceso |
|---|---|---|
| `/`, `/tienda`, `/tienda/:id`, `/checkout`, `/origen` | Portal publico de venta | Abierto |
| `/registro`, `/ingresar`, `/cuenta` | Cuenta de cliente: al registrarse pasa por el quiz de preferencias y recibe su cafe recomendado | Abierto / sesion de cliente |
| `/admin/*` | Gestion interna: dashboard, catalogo, calidad, ordenes, clientes/proveedores, reporteria, usuarios | Login por rol |

Usuarios demo del equipo (cualquier contrasena): `admin@altura.hn`,
`compras@altura.hn`, `ventas@altura.hn`, `supervisor@altura.hn`.
Cliente demo de la tienda: `mflagos@gmail.com` / `demo`.

## Quiz de preferencias y recomendacion

Al crear una cuenta en `/registro`, el cliente responde 6 preguntas de
seleccion multiple (que busca, metodo de preparacion, como lo toma, sabores,
intensidad, presupuesto). `recommendationService`
(`frontend/src/services/recommendation.ts`) puntua el catalogo con pesos por
dimension y devuelve el mejor match con razones + 2 alternativas. Ventas ve
esos perfiles en `/admin/clientes` (filtro "En linea" → "Ver preferencias").

Para reiniciar el demo a los datos semilla: `resetDemoData()` en la consola
del navegador.

## Demo hosteado (gratis, Vercel)

```bash
npm i -g vercel
cd frontend
vercel login
vercel        # primer deploy: aceptar la deteccion de Vite (build npm run build, output dist)
vercel --prod # URL de produccion para compartir con el cliente
```

`frontend/vercel.json` ya incluye el rewrite a `index.html` para que los
deep links de React Router funcionen. Los CSV de `public/data/` viajan al
build automaticamente.

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
