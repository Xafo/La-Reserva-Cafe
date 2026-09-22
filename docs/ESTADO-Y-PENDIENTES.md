# Directo Café — punto de control y pendientes

Actualizado el 22 de septiembre de 2026. Resumen del plan por fases; las secciones
10–14 de `DIRECTO-CAFE-PLAN-POR-FASES.md` conservan la evidencia detallada.

## Cubierto hasta este punto

- Diagnóstico de ambos PDF y contraste con código existente.
- Identidad Directo Café, historia, misión y relación con La Reserva.
- Siete cafés, contactos y condiciones como escenarios autorizados, separados de
  la semilla operativa. No constituyen catálogo o condiciones oficiales.
- Cinco perfiles y sus 22 preguntas, respuestas versionadas, recomendaciones
  deterministas para consumidores y resúmenes para las tres ramas comerciales.
- Solicitudes comerciales con responsable, estados, notas, historial, permisos
  y protección contra actualizaciones simultáneas.
- Migraciones y pruebas de API con PostgreSQL aislado. Recorrido visual autorizado
  de registro empresarial, solicitud, seguimiento y recarga completado.

## Qué falta, fase por fase

| Fase | Pendientes concretos |
|---|---|
| **1A — Marca y catálogo** | Confirmar los siete cafés y fichas reales: precios, presentaciones, existencias y fotos. Completar evidencia de finca/lote/tueste y trazabilidad. Confirmar contactos, entrega y cobro. Validar identidad gráfica final si corresponde y encabezado del PDF operativo según quién lo emite. Los escenarios ya permiten desarrollar. |
| **1B — Consumidores** | Implementación cubierta. Antes de operación real, recalibrar/validar las reglas contra el catálogo confirmado; completar aceptación transversal en 1E. La selección de molienda/presentación debe trasladarse al pedido en 1D. |
| **1C — Solicitudes comerciales** | Flujo técnico cerrado con escenarios. Falta catálogo empresarial dedicado y tarifas mayoristas definitivas, moneda comercial confirmada y canales reales de atención. Integración de correo/CRM es opcional y requiere definición; hoy el seguimiento es interno, sin envíos automáticos. |
| **1D — Pedidos y medición** | Conservar contacto, dirección/zona, notas y opciones por producto; vínculo de cuenta/invitado. Implementar condiciones, reservas de stock al aprobar, liberación al cancelar, estados válidos y control de sobreventa. Corregir ventas por período/estado, rankings, inventario y exportaciones. Definir métricas y objetivos de validación del negocio. |
| **1E — Salida operativa** | Prueba integral hasta pedido atendido; fallos de red y recuperación; permisos, recuperación de acceso y auditoría; móvil, teclado y accesibilidad. Migraciones con datos previos, imágenes persistentes, backups/restauración, configuración de despliegue y manual operativo. Ya existen pruebas parciales, pero no está cerrada la aceptación completa. |
| **2 — Otras fincas y tostadurías de Honduras** | Después de validar fase 1: admisión/aprobación de vendedores, propiedad y permisos de catálogo, aislamiento entre vendedores, responsabilidades de cobro/despacho/incidencias, comisiones/liquidaciones si aplican y piloto controlado. La candidatura actual no habilita vendedores. |
| **3 — Expansión** | Definir categorías y países piloto, requisitos de idiomas/monedas/cobros/entregas/soporte, y validar un mercado o categoría a la vez. Es visión futura, no alcance implementado. |

## Orden inmediato

1. 1D: contrato y persistencia completos del pedido.
2. 1D: condiciones comerciales de escenario, inventario y cancelaciones.
3. 1D: administración, reportes y pruebas con PostgreSQL.
4. 1E: aceptación integral y preparación operativa.
5. Fase 2 solo después de validar el primer horizonte; fase 3 después de definir su alcance.

## Versionamiento

Se recuperó el historial de `https://github.com/Xafo/La-Reserva-Cafe.git` y se
prepara el punto de control sobre su rama `main` (base `25b4070`). La rama de
trabajo es `codex/directo-cafe-fase-1c`; conserva el historial existente.
Incluye código, migraciones, documentación, configuración de ejemplo y escenarios.
Excluye `.tools`, `tmp`, dependencias, compilados, logs y archivos de entorno privados.
El commit y la etiqueta `checkpoint-fase-1c-2026-09-22` identifican esta entrega.
El punto de control se guarda en una rama separada del repositorio indicado por
el usuario; no se mezcla ni se sobrescribe `main`.
