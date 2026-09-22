# Directo Café — contexto de producto

## Producto

Directo Café es una plataforma que nace en La Reserva, una tostaduría hondureña.
La Reserva es la oferta inicial y conserva su identidad en productos, fotografías
y trazabilidad. Directo Café es la marca de la experiencia pública.
Dos superficies:

1. **Storefront** (registro: brand) — portal publico donde el cliente final compra
   cafe de especialidad segun su preferencia (origen, proceso, tueste, presentacion).
   Debe comunicar frescura, origen verificable y una relación calidad-precio honesta.
2. **Admin** (registro: product) — plataforma interna por roles (Administrador,
   Compras, Ventas, Supervisor): catalogo, calidad, ordenes de compra,
   clientes/proveedores, reporteria, dashboard.

## Estado

- React 19 + Vite + Tailwind 4, conectado a una API .NET 10 / EF Core / PostgreSQL.
- Catálogo, cuentas, pedidos y administración existen en código. No confundir
  implementación con validación operativa o despliegue confirmado.
- Entrega 1A: identidad tipográfica Directo Café, historia, misión y horizontes.
  No se presenta esta identidad transitoria como un logo oficial recibido del cliente.
- Entrega 1B: selector de cinco perfiles, recorridos de nuevo consumidor y
  apasionado habilitados, respuestas versionadas y recomendaciones explicadas.
  Entrega 1C: empresa, cafetería y productor habilitados, resumen y solicitud
  consultable por el equipo. Responsables, estados e historial implementados y API probada en PostgreSQL
  local; registro, solicitud y seguimiento verificados en navegador. Marketplace permanece en fase 2.
- Siete cafés, contactos y condiciones preparados como escenarios autorizados
  en `scenarios/directo-cafe`. Demo local en `/demo/quiz`, solo en desarrollo.
  La semilla operativa conserva sus cinco productos; los escenarios no son datos oficiales.
- Plan vigente: [diagnóstico y entregas](docs/DIRECTO-CAFE-PLAN-POR-FASES.md).
- Datos pendientes: [catálogo y condiciones](docs/DIRECTO-CAFE-CATALOGO-Y-CONDICIONES.md).

## Audiencia

- Primera fase: consumidores nuevos y apasionados en Honduras; atención de
  necesidades de empresas y cafeterías. Productores: interés para futura apertura.
- Admin: personal operativo de la cafeteria (no tecnico).

## Voz de marca

Tres referencias concretas: **taza, tueste, origen**.
Escena: una persona elige su café viendo las bolsas y la mesa de catación de La Reserva.
Voz cercana, clara y con voseo hondureño. Contar hechos y compromisos; no inventar
garantías, plazos de despacho, contactos, certificaciones o precisión de recomendaciones.

## Horizontes y límites

1. Validar el modelo con La Reserva y clientes en Honduras.
2. Incorporar fincas y tostadurías hondureñas después de validar el primer horizonte.
3. Ampliar categorías y alcance internacional con una especificación posterior.

El formulario registra pedidos; la pasarela de pagos no forma parte del alcance inicial.
No prometer vendedores habilitados, cobertura global, beneficios mayoristas o comisiones
que aún no tengan soporte operativo. El PDF del quiz aporta requisitos, no autorización
para enviar correos, contactar personas o publicar condiciones sin respaldo.

## Registro

`register: mixed` — rutas `/` publicas = brand; rutas `/admin` = product.
