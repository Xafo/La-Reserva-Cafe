# PRODUCT.md

## Producto

Plataforma web de gestion y comercializacion de cafe de especialidad hondureno.
Dos superficies:

1. **Storefront** (registro: brand) — portal publico donde el cliente final compra
   cafe de especialidad segun su preferencia (origen, proceso, tueste, presentacion).
   Debe gritar premium, altura, terroir hondureno.
2. **Admin** (registro: product) — plataforma interna por roles (Administrador,
   Compras, Ventas, Supervisor): catalogo, calidad, ordenes de compra,
   clientes/proveedores, reporteria, dashboard.

## Estado

- Frontend-only (React 19 + Vite + Tailwind 4). Backend .NET Core 10 vendra despues;
  toda llamada a datos pasa por `src/services/` con mocks y TODOs marcados.
- Nombre de empresa, logo y copy finales PENDIENTES del cliente.
  Marca de trabajo: "ALTURA" — buscar `TODO(brand)` para reemplazar.

## Audiencia

- Storefront: consumidor hondureno/centroamericano de cafe de especialidad,
  compra en linea, espera una experiencia tipo marca premium internacional.
- Admin: personal operativo de la cafeteria (no tecnico).

## Voz de marca

Tres palabras fisicas: **altura, niebla, cosecha a mano**.
Escena: una finca en Marcala al amanecer — niebla sobre los cafetales,
verde humedo, luz dorada filtrandose entre los arboles de sombra.

## Registro

`register: mixed` — rutas `/` publicas = brand; rutas `/admin` = product.
