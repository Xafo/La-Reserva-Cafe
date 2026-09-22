# Directo Café — conciliación del catálogo y condiciones

Entrega 1A, 21 de septiembre de 2026. Documento de trabajo, no catálogo aprobado.

**Actualización:** el usuario autorizó escenarios coherentes para avanzar. Los
siete cafés, contactos y condiciones de desarrollo están definidos en
[escenario v1](../scenarios/directo-cafe/README.md) y su JSON validable.
Esto cierra la preparación de datos de prueba y permite continuar 1B–1D.
Su confirmación comercial queda como requisito previo a una operación real.
La conciliación siguiente conserva el diagnóstico de los datos originales.

## Lo que sabemos

El quiz pide siete cafés, pero solo menciona cuatro por nombre. La semilla local
contiene cinco. La unión de ambos conjuntos tiene ocho nombres: por eso no se debe
suponer que faltan exactamente dos productos ni incorporar todos automáticamente.
Los precios y existencias siguientes son datos del archivo local, no confirmación
de tarifa vigente o stock físico. No se modificó la semilla con esta entrega.

| Café | ID local | Precio semilla (L) | Presentación | Relación con el PDF | Acción pendiente |
|---|---|---:|---|---|---|
| La Reserva Blend | p-blend | 320 | 340 g | Mencionado como entrada equilibrada | Confirmar ficha y permanencia |
| Josue Galo | p-josuegalo | 420 | 340 g | No identificado por nombre | Confirmar si integra los siete |
| Nahun Vidal Sanchez | p-nahun | 450 | 340 g | No identificado por nombre | Confirmar si integra los siete |
| Espresso de Casa | p-espresso | 340 | 340 g | No identificado por nombre | Confirmar si integra los siete |
| Filtrado de Temporada | p-filtrado | 440 | 340 g | No identificado por nombre | Confirmar si integra los siete |
| Carolina Claros | No existe | Sin dato | Sin dato | Geisha; ejemplo floral/suave/regalo y floral/V60 | Recibir ficha oficial |
| Miguel Angel | No existe | Sin dato | Sin dato | Ejemplo fermentado o molienda gruesa; posgusto prolongado | Recibir ficha oficial |
| Roberto Lopez | No existe | Sin dato | Sin dato | Ejemplo achocolatado/espresso; cuerpo intenso | Recibir ficha oficial |

Fuente local: `frontend/public/data/products.csv`. Los nombres conservan su
escritura de origen hasta validar la denominación comercial oficial.

## Ficha que debe completarse por café

- Nombre oficial e identificador estable (conservar el existente cuando corresponda).
- Productor, tostaduría, finca, localidad, región y país; evidencia de origen.
- Variedad, proceso, tueste, notas y descripción aprobadas.
- Presentaciones y precio en lempiras por presentación; grano/molido y molienda si aplica.
- Stock operativo y responsable de actualización.
- Lote, fecha de cosecha y fecha de tueste como datos distintos. No deducir frescura de la cosecha.
- Fotografía y permiso de uso; descripción accesible fiel a la foto.
- Puntaje, humedad y altura solo cuando haya un dato respaldado.
- Responsable que valida la ficha y fecha de revisión.

Finca, lote y fecha de tueste son extensiones propuestas para trazabilidad; todavía
no existen como campos en el modelo. Se implementarán con migración y validación,
sin rellenarlos con fechas o nombres ficticios. La aprobación de siete fichas es
el criterio de cierre de CAT-01, no la cantidad de filas de una semilla.

## Condiciones que faltan confirmar

| Tema | Dato necesario | Comportamiento mientras falta |
|---|---|---|
| Atención | Correo/WhatsApp real, horario y responsable | No mostrar contactos ficticios ni enlaces de envío |
| Entregas | Zonas, costos, plazos y proceso de confirmación | No prometer 48 horas ni cobertura nacional garantizada |
| Pagos | Cómo se coordina el cobro fuera de plataforma | El formulario solo registra un pedido |
| Empresa | Moneda de los rangos `$`, volumen y facturación | No reinterpretar el símbolo como lempiras o USD |
| Cafetería | Tarifas, mínimos, exclusividad y soporte | Capturar interés en 1C, no prometer condiciones inventadas |
| Productores | Admisión y política de comisiones | Presentar una apertura futura, no un vendedor habilitado |
| Identidad | Logo oficial Directo Café si existe | Wordmark tipográfico transitorio; fotos de La Reserva conservadas |

## Decisiones técnicas de esta entrega

- Mantener `priceLps` y los identificadores actuales. No convertir monedas.
- Mantener nombres de productos y fotos de La Reserva; cambiar la marca del portal.
- No activar correo/WhatsApp, descuentos, exclusividades ni beneficios B2B sin datos reales.
- Eliminar plazos y contactos provisionales de la comunicación pública.
- Las reglas de recomendación se diseñarán en 1B con explicación de afinidad;
  los ejemplos exactos del PDF requieren primero reconciliar sus productos.

## Lista de cierre

- [x] Comparar catálogo local con nombres mencionados en el PDF.
- [x] Identificar qué información falta sin inventarla.
- [x] Retirar contactos ficticios y plazos no respaldados del frontend.
- [ ] Recibir y aprobar los siete cafés oficiales.
- [ ] Validar precios, fotos, trazabilidad y existencias comerciales.
- [ ] Confirmar contactos y condiciones de atención/entrega.
- [ ] Incorporar datos aprobados con migración/actualización controlada.
