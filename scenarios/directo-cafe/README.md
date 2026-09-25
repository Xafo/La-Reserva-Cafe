# Escenario La Reserva Cafe v1

Datos de demostración autorizados por el usuario para desbloquear las entregas
1B y 1C. Fuente reutilizable: `demo-v1.json`. No reemplaza las semillas actuales,
no se carga automáticamente en producción y no envía mensajes ni realiza cobros.

## Catálogo de siete cafés

| Café | Presentación | Precio demo (L) | Stock demo | Uso principal en el escenario |
|---|---:|---:|---:|---|
| La Reserva Blend | 340 g | 320 | 120 | Entrada dulce/equilibrada |
| Josue Galo | 340 g | 420 | 45 | Honey, lima y panela |
| Nahun Vidal Sanchez | 340 g | 450 | 30 | Natural, cacao, piña y miel |
| Espresso de Casa | 340 g | 340 | 90 | Alternativa intensa cotidiana |
| Carolina Claros | 340 g | 680 | 16 | Floral, suave, regalo y V60 |
| Miguel Angel | 340 g | 490 | 28 | Fermentado y molienda gruesa |
| Roberto Lopez | 340 g | 390 | 55 | Achocolatado y espresso |

Se conservan los IDs de los cuatro cafés existentes; los tres nuevos llevan
prefijo `demo-`. Filtrado de Temporada queda fuera de esta selección, sin borrarlo
del proyecto. Los datos no documentados de los cafés nombrados en el PDF son
supuestos para pruebas, no afirmaciones verificadas sobre esos productores.
Las fotos de los tres nuevos son ilustraciones de La Reserva, no sus empaques.

## Contactos y atención

Asesor corporativo, atención mayorista y admisiones tienen correos bajo
`directocafe.example`, sin teléfono ni destino real. Horario supuesto: lunes a
viernes, 09:00–17:00 de Honduras; respuesta objetivo de un día hábil.
En la implementación futura, el CTA debe mostrar/guardar una solicitud simulada
local y confirmar “Solicitud de demostración”; no usar `mailto:` ni `wa.me`.

## Condiciones de trabajo

- Moneda de venta: HNL. Presupuesto de empresa: USD **solo como hipótesis de demo**
  para los rangos `$` del PDF, sin conversión automática ni cotización equivalente.
- Entrega demo en Tegucigalpa: L80; gratuita desde L1,000 de subtotal de productos
  después de descuentos. Estimación: 2–4 días hábiles desde aprobación del pedido.
  Fuera de esa zona: cotización manual, sin confirmación automática de entrega.
- Pago coordinado fuera de plataforma y simulado; no se captura ni cobra dinero.
- Reserva de stock al aprobar; liberar al cancelar; no permitir sobreventa.
  Es una regla de trabajo a implementar en 1D, no una función ya existente.
- Empresa: abastecimiento semanal/quincenal/mensual. Facturación mensual sujeta
  a revisión humana; no crear una suscripción automática.
- Mayoreo: mínimo 5 kg; 5% desde 5 kg hasta menos de 15, 8% desde 15 hasta menos
  de 30 y 10% desde 30 kg. Aplica solo a Blend, Espresso de Casa y Roberto Lopez.
  Calcular kilos por gramos × unidades / 1,000; no confundir bolsas con kilos.
  Descuento sobre el subtotal elegible, redondeo monetario a dos decimales.
  Ejemplo: 15 bolsas de Blend = 5.10 kg; L4,800 menos 5% = L4,560.
- Exclusividad, entrega prioritaria y soporte: solicitudes sujetas a propuesta,
  no beneficios concedidos automáticamente al responder el quiz.
- Productor: candidatura para fase 2, sin permisos de vendedor. Exención de
  comisión del primer mes queda como propuesta futura de demo, no oferta activa.

## Casos de aceptación preparados

Ocho casos con respuestas por clave y resultado esperado cubren las cinco ramas.
Incluyen los ejemplos del PDF: Carolina floral, Blend equilibrado, Miguel fermentado
y Roberto achocolatado/espresso. Cuatro casos adicionales describen agotado,
catálogo vacío, cambio de perfil y contacto simulado.

Los cinco casos de consumidores están cubiertos por pruebas automáticas de 1B,
además de las 1,792 combinaciones de respuestas posibles. Los tres recorridos comerciales están implementados en 1C y sus 312 combinaciones
se prueban automáticamente; la demo permite registrar solicitudes locales.
Reglas y prioridades: [contrato de onboarding](../../docs/DIRECTO-CAFE-ONBOARDING.md).

## Validar e integrar

Desde la raíz: `node scenarios/directo-cafe/validate.mjs` (sin dependencias).
Verifica siete productos únicos, imágenes existentes, referencias válidas,
preguntas por rama y contactos no operativos.

La demo de 1B está en `/demo/quiz`, disponible con `npm run dev` en `frontend`.
Tiene aviso visible y almacenamiento separado de datos operativos; no se incluye
en producción. Al integrar 1C conservar esa separación. No usar esta fixture
como sustituto silencioso de la API si falla. No importar datos demo sobre una BD
existente. Reemplazar o aprobar los supuestos antes de activar una operación real.
