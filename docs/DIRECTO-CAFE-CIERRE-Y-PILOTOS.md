# Directo Café — cierre y secuencia de pilotos

24 de septiembre de 2026. Los PDF definen tres horizontes; las entregas 1A–1E son
la descomposición técnica propuesta, no fases textuales de los documentos.

## 1. Aceptación técnica local

| Control | Resultado y evidencia |
|---|---|
| Cinco perfiles/22 preguntas, guardado y recomendaciones | Cubierto; contrato, pruebas frontend/API, ejemplos PDF y catálogo vacío/agotado. |
| Solicitudes y seguimiento humano | Cubierto; PostgreSQL, navegador, recarga, responsables e historial protegido. |
| Catálogo B2B y condiciones | Escenarios cubiertos; `/empresas`, mínimos/tramos y cotización servidor. |
| Pedido completo, reservas y cancelación | Cubierto; persistencia, concurrencia, transiciones y precios históricos. |
| Reintentos y envío fuera de cobertura | Cubierto; repetición serial/simultánea, conflicto de contenido y aprobación bloqueada hasta cotizar envío. |
| Reportes | Cubierto; período/estado, PDF renderizado, Excel y venta ficticia L 400 en dashboard. |
| Recuperación/revocación del equipo | Cubierto localmente; emisor simulado, un uso, versión de sesión y JWT rechazado tras revocación. |
| Teclado/foco | Carrito y formularios revisados; foco confinado, Escape y retorno. No es certificación WCAG integral. |
| Migraciones y restauración | PostgreSQL separado, datos anteriores preservados y fixture de archivos locales. |
| Infraestructura, correo y almacenamiento externo | Pendiente: configuración y prueba en entorno real. |

## 2. Piloto del primer horizonte

Propuesta: dos semanas y al menos diez pedidos atendidos, incluyendo consumo y B2B.
Negocio debe aceptar período, participantes y objetivos. Los PDF no fijan umbrales;
esta muestra tampoco garantiza significación estadística.

| Métrica | Definición/fuente | Objetivo propuesto |
|---|---|---|
| Cobertura funcional | Recorrido completo por cada perfil, resultado y datos correctos. | 5 de 5, sin bloqueo crítico. |
| Integridad | Contacto, líneas, total y estado iguales en atención/exportación. | 100% de la muestra. |
| Duplicados | Referencias adicionales para el mismo requestId. | 0. |
| Sobreventa | Reserva aprobada superior a stock disponible. | 0. |
| Atención comercial | Creación a primera gestión humana documentada. | ≤1 día hábil, sujeto a capacidad aceptada. |
| Entrega | Entregas en fecha acordada / pedidos con fecha acordada. | ≥90%, por validar. |
| Satisfacción | Encuesta voluntaria posterior, registrando muestra/escala. | ≥4/5, por validar. |
| Conversión | Cuentas con perfil completo y pedido / cuentas con perfil completo en cohorte. | Línea base; sin umbral inventado. |
| Recompra | Cuentas con segunda venta / cuentas con primera compra elegibles. | Observar; excluir invitados no vinculados. |

Pedidos, fechas de finalización, cuentas e historiales ya aportan información.
Inicio/abandono del quiz, fecha prometida/efectiva de entrega, encuestas y tiempo en
días hábiles requieren registro separado del piloto o instrumentación posterior.
Finalizada no demuestra puntualidad, satisfacción ni cobro. No atribuir a simulaciones
demanda real ni calcular conversión de invitados como si tuvieran una cuenta.

Registro mínimo: fecha, entorno, referencia, perfil, responsable, esperado, observado,
evidencia, incidencia y resolución. No publicar contactos/respuestas personales en Git.

## 3. Secuencia preparada para fase 2

Entrada: fase 1 operativa aceptada, sin incidencias críticas y decisión de negocio
basada en el piloto. Hasta entonces, productor/tostador es una candidatura.

| Bloque | Trabajo | Aceptación |
|---|---|---|
| **2A Admisión** | Expediente, responsable, origen/calidad/capacidad, decisión motivada e historial. | Candidatura no concede acceso; aprobación explícita para habilitar vendedor. |
| **2B Propiedad** | Catálogo/lotes por vendedor, autorización por operación y revisión central. | A no ve/modifica datos privados de B ni sustituye propietario; pruebas negativas de API. |
| **2C Operación** | Elegir quién cobra/despacha/resuelve; después subpedidos, stock, reparto de costos/liquidaciones. | Totales conciliados, responsables claros; comisión/crédito solo con condiciones aprobadas. |
| **2D Piloto Honduras** | Aliados limitados, trazabilidad, cancelación/incidencia por vendedor. | Atención, aislamiento y cumplimiento demostrados antes de ampliar. |

Elegir: tipo de vendedor, propiedad del stock, carrito mixto o separado, facturación,
cobro, envío, reclamos y comisión si aplica. Se pueden ensayar escenarios, pero no
habilitar ventas reales sin elegir operación. Un país marcado en el quiz no habilita
ventas fuera de Honduras.

## 4. Secuencia preparada para fase 3

1. **Descubrimiento:** elegir categoría/país con evidencia de demanda y capacidad.
   Accesorios, cursos o un país específico no son requisitos impuestos por el PDF.
2. **Requisitos:** catálogo, idioma, moneda, cobro, entrega, soporte y condiciones con
   responsables. Distinguir traducción de disponibilidad operativa.
3. **Implementación:** solo alcance elegido; pruebas de moneda/redondeo, cobertura,
   acceso y estados. Revisar requisitos locales al seleccionar mercado.
4. **Piloto:** medir cumplimiento/viabilidad y ampliar después de aceptar resultados.

**Estado:** fases 2 y 3 planificadas, no implementadas ni comercialmente validadas.
La preparación documental no equivale a cerrar esos horizontes.
