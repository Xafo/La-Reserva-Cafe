# La Reserva Cafe — estado y próximos pasos

Actualizado: 24 de septiembre de 2026. Los escenarios de siete cafés, contactos y
condiciones fueron autorizados para desarrollar y probar. No son datos oficiales.

## Estado por fase

| Fase | Cubierto | Para cerrar la salida comercial |
|---|---|---|
| **1A — Identidad y catálogo** | La Reserva Cafe nace en La Reserva; historia, misión, siete cafés de escenario y fotografías identificadas como referencia. | Aprobar fichas, precios, existencias, fotos, origen/lote/tueste, contactos y condiciones reales. Cosecha no acredita tueste. |
| **1B — Consumidores** | Cinco perfiles, 22 preguntas versionadas; reglas deterministas, alternativas, catálogo vacío, persistencia y edición. | Contrastar recomendaciones con catálogo definitivo. |
| **1C — Solicitudes** | Tres ramas sin match de sabor; asignación, estados, historial y permisos; catálogo empresarial dedicado y simulador mayorista. | Responsables y canales reales; moneda y beneficios aprobados. No hay envío automático de solicitudes. |
| **1D — Pedidos y medición** | Contacto/entrega/molienda, precios históricos, cotización versionada, cobertura y envío manual, reservas, cancelación, concurrencia, reintentos, ventas por período y PDF/Excel por tipo. **Cierre técnico con escenarios.** | Aprobar reglas reales y observar métricas del piloto. Finalizada no acredita pago. |
| **1E — Verificación y operación** | API/PostgreSQL, pedido atendido desde navegador, migraciones aditivas, recuperación con correo simulado, bitácora, revocación, foco/teclado, respaldo/restauración local y manual. | Despliegue con configuración real, correo, almacenamiento externo si se elige, restauración en ese entorno y aceptación del operador. **Preparación local validada; salida operativa pendiente.** |
| **2 — Otras fincas/tostadurías de Honduras** | Precandidaturas disponibles; secuencia de admisión, aislamiento y piloto documentada. | Validar fase 1; implementar vendedores, catálogo aislado, operación y piloto multivendedor. |
| **3 — Expansión** | Horizonte y criterios de entrada definidos. | Elegir mercado/categoría con evidencia; concretar moneda, idioma, entrega y soporte; desarrollar y evaluar piloto. |

## Evidencia de esta entrega

- Integración de `origin/main` hasta `5729221` en `codex/directo-cafe-fase-1d`.
  Se conservaron recuperación, auditoría y despliegue de main, junto con comercio,
  inventario y reportes de esta rama. Merge `ea1984f` subido.
- Frontend: 12 pruebas, build y lint correctos. Backend: 17 pruebas de tokens, onboarding,
  pedidos, stock, comercio y recuperación. Los tres recorridos HTTP se probaron
  también en bases PostgreSQL distintas y aisladas.
- Pedido ficticio `OC-2026-07AB69693B93`: pendiente → aprobado → finalizado,
  una unidad reservada, L 320 + L 80 = L 400. Dashboard, PDF y Excel coinciden.
- Reintentos seriales/simultáneos no duplican orden; contenido diferente con el
  mismo identificador devuelve conflicto. Sin sobreventa al competir por stock.
- JWT real: HTTP 200 antes de revocar y 401 después. Recuperación con token de un
  uso, revocación de refresh y bitácora; emisor simulado, sin mensajes externos.
- Respaldo PostgreSQL restaurado en otra base: coinciden 9 órdenes, 9 líneas,
  L 25,890 en totales, 2 unidades de stock agregadas y 4 entradas de auditoría.
  Son valores del fixture de pruebas, no resultados comerciales.
- PDF de ventas, inventario y movimientos renderizados e inspeccionados; Excel
  conserva importe numérico. Foco confinado y recuperado al cerrar formularios/carrito.
  Panel administrativo adaptado a 360 px y catálogo empresarial revisado en móvil.

## Siguiente orden

1. Completar la ficha de entorno y responsables del [manual operativo](DIRECTO-CAFE-MANUAL-OPERATIVO.md), con correo, almacenamiento y datos aprobados.
2. Ejecutar el piloto 1 con las definiciones y objetivos propuestos en [criterios de cierre](DIRECTO-CAFE-CIERRE-Y-PILOTOS.md). Las pruebas sintéticas no acreditan demanda o satisfacción.
3. Decidir entrada a 2A después de validar el primer horizonte; trabajar propiedad y aislamiento antes de permitir ventas de terceros.
4. Iniciar descubrimiento de fase 3 con evidencia y alcance elegido.

## Versionamiento y límites

Rama: `codex/directo-cafe-fase-1d`. Checkpoint 1C: `b25c4ad`, etiqueta
`checkpoint-fase-1c-2026-09-22`. Comercio/reportes: `680d0b2`. Main se incorporó
mediante merge; no se sobrescribió ni se hizo push forzado. Los ajustes de 1E
se guardan en la misma rama. Bases ficticias, claves, `.env`, respaldos y logs
permanecen fuera de Git.

No se desplegó, cobró, despachó ni enviaron correos. Docker/Render y Supabase están
preparados en código, pero no verificados en infraestructura real. La recuperación
es del equipo interno, no de cuentas de tienda. El reporte de movimientos refleja
historial de pedidos, no un kardex completo de compras/devoluciones/ajustes.
