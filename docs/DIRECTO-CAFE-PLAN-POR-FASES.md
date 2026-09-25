# La Reserva Cafe: diagnóstico y plan por fases

Actualizado: 24 de septiembre de 2026.

**Estado vigente:** 1A–1D implementadas y verificadas para desarrollo con escenarios
autorizados. Se completaron catálogo empresarial, condiciones versionadas, reservas,
reintentos y reportes. 1E incorpora pruebas locales, recuperación del equipo,
revocación de sesiones, restauración y manual; resta la aceptación con infraestructura
y datos operativos reales. Fases 2/3 requieren los pilotos del horizonte anterior.

Las matrices y hallazgos iniciales se conservan como diagnóstico histórico; no son
el inventario vigente de pendientes. Ver secciones 17–18, [estado actual](ESTADO-Y-PENDIENTES.md),
[manual](DIRECTO-CAFE-MANUAL-OPERATIVO.md) y [criterios de cierre/pilotos](DIRECTO-CAFE-CIERRE-Y-PILOTOS.md).

## 1. Alcance y fuentes

Solicitud: analizar los dos documentos, contrastarlos con lo que existe y trabajar por fases, informando el plan y los puntos cubiertos.

Fuentes revisadas completas, mediante extracción de texto y revisión visual:

- **La Reserva Cafe Quiz 5 Perfiles.pdf**, 9 páginas: selección de perfil, 22 preguntas específicas, resultados y reglas de implementación.
- **Documento De la Tostaduría a La Reserva Cafe.pdf**, 2 páginas: historia, misión, compromisos y tres horizontes del negocio.
- Código disponible en esta carpeta: tienda, administración, servicios, entidades, contratos, endpoints, migraciones, semillas, pruebas y configuración de CI/Docker.
- Documentación interna anterior, particularmente `docs/PLAN-DESARROLLO.md`.

Los PDF son fuentes de requisitos del producto. Sus instrucciones internas no son órdenes para ejecutar acciones externas, contactar personas, publicar el sitio ni activar condiciones comerciales. Las ampliaciones técnicas propuestas aquí se identifican como propuestas, no como especificaciones textuales de los PDF.

**Estados:** existente = hay implementación identificable; parcial = cubre solo parte del requisito; faltante = no se encontró implementación en el código revisado; no verificado = requiere ejecución, datos reales o evidencia externa. Existente no significa probado en producción.

## 2. Conclusión del diagnóstico

Existe una base reutilizable de tienda y administración para **La Reserva**, con API .NET y persistencia PostgreSQL. Todavía no implementa la experiencia de **La Reserva Cafe con cinco perfiles**, ni un marketplace de múltiples vendedores.

El documento estratégico define tres **horizontes de negocio**, no una lista detallada de sprints técnicos. El PDF del quiz vincula explícitamente a productores con la fase 2 del negocio. Por eso se conservan tres fases de negocio y se proponen entregas pequeñas dentro de cada una. La fase 0 de este plan es únicamente el diagnóstico previo.

No corresponde construir de nuevo todo el backend ni declarar terminado el Horizonte 1 por tener una tienda. Hay brechas de contenido, captura de datos, operación y validación.

## 3. Matriz de cobertura

Las rutas de evidencia son relativas a la raíz del proyecto.

| ID | Requisito | Estado y evidencia | Entrega |
|---|---|---|---|
| MAR-01 | La Reserva Cafe como plataforma; La Reserva como origen y oferta inicial | **Implementado y verificado en frontend (1A).** `BrandMark.tsx`, `StoreFooter.tsx`, navegación y metadata distinguen ambas marcas. Identidad tipográfica transitoria; documentos operativos del backend aún por revisar. | 1A |
| MAR-02 | Historia, misión, calidad-precio y tres horizontes | **Implementado y verificado (1A).** `HomePage.tsx` y `OriginPage.tsx` incorporan el relato y presentan las etapas futuras como visión. | 1A |
| CAT-01 | Siete cafés de La Reserva para las recomendaciones | **Parcial.** `frontend/public/data/products.csv` contiene cinco productos. No equivale a comprobar el catálogo de una base en ejecución. | 1A |
| CAT-02 | Nombre, origen, productor, proceso, notas y precio | **Existente en código/semilla.** `backend/src/LaReserva.Domain/Entities.cs`, `QualityProfile`, páginas de catálogo y detalle. Exactitud comercial no verificada. | 1A |
| CAT-03 | Frescura y origen respaldables | **Parcial.** Hay fecha de cosecha, productor, región y proceso. No hay campos específicos para finca, lote o fecha de tueste. Propuesta técnica para respaldar la misión; el PDF no prescribe estos campos. | 1A / 1D |
| QUI-00 | Pregunta inicial con cinco perfiles | **Faltante.** `frontend/src/components/store/PreferenceQuiz.tsx` tiene un único arreglo de seis pasos y ninguna selección de perfil. | 1B |
| QUI-01 | Nuevo consumidor: cinco preguntas propias | **Parcial.** Algunas preferencias actuales coinciden conceptualmente, pero cambian preguntas, opciones, orden y selección múltiple. No cumple el recorrido del PDF. | 1B |
| QUI-02 | Apasionado: cinco preguntas técnicas | **Faltante como recorrido.** No hay captura específica de presentación en grano/molido ni granulometría; los métodos actuales no reproducen todas las opciones. | 1B |
| QUI-03 | Empresa: cuatro preguntas, resumen y contacto | **Faltante.** Elegir “Comprar para mi negocio” en el quiz actual no captura personas, frecuencia, presupuesto mensual ni presentación. | 1C |
| QUI-04 | Cafetería: cuatro preguntas, ficha mayorista y contacto | **Faltante.** No hay captura de kilos, exclusividad ni prioridad operativa. | 1C |
| QUI-05 | Productor/tostador: cuatro preguntas y candidatura | **Faltante.** Un registro genérico de proveedor administrativo no representa una cuenta de vendedor. Se propone precaptura en 1C y habilitación comercial en 2. | 1C / 2A |
| DAT-01 | Perfil y respuestas n1…n5, a1…a5, e1…e4, c1…c4, p1…p4 | **Faltante.** `CustomerPreference` y `PreferenceProfileDto` solo guardan preferencias generales. | 1B / 1C |
| REC-01 | Recomendación mediante reglas simples | **Parcial.** `frontend/src/services/recommendation.ts` puntúa seis dimensiones; no reproduce el árbol por perfil del PDF. No utiliza aprendizaje automático. | 1B |
| REC-02 | Resultado con café, notas, descripción, precio y acciones | **Parcial.** `RecommendationResult.tsx` muestra café, razones, porcentaje, precio, carrito, catálogo y alternativas. No presenta directamente la descripción completa del producto. | 1B |
| REC-03 | Porcentajes 92–99 y 95–99 | **No implementados como en el PDF.** El motor calcula un porcentaje ponderado. Resolver la tensión con la misión de evitar promesas vacías antes de cambiar su significado. | 1B |
| B2B-01 | Resultados sin match de sabor para empresa/cafetería/productor | **Faltante.** Registro y cuenta calculan recomendaciones para todas las preferencias actuales. | 1C |
| B2B-02 | Asesor, tostador y seguimiento humano | **Faltante.** No hay entidad de solicitud comercial, cola de seguimiento ni integración de correo/CRM. El PDF describe el envío como ideal, no como integración específica obligatoria. | 1C |
| B2B-03 | Catálogo empresarial y precios mayoristas | **Faltante.** No hay condiciones por volumen ni destinos dedicados para esos botones. | 1C |
| CTA-01 | Carrito y captura de pedidos | **Existente con brechas.** `CartContext.tsx`, `CheckoutPage.tsx`, servicios y `/api/orders`. Ver hallazgos críticos abajo. | 1D |
| CTA-02 | Contacto y entrega del pedido | **Parcial.** El formulario solicita datos que el servicio y el contrato no envían/guardan. | 1D |
| ADM-01 | Catálogo, calidad, clientes, proveedores, usuarios y órdenes | **Existente en código.** Páginas admin y endpoints de `ApiEndpoints.cs`; imágenes mediante endpoint separado `POST /products/{id}/image`. | Reutilizar; verificar en 1E |
| ADM-02 | Reportes y documentos | **Parcial.** Hay PDF de orden, resumen y exportadores, pero varias salidas no cumplen el significado anunciado. | 1D |
| SEC-01 | Autenticación y roles | **Existente en código.** JWT, hashing, refresh rotativo y políticas en `Program.cs`, `TokenService.cs` y endpoints. No es una auditoría de seguridad exhaustiva. | Reutilizar; verificar en 1E |
| SEC-02 | Recuperación y bitácora | **Faltante.** No se encontraron endpoints de recuperación de contraseña ni auditoría, ni sus entidades. Pendientes también en el plan anterior. | 1E |
| OPS-01 | Infraestructura y despliegue | **Parcial/no verificado.** Docker Compose, migraciones y `.github/workflows/ci.yml` existen. No se verificaron infraestructura desplegada, dominio, backups ni ejecuciones exitosas de CI. | 1E |
| MKT-01 | Varias fincas/tostadurías vendiendo | **Faltante.** No hay vendedores con propiedad de catálogo, separación de permisos o operación multivendedor. | 2 |
| EXP-01 | Expansión más allá del café tostado y de Centroamérica | **Faltante.** Horizonte estratégico, sin especificación operativa suficiente todavía. | 3 |

## 4. Hallazgos que cambian las prioridades

### 4.1 Catálogo distinto al esperado

Semilla actual: La Reserva Blend, Josue Galo, Nahun Vidal Sanchez, Espresso de Casa y Filtrado de Temporada.

El PDF menciona como ejemplos La Reserva Blend, Carolina Claros (Geisha), Miguel Angel y Roberto Lopez, pero no entrega una ficha completa de los siete cafés. Los tres últimos no aparecen en la semilla. Por tanto, **no basta con agregar dos productos**: hay que reconciliar el catálogo entero. No inventar precios, finca, existencias o notas para completar el número siete.

### 4.2 Pedido incompleto para coordinar entregas

`CheckoutPage.tsx` pide nombre, teléfono, dirección, ciudad y notas, pero llama a `createOrder(nombre, items)`. `CreateOrderRequest` y la entidad `Order` tampoco contienen esos datos de entrega ni una relación con la cuenta del cliente. La pantalla promete contacto posterior sin conservar allí la información necesaria.

Además, el endpoint verifica existencia/actividad de productos y recalcula precios, pero no valida disponibilidad suficiente ni reserva/descuenta stock. El cambio de estado solo cambia el texto del estado. Hay que definir cuándo reservar, descontar y devolver unidades, y probar concurrencia y cancelaciones.

### 4.3 Reportería marcada como completa sin cubrir toda la semántica

`ReportDocuments.Excel` distingue productos/inventario del resto: ventas, más vendidos y movimientos terminan exportando una lista genérica de órdenes. El PDF de reportes reutiliza una orden sintética con ítems de órdenes incluso para inventario. No hay rango de fechas en el endpoint de exportación.

El dashboard dice “Ventas finalizadas (mes)”, pero el backend suma todas las finalizadas sin restringir al mes. El ranking agrega ítems de todos los estados. La métrica de validación comercial necesita corregirse antes de decidir pasar a la fase 2.

### 4.4 Documentación y permisos que requieren reconciliación

`PRODUCT.md`, `TODO.md`, `docs/CONTEXT.md` y `docs/BACKEND-TODO.md` conservan referencias a ALTURA, mocks o backend pendiente. El plan técnico anterior mezcla descripciones antiguas con checklists más recientes. Su Fase 3 no puede considerarse cerrada con la evidencia actual.

En usuarios se describe Supervisor como lectura, pero `ProductsWrite` permite escribir a ese rol. El dashboard llama a un resumen restringido por `ReportsView`, que no incluye Compras. Revisar la matriz antes de declarar aceptado el panel por rol.

### 4.5 Compromisos comerciales y coherencia

- **Compatibilidad:** el PDF propone generar porcentajes elevados para reforzar personalización. Recomendación: reglas deterministas, razones visibles y afinidad presentada como estimación del sistema, sin insinuar una precisión científica. No cambiar silenciosamente la especificación; registrar la decisión.
- **Moneda:** el presupuesto empresarial está expresado con `$`, mientras el catálogo usa lempiras. Confirmar moneda de esos rangos; no convertirlos automáticamente ni asumir que el símbolo basta para identificar USD.
- **Beneficios B2B:** facturación mensual, entrega programada/prioritaria, exclusividad y soporte barista necesitan condiciones operativas. Un texto en una pantalla no implementa esos servicios.
- **Productores:** la oferta “sin comisiones el primer mes”, visibilidad global y soporte de marca debe corresponder a una política operativa. Durante precaptura, describir una candidatura para apertura futura; no prometer un marketplace ya disponible.
- **Contacto:** el footer incluye `+504 0000-0000` y un correo marcado para confirmar. No usarlo como destino real de solicitudes.
- **Pagos:** el plan técnico anterior excluye pasarela. Los nuevos PDF no la exigen. Mantener captura de pedidos y coordinación externa como alcance inicial; no añadir pasarela por inferencia.

## 5. Plan de ejecución por fases

### Fase 0 — Diagnóstico y control del alcance

**Estado: completada como revisión documental y estática; validación ejecutable pendiente.**

- [x] Leer y revisar las 11 páginas de los dos PDF.
- [x] Identificar horizontes y cinco recorridos.
- [x] Contrastar tienda, quiz, contratos, entidades, semillas, API y panel.
- [x] Registrar cobertura, inconsistencias y dependencias.
- [x] Definir entregas y criterios de aceptación.
- [x] Comprobar disponibilidad del entorno y registrar límites de validación.

Salida: este plan. No se aplicaron cambios funcionales a la tienda en esta entrega.

### Fase 1 — Horizonte 1: validar La Reserva Cafe con La Reserva en Honduras

#### 1A. Identidad, catálogo y datos confiables

**Objetivo:** presentar La Reserva Cafe y conservar a La Reserva como tostaduría inicial.

1. Actualizar documentación de producto y eliminar estados obsoletos, conservando la historia técnica.
2. Adaptar nombre, navegación, metadata, historia y misión; revisar también PDF de órdenes y correos cuando existan. No renombrar indiscriminadamente productores o paquetes técnicos.
3. Crear la tabla maestra de los siete cafés con identificadores, fichas verificadas, precios, presentaciones, disponibilidad y fotos.
4. Definir qué evidencia respalda frescura y trazabilidad; proponer finca/lote/fecha de tueste sin reemplazar fecha de cosecha.
5. Confirmar contactos y condiciones de entrega/cobro en Honduras.

**Cubre:** MAR-01/02, CAT-01/02/03. **Dependencias externas:** catálogo, identidad gráfica si existe, contactos y operación real.

**Aceptación:** La Reserva Cafe y La Reserva se distinguen correctamente; no hay datos comerciales inventados; fichas del catálogo reconciliadas y verificables. Si falta información, registrar cada ficha pendiente y no declarar completo el catálogo.

#### 1B. Modelo de onboarding y recorridos de consumo

**Objetivo:** sustituir el cuestionario genérico por el modelo de cinco perfiles, empezando por los dos que recomiendan café.

1. Definir un contrato versionado con perfil, respuestas por clave y fecha; usar validación por perfil en frontend y backend.
2. Crear migración aditiva. Las cuentas antiguas conservan sus preferencias; no asignarles un perfil nuevo por adivinación. Solicitar completar el nuevo quiz al editar o ingresar al onboarding según el flujo acordado.
3. Implementar la pregunta de entrada y los recorridos Nuevo Consumidor/Apasionado, con opciones del PDF y progreso correcto.
4. Definir precedencia de reglas: qué gana si coinciden floral y molienda gruesa, por ejemplo. El PDF ofrece ejemplos, no un árbol exhaustivo para todas las combinaciones.
5. Implementar recomendaciones deterministas contra productos activos/disponibles; incluir alternativa clara si falta el café previsto o no hay stock.
6. Completar resultado con descripción, notas, razones, precio y acciones; resolver significado del porcentaje antes de presentarlo.
7. Actualizar registro y cuenta: precarga, edición, cambio de perfil sin mezclar respuestas, estados vacíos y errores recuperables.

**Cubre:** QUI-00/01/02, DAT-01, REC-01/02/03. **Dependencia:** reglas y fichas comerciales de 1A para comprobar los ejemplos exactos.

**Aceptación:** pregunta de entrada + cinco preguntas por recorrido; guardado/lectura mediante API; ejemplos del PDF comprobados cuando existan sus productos; cuentas previas preservadas; no se recomienda un producto inactivo o agotado; cambiar perfil elimina respuestas incompatibles.

#### 1C. Empresa, cafetería y precaptura de productores

**Objetivo:** producir solicitudes útiles para seguimiento humano y completar las cinco ramas sin adelantar la apertura del marketplace.

1. Implementar cuatro preguntas por cada rama restante y un resumen fiel a las respuestas.
2. Guardar necesidades comerciales en un modelo separado de la recomendación sensorial; productor como candidatura, no vendedor habilitado.
3. Proponer una bandeja administrativa con solicitante, perfil, respuestas, fecha, estado y responsable. Estados iniciales sugeridos: nueva, en contacto, propuesta enviada y cerrada.
4. Conectar “Contactar asesor” y “Hablar con tostador” con un destino verificado y acción iniciada por el usuario. La integración de correo/CRM queda configurable; no enviar comunicaciones durante el desarrollo.
5. Definir destinos reales para catálogo empresarial/precios mayoristas y para completar candidatura/saber más. No dejar enlaces decorativos.
6. Mostrar únicamente beneficios y condiciones que el negocio pueda cumplir; dejar explícita la apertura futura para productores.

**Cubre:** QUI-03/04/05, DAT-01, B2B-01/02/03. **Dependencias:** contactos, moneda del presupuesto, condiciones por volumen y responsable de seguimiento.

**Aceptación:** las tres ramas no ejecutan match de sabor; sus respuestas persisten y son consultables por personal autorizado; cada CTA tiene un destino coherente; ningún productor obtiene acceso a productos ajenos ni se activa como vendedor al completar el quiz.

#### 1D. Operación de pedidos y medición confiable

**Objetivo:** poder atender y medir pedidos reales del primer horizonte.

1. Ampliar formulario, servicio, DTO, entidad, migración y panel para conservar contacto, entrega y notas; definir vínculo opcional con cuenta manteniendo pedidos de invitados si se conserva ese flujo.
2. Definir reserva y descuento de stock, cancelaciones, estados permitidos y concurrencia; aplicar reglas en servidor.
3. Revisar confirmaciones: solo anunciar tueste/entrega/contacto que la operación realmente ejecutará.
4. Corregir ventas por período, ranking, inventario y reportes. Crear movimientos reales si se mantiene el reporte de entradas/salidas; no simularlos con órdenes.
5. Propuesta de medición del horizonte: finalización del quiz por perfil, conversión a pedido, recompra, cumplimiento de entrega y satisfacción. Acordar objetivos y período de observación con negocio; el PDF no fija umbrales.

**Cubre:** CTA-01/02, ADM-02, soporte de CAT-03. **Aceptación:** un pedido conserva todos los datos capturados y puede atenderse; ventas excluyen estados improcedentes y respetan el período; stock no permite sobreventa bajo la política definida; cada exportación representa lo anunciado.

#### 1E. Verificación integral y salida operativa

1. Habilitar entorno .NET 10, instalar dependencias frontend y ejecutar compilación, lint y pruebas.
2. Probar registro → perfil → respuestas → resultado → pedido → atención administrativa, incluyendo fallos de red, recarga y catálogos vacíos.
3. Verificar roles en UI y API, recuperación de acceso, auditoría y permisos de datos de clientes.
4. Probar móvil, escritorio, teclado, foco, lectura de errores y presentación de resultados.
5. Verificar migraciones con datos previos, persistencia de imágenes, backups y restauración; revisar despliegue con configuración real.
6. Preparar manual de atención de solicitudes y pedidos. Registrar evidencia de aceptación y métricas observadas.

**Cubre:** ADM-01, SEC-01/02, OPS-01 y aceptación transversal.

**Cierre de Fase 1:** los cinco recorridos funcionan con alcance honesto; consumidores compran café de La Reserva; solicitudes comerciales se atienden; pedidos y métricas son confiables. La apertura a otras tostadurías depende además de validación de negocio, no solo de pruebas técnicas.

### Fase 2 — Horizonte 2: incorporar otras fincas y tostadurías de Honduras

**Estado: pendiente; condicionado a validar la Fase 1.**

- **2A. Admisión:** convertir candidaturas en expedientes de vendedor; verificar origen, calidad, capacidad, marca y condiciones. Definir aprobación/rechazo e historial.
- **2B. Catálogo y permisos por vendedor:** modelar propiedad de productos/lotes, edición autorizada, revisión de fichas, disponibilidad y escaparates. Probar aislamiento entre vendedores y administración central.
- **2C. Operación multivendedor:** definir quién cobra, despacha, responde y resuelve incidencias; diseñar división de pedidos, comisiones/liquidaciones si el modelo las requiere. Estos detalles son diseño propuesto, no reglas ya definidas por el PDF.
- **2D. Piloto controlado:** incorporar un grupo limitado de aliados, verificar trazabilidad y calidad, medir cumplimiento y documentar la operación antes de ampliar.

**Cubre:** QUI-05 en su resultado comercial definitivo y MKT-01.

**Aceptación:** vendedores aprobados con catálogo aislado, productos trazables y pedidos atendidos con responsables claros; condiciones comerciales operables. La selección de Guatemala/Costa Rica/Otro en el quiz puede recoger interés sin habilitar ventas fuera del alcance hondureño de este horizonte.

### Fase 3 — Horizonte 3: ampliar la cultura del café y el alcance internacional

**Estado: visión futura; requiere definición de producto y mercado.**

- **3A. Descubrimiento:** elegir categorías adicionales y países piloto con evidencia comercial. Accesorios, formación o experiencias son posibilidades, no requisitos confirmados.
- **3B. Diseño de la expansión:** definir idiomas, monedas, cobros, entregas, soporte y condiciones aplicables por mercado. Elaborar requisitos específicos antes de implementar.
- **3C. Piloto y crecimiento:** probar una categoría/mercado a la vez, medir cumplimiento y ampliar según resultados.

**Cubre:** EXP-01. **Aceptación:** alcance internacional concreto, probado y sostenible, conservando los estándares de frescura, origen y relación calidad-precio. No anunciar cobertura global solo porque la web sea accesible desde otros países.

## 6. Inventario verificable del quiz

La pregunta inicial es independiente de la numeración de cada rama. Total: **1 pregunta de entrada + 22 preguntas distribuidas entre 5 perfiles**. Las opciones y ayudas deben conservarse según las páginas indicadas; selección simple por pregunta como propuesta de implementación, dado que el PDF no define selección múltiple.

| Perfil | Claves y contenido | Resultado | Fuente |
|---|---|---|---|
| Nuevo consumidor | n1 forma de tomarlo; n2 sabores; n3 intensidad; n4 preparación; n5 intención | Café recomendado, afinidad y acciones de compra | Quiz pp. 2–3 |
| Apasionado | a1 tueste; a2 grano/molido/ambos; a3 sensorial; a4 molienda; a5 método | Café recomendado, afinidad y acciones de compra | Quiz pp. 4–5 |
| Empresa | e1 personas; e2 frecuencia; e3 presupuesto mensual; e4 presentación | Necesidades, plan corporativo y contacto | Quiz p. 6 |
| Cafetería | c1 kg/mes; c2 métodos; c3 exclusividad; c4 prioridad | Ficha mayorista y contacto con tostador | Quiz p. 7 |
| Productor/tostador | p1 operación; p2 país; p3 capacidad mensual; p4 marca propia | Candidatura/invitación; habilitación comercial en Fase 2 | Quiz p. 8 |

Ejemplos mínimos de aceptación del motor: floral + suave + regalo → Carolina Claros; dulce/equilibrado sin señales fuertes → Blend; floral + V60 → Carolina Claros; fermentado o molido grueso → Miguel Angel; achocolatado + espresso → Roberto Lopez. Resolver precedencias y comportamiento cuando el producto no está disponible. No son la tabla completa de decisión.

## 7. Datos y decisiones pendientes

| Dato o decisión | Por qué hace falta | Trabajo que sí puede avanzar |
|---|---|---|
| Lista oficial y fichas de siete cafés | El PDF no identifica los siete ni sus precios; semilla distinta | Modelo y validaciones, sin inventar catálogo |
| Correo/WhatsApp del asesor y tostador | Los contactos actuales son provisionales | Persistencia y bandeja interna |
| Moneda de presupuesto empresarial | Rangos en `$` frente a catálogo LPS | Conservar monto/rango y moneda explícita en diseño |
| Significado del porcentaje | Evitar presentar una cifra comercial como precisión demostrada | Reglas y razones deterministas |
| Tarifas mayoristas y beneficios | No hay tablas ni políticas operativas adjuntas | Captura de necesidades y solicitudes |
| Política de stock y atención | Necesaria para reservar, cancelar y cumplir pedidos | Contratos y casos de prueba |
| Identidad gráfica La Reserva Cafe | PDF define nombre y propósito, no un sistema visual definitivo | Jerarquía de marcas y contenido institucional |
| Criterios para abrir Fase 2 | El PDF pide validar el modelo, sin umbrales | Propuesta de métricas; no asumir validación comercial |

Se solicitó al usuario la lista oficial de cafés y el contacto real durante el diagnóstico. No se presupone respuesta ni aprobación por silencio.

## 8. Validación realizada y límites

- Lectura de ambas fuentes completa y revisión visual de todas sus páginas.
- Evidencia cruzada entre componentes, llamadas del frontend, DTOs, entidades, endpoints y semillas.
- Hay dos pruebas de backend en `TokenServiceTests.cs`: rotación/hash de refresh y exclusión de contraseña del DTO. No cubren los recorridos de negocio.
- `dotnet --list-sdks`: únicamente SDK 8.0.200 en la instalación consultada. El proyecto exige .NET 10.
- Intento de build de API con `--no-restore`: después de resolver el bloqueo inicial del sandbox, falla con **NETSDK1045**, por SDK incompatible. No es evidencia de un error funcional de la aplicación. No se ejecutaron pruebas de backend.
- `frontend/node_modules` no está presente; lockfile sí existe. No se ejecutaron build/lint del frontend ni se instaló el entorno en esta fase documental.
- No se comprobó la aplicación en navegador ni una base de datos en ejecución. Catálogo observado = semilla local, no inventario de producción.
- La carpeta no tiene metadatos Git disponibles: `git status` responde que no es un repositorio. No se verificó historia, rama ni despliegue a partir de esta copia.

## 9. Seguimiento obligatorio de cada entrega

Al iniciar: indicar fase/entrega activa, IDs cubiertos, objetivo, cambios previstos y dependencias. Durante: informar hallazgos y ajustes de alcance. Al cerrar: registrar archivos cambiados, comprobaciones ejecutadas, resultado y pendientes concretos.

| Entrega | Estado actualizado al 2026-09-24 | Evidencia de cierre |
|---|---|---|
| 0 | Diagnóstico completado; límites de ejecución documentados | Este informe y referencias al código |
| 1A | Identidad verificada; escenarios autorizados para desarrollo; confirmación comercial pendiente | Secciones 10–11 y ficha de conciliación |
| 1B | Implementada y probada | Contrato compartido, migración, reglas deterministas y dos recorridos de consumidores |
| 1C | Flujo de solicitudes validado en navegador y PostgreSQL; cerrado para desarrollo con escenarios | Datos y oferta comerciales definitivos antes de operación real |
| 1D | Cerrada técnicamente con escenarios | Pedidos, stock, cotización, reintentos y reportes verificados; sección 17 |
| 1E | Preparación y validación local cubiertas; salida operativa pendiente | Seguridad, accesibilidad, restauración y manual; sección 18 |
| 2 | Pendiente, posterior a validación de negocio | Piloto multivendedor aceptado |
| 3 | Pendiente, requiere definición | Piloto de expansión aceptado |

**Siguiente entrega: aceptación operativa 1E y piloto del horizonte 1.** Los escenarios
permiten ensayar; no convierten datos ficticios en oferta ni en validación comercial.

## 10. Bitácora — implementación de identidad y contenido de 1A

### Puntos cubiertos

- **MAR-01:** marca tipográfica La Reserva Cafe, favicon, navegación adaptable, footer,
  metadata y acceso administrativo. La Reserva conserva su identidad de tostaduría
  en fotografías, productos y relato. El wordmark es transitorio, no un logo oficial aprobado.
- **MAR-02:** historia de origen, misión, tres compromisos y visión por horizontes
  en `/origen`; portada y catálogo explican la oferta inicial de La Reserva.
- **CAT-01:** comparación documentada de los cinco productos locales y los cuatro
  nombres del PDF, con una unión de ocho nombres. Falta decisión comercial sobre
  cuáles son los siete oficiales. No se agregaron productos ficticios.
- **CAT-02/03:** ficha de datos a confirmar y distinción entre cosecha y tueste;
  no se inventaron fincas, lotes, fechas, precios o puntajes. Campos nuevos aún pendientes.
- **Comunicación comercial:** retirados teléfono ficticio, correo no confirmado,
  despacho en 48 horas, tueste al día siguiente y anuncio de pasarela próxima.
  El checkout informa registro pendiente, sin afirmar cobro o fecha de entrega.
- **Contexto:** PRODUCT y README actualizados; documentación de mocks/backend
  pendiente marcada como histórica, sin borrar sus antecedentes.

### Correcciones necesarias durante la verificación

- `ScrollToTop` devolvía implícitamente el resultado de `window.scrollTo` desde
  `useEffect`. En el navegador de prueba ese resultado provocaba `destroy is not a
  function` bajo React StrictMode. Se cambió a un cuerpo de función que no devuelve
  valor; carga y navegación verificadas después del cambio.
- El catálogo de portada y tienda ahora muestra error con reintento cuando la
  API no responde, en lugar de una sección vacía o carga indefinida.
- Las animaciones Reveal mantienen visible el contenido y solo desplazan su
  entrada. Se agregó foco visible para la navegación por teclado.

### Archivos principales

- `frontend/src/components/store/BrandMark.tsx`, `StoreNav.tsx`, `StoreFooter.tsx`, `Reveal.tsx`.
- `frontend/src/pages/store/HomePage.tsx`, `OriginPage.tsx`, `ShopPage.tsx`, `ProductDetailPage.tsx`, `CheckoutPage.tsx`.
- `frontend/src/App.tsx`, `frontend/src/index.css`, `frontend/index.html`, `frontend/public/favicon.svg`.
- Textos del login administrativo y comentarios obsoletos de contextos de sesión.
- PRODUCT, DESIGN, README, notas históricas y `docs/DIRECTO-CAFE-CATALOGO-Y-CONDICIONES.md`.

### Verificación ejecutada

- Dependencias instaladas con `npm ci`, conservando lockfile; Node 24.19 del
  runtime disponible. La instalación de Node del sistema sigue siendo 18.16.
- `npm run build`: correcto después de los cambios finales (TypeScript + Vite).
- `npm run lint`: correcto; comprobación final directa con ESLint también correcta.
- Navegador: historia completa en escritorio (1280 px) y portada/historia en móvil
  (360 px), sin desbordamiento horizontal observado. Imágenes de historia cargadas.
- Navegación entre inicio, historia y tienda; apertura/cierre del carrito vacío;
  estado de catálogo sin conexión y reintento comprobados.
- Vista previa local: `http://127.0.0.1:5173/origen`. No se publicó en producción.

### Límites y siguientes pasos

- API y PostgreSQL no levantados en esta verificación. SDK .NET 10 sigue pendiente;
  no se ejecutaron pruebas de backend ni una compra real de extremo a extremo.
- No se cambiaron entidad/contrato de pedido, stock, reportes ni el quiz actual;
  sus brechas documentadas permanecen en 1B–1E.
- El PDF de órdenes conserva por ahora el encabezado La Reserva: antes de cambiar
  documentos operativos, identificar quién emite la orden y comprobar generación
  con backend. La marca de plataforma no define por sí sola una razón social.
- Recibir catálogo y contactos confirmados; incorporar logo oficial si existe.
- En 1B: definir contrato versionado, migración compatible, selector de perfil,
  preguntas exactas y reglas deterministas con razones. Preparar SDK .NET 10 y
  base de pruebas antes de validar persistencia y cuentas existentes.

## 11. Bitácora — escenarios autorizados y entrega 1B

### Plan ejecutado y cobertura

1. **Preparación de datos:** creado `scenarios/directo-cafe/demo-v1.json` con
   siete cafés, contactos reservados `.example`, condiciones comerciales y ocho
   casos de aceptación. El usuario autorizó estos escenarios para continuar.
   Se conserva la semilla original y se identifica la procedencia de cada supuesto.
2. **Contrato común:** creado `shared/onboarding-v1.json`, validación por versión,
   perfil y respuestas exactas; integración en registro y edición de cuenta.
3. **Recorridos consumidores:** selector de cinco perfiles con nuevo consumidor
   y apasionado habilitados, cinco preguntas por rama, retroceso, precarga y
   limpieza al cambiar de perfil. Las otras ramas quedan expresamente pendientes.
4. **Recomendación:** ejemplos del PDF, hasta tres productos disponibles,
   alternativas por agotamiento, razones y afinidad calculada sin porcentajes aleatorios.
5. **Persistencia compatible:** endpoint protegido por propietario de cuenta,
   campo JSONB nullable y migración aditiva. Las preferencias históricas permanecen.
6. **Demostración y verificación:** `/demo/quiz` usa almacenamiento separado del
   navegador y no produce pedidos, cobros ni comunicaciones externas. Solo desarrollo.

### Evidencia obtenida

- Validador de escenarios: siete IDs e imágenes, referencias y contactos coherentes.
- Frontend: nueve pruebas aprobadas; incluyen cinco ejemplos y las 1,792
  combinaciones de respuestas de ambas ramas, vacío, agotados y entradas inválidas.
- `npm run build` y `npm run lint`: correctos. Los marcadores de fixture/demo no
  aparecen en `dist`; ruta demo condicionada a `import.meta.env.DEV`.
- Backend con SDK .NET 10 local: cinco pruebas aprobadas. HTTP comprueba 401 sin
  sesión, 403 para otra cuenta o personal interno, 400 por versión/producto inválido
  y guardado correcto con fecha del servidor y preferencias antiguas intactas.
- EF: SQL generado y revisado; añade únicamente `onboarding_json jsonb`, además
  del registro de migración. No hay cambios de modelo pendientes de migración.
- Navegador: nuevo consumidor floral → Carolina Claros; apasionado chocolate y
  espresso → Roberto Lopez. Edición precargada, persistencia al recargar y cambio
  de rama verificados. Selector y resultado sin desbordamiento horizontal a 360 px.

### Qué sigue pendiente y orden de trabajo

1. **Integración PostgreSQL:** aplicar la migración en base local y probar cuenta,
   API y base conjuntamente. Las pruebas actuales usan TestServer e InMemory;
   no equivalen a una comprobación PostgreSQL ni a validación en producción.
2. **1C:** incorporar empresa, cafetería y productor con sus cuatro preguntas,
   resúmenes y solicitudes guardadas; consulta por el equipo y contacto simulado.
3. **1D:** conectar presentación/molienda, condiciones, entrega y reservas de stock
   con pedidos; probar transiciones e impedir sobreventa.
4. **1E:** completar aceptación del horizonte inicial, incluida trazabilidad de
   catálogo, revisión operativa, accesibilidad y despliegue cuando corresponda.

Los escenarios resuelven la dependencia de datos para desarrollar. Antes de una
operación real se deberán confirmar cafés, fichas, precios, contactos y condiciones.
El marketplace conserva su lugar en la fase 2. No se realizó publicación.

Detalle técnico y decisiones: [entrega 1B](DIRECTO-CAFE-ONBOARDING.md).


## 12. Ajustes de 1C — 22 de septiembre de 2026

### Plan realizado y cobertura

1. **QUI-03/04/05 y DAT-01:** añadidas las doce preguntas de empresa, cafetería y
   productor del PDF, con selección única y claves e1…e4, c1…c4 y p1…p4. Se conserva
   compatibilidad con la versión 1 de los consumidores. Las cinco ramas están habilitadas.
2. **B2B-01:** los tres perfiles generan resúmenes fieles y nunca llaman al motor de
   afinidad ni necesitan cargar el catálogo para guardar sus respuestas.
3. **B2B-02:** acción explícita de registrar solicitud, validación del propietario,
   snapshot de respuestas y una solicitud por cuenta/perfil. Repetir la acción actualiza
   esa solicitud, conservando su referencia y fecha de creación. El índice único impide
   duplicados en PostgreSQL. El guardado del quiz por sí solo no registra una solicitud.
4. **Consulta interna:** `/admin/solicitudes`, protegida en API por Team y CustomersView,
   muestra contacto de cuenta, perfil, respuestas, fechas, referencia y estado pendiente.
   Paginación de 50 solicitudes, estados de carga, vacío y error con reintento.
5. **B2B-03 parcial:** acceso al catálogo disponible y condiciones mayoristas de escenario
   en la demo. Todavía no hay tarifa mayorista operativa ni catálogo empresarial dedicado.
   La candidatura enlaza con la historia y etapas del proyecto, sin habilitar vendedores.
6. **Ajustes de interfaz:** corregido cierre JSX del resultado demo, registro conserva
   el resultado después de guardar, recorrido comercial evita recomendaciones sensoriales,
   cabecera demo y foco de preguntas ajustados para navegación móvil.

### Pruebas ejecutadas

- Compilación TypeScript/Vite y lint aprobados.
- 12 pruebas frontend aprobadas: mantienen los cinco ejemplos originales y exploran
  1,792 combinaciones de consumidores más 312 comerciales. Comprueban resumen completo,
  rechazo de claves ajenas y prohibición de recomendar cafés a las ramas comerciales.
- 5 pruebas backend aprobadas, incluyendo un recorrido HTTP ampliado de los tres perfiles:
  propietario, autenticación, rol del equipo, rechazo de producto recomendado comercial,
  repetición sin duplicados, snapshots independientes y listado autorizado.
- Migración `20260922145438_AddCommercialRequests` generada; SQL revisado. Solo crea
  tabla de solicitudes, relación con cuenta e índice único. EF no detecta cambios pendientes.
- Navegador: empresa, cafetería y productor completados y solicitudes simuladas confirmadas.
  Resumen de productor a 360 px sin desbordamiento horizontal.
- La demo sigue separada del entorno operativo y no envía comunicaciones externas.

### Pendientes concretos y siguiente orden

1. Levantar PostgreSQL local y aplicar las migraciones pendientes de 1B/1C. Las pruebas
   actuales usan InMemory y TestServer; no se verificó todavía la base PostgreSQL.
   No se encontró Docker ni psql en el PATH del entorno revisado.
2. Probar registro/login → quiz → solicitud → bandeja con API y PostgreSQL reales.
   La bandeja está compilada y su API probada; aún no validada visualmente con sesión real.
3. Completar responsable asignado y transiciones de seguimiento propuestas en 1C.
   En esta entrega todas las solicitudes permanecen pendientes de revisión; no se afirma
   que exista gestión de estados o envío a CRM/correo.
4. Confirmar catálogo empresarial y tarifas operativas. Los contactos y precios de
   escenario permiten pruebas, pero no representan una oferta aprobada.
5. Continuar 1D con presentación/molienda, condiciones de pedidos, stock y medición.

No se publicó ni se migró una base operativa. No se declara 1C operativamente cerrada.


## 13. Seguimiento y PostgreSQL — 22 de septiembre de 2026

### Plan de este bloque y puntos cubiertos

1. **B2B-02 / seguimiento:** responsable opcional en Nueva/Cerrada y obligatorio
   para En contacto/Propuesta enviada. Asignables: usuarios activos de Administración,
   Compras y Ventas. Supervisor consulta; no modifica ni asigna.
2. **Estados:** Nueva → En contacto o Cerrada; En contacto → Propuesta enviada o
   Cerrada; Propuesta enviada → En contacto o Cerrada; Cerrada → Nueva.
   Se permite conservar el estado al reasignar o añadir una nota.
3. **Historial:** fecha UTC, actor, estado y responsable anteriores/nuevos, nota
   obligatoria de 1–1000 caracteres. Un estado no envía mensajes ni acredita por sí
   mismo que se realizó una comunicación externa; el equipo documenta su trabajo.
4. **Actualizaciones del cliente:** la misma confirmación no reabre ni duplica.
   Cambiar respuestas y confirmar conserva referencia, fecha inicial y responsable,
   guarda las respuestas anteriores en historial y devuelve el estado a Nueva.
5. **Concurrencia y privacidad:** versión por solicitud, respuesta 409 cuando se
   intenta guardar una versión antigua. Historial y asignaciones solo en respuesta
   del equipo; la confirmación al cliente no contiene notas internas.
6. **Persistencia:** migración `20260922150852_AddCommercialWorkflow` agrega columnas,
   JSONB de historial, versión y FK al responsable. Solicitudes anteriores quedan
   como Nueva, sin responsable e historial vacío. No se borran datos.

### Verificación e infraestructura local

- Compilación y lint correctos para el formulario de seguimiento.
- Cinco pruebas backend aprobadas con InMemory y nuevamente con PostgreSQL real,
  incluyendo API HTTP, roles, asignables inactivos, transiciones, nota, repetición,
  versiones antiguas, cierre y reapertura con conservación de respuestas.
- PostgreSQL portable obtenido de EDB, en `.tools/postgresql17`; clúster de pruebas
  `.tools/pg-test-data`, escucha solo 127.0.0.1:55432, autenticación SCRAM y contraseña
  aleatoria. No se instaló servicio del sistema ni se usó una base operativa.
- Las cinco migraciones se aplicaron a una base `directo_test_*` nueva. La API
  también arrancó con una segunda base nueva y la semilla existente del proyecto.
- Reproducción: definir `DIRECTO_TEST_CONNECTION` con una conexión a una base nueva,
  vacía, llamada `directo_test_*` en `127.0.0.1`; ejecutar `dotnet test`. El test HTTP
  selecciona Npgsql, aplica migraciones y verifica el flujo. Sin esa variable usa
  InMemory. La prueba rechaza otros nombres/hosts para evitar uso accidental operativo.
- La revisión automática bloqueó crear la cuenta ficticia desde navegador sin
  autorización explícita. Se pidió confirmar la cuenta `empresa-1c@example.com` y
  las acciones locales de prueba. No se eludió ese bloqueo mediante otro canal.

### Pendientes para cerrar 1C

1. Con esa autorización, verificar visualmente registro → quiz → solicitud → bandeja
   → responsable/estado → recarga. La API con PostgreSQL ya está comprobada; no confundir
   esa prueba con aceptación visual completa.
2. Completar destino empresarial/tarifa mayorista operativa o mantenerlos expresamente
   como escenarios hasta su aprobación. El catálogo general y escenarios sí existen.
3. Registrar aceptación del bloque antes de continuar 1D (pedidos, molienda, stock y medición).

Fuentes de instalación: https://www.postgresql.org/download/windows/ y
https://www.enterprisedb.com/download-postgresql-binaries (archivo Windows PostgreSQL 17).

Al finalizar se detuvieron la API temporal y PostgreSQL. Los datos y binarios quedan
en carpetas ignoradas para retomar la prueba. La limitación final del recibo del cliente
(sin historial ni responsable) se comprobó en la regresión InMemory después del recorrido
PostgreSQL; el cambio no modifica esquema ni persistencia.


## 14. Validación autorizada y cierre técnico de 1C

El usuario autorizó expresamente crear la cuenta ficticia, registrar su solicitud
comercial y cambiar responsable y estado dentro de la base local aislada.
La limitación de autorización de la sección 13 queda resuelta.

### Recorrido ejecutado desde navegador

1. Registro de Empresa de prueba 1C, `empresa-1c@example.com`, en la base de pruebas.
2. Rama Empresa: 11 a 50 personas, Quincenal, $50 – $150 y Molido.
3. Resumen mostrado y solicitud confirmada con referencia
   `976d0f50-417b-4800-afb8-5356eaeb4814`.
4. Inicio de sesión del administrador de prueba y apertura de `/admin/solicitudes`.
   La solicitud apareció con las cuatro respuestas, contacto y estado Nueva.
5. Asignación a Lucia Mejia (Ventas), cambio a En contacto y nota que identifica
   expresamente la simulación y que no se contactó al cliente.
6. Recarga completa: responsable, estado e historial de dos entradas conservaron
   sus valores. Verificados también directamente en PostgreSQL.
7. Consulta de `/cuenta`: el resumen empresarial conserva las respuestas guardadas.
8. Cierre de ambas sesiones de prueba. Sin correos, cobros, pedidos ni publicaciones.

### Resultado y límites

Queda cerrado para desarrollo el flujo de solicitudes de 1C: preguntas, resumen,
registro, consulta administrativa y seguimiento persistente. Se mantienen como
escenarios los contactos y condiciones comerciales autorizados. Catálogo empresarial
dedicado y tarifas definitivas siguen siendo requisitos comerciales de salida,
no una función operativa que esta verificación dé por aprobada.

La base y los datos de prueba se conservan en carpetas locales ignoradas; los servicios
API/PostgreSQL temporales se detienen al terminar. La demo frontend queda disponible.
No se repitieron compilaciones o pruebas unitarias: este bloque no cambió código y
resolvió la aceptación visual pendiente de los cambios ya verificados.

### Siguiente fase: 1D, en este orden

1. **Pedido completo:** auditar los datos que captura checkout frente a DTO/entidad;
   conservar contacto, dirección/zona, notas, presentación y molienda en cada pedido.
2. **Reglas comerciales de escenario:** aplicar cantidades y condiciones explícitas,
   sin calcular descuentos a partir de rangos ambiguos ni asumir cobertura no definida.
3. **Inventario y estados:** reserva al aprobar, liberación al cancelar, transiciones
   válidas e impedimento de sobreventa mediante reglas del servidor y concurrencia.
4. **Administración y reportes:** mostrar la información necesaria para atender;
   calcular ventas y rankings con fechas y estados correctos, sin confundir pedidos
   pendientes o cancelados con ventas realizadas.
5. **Aceptación 1D:** pruebas con PostgreSQL de pedido completo, aprobación, cancelación,
   concurrencia y exportaciones. Mantener las comunicaciones como simulación.


## 15. Fase 1D.1 — datos completos del pedido (22 de septiembre de 2026)

### Hallazgo y alcance cubierto

El checkout capturaba teléfono, dirección, ciudad y notas, pero enviaba únicamente
nombre y productos. Se cerró este primer bloque de 1D en todos sus puntos:

- DTO, entidad y migración aditiva `20260922205854_CaptureOrderFulfillment`.
- Teléfono, dirección, ciudad y notas persistidos; nombre/teléfono/dirección/ciudad
  obligatorios para nuevos pedidos, con límites de longitud y cantidades.
- Cuenta asociada desde la sesión autenticada; se rechaza asociar una cuenta ajena
  o asociarla sin autenticación. Los invitados conservan `accountId = null`.
- Preparación por café: en grano, espresso, filtro o prensa francesa. Es una
  selección operativa para el escenario; no confirma disponibilidad comercial.
- Presentación, tueste, nombre y precio se copian del catálogo del servidor al
  crear cada línea. No se alteran al editar después el catálogo. La presentación
  es la del producto adquirido: aún no existe un selector de variantes de peso.
- Administración muestra contacto, entrega, notas y preparación, y solicita los
  mismos datos al crear pedidos manuales. Los fallos de guardado son visibles;
  el estado mostrado cambia solo después de confirmación de la API.
- PDF con identidad La Reserva Cafe, relación con La Reserva, datos de entrega y
  preparación. No acredita un pago ni fija costo/plazo de envío.
- Compatibilidad de CSV antiguo; los nuevos registros conservan los campos y
  líneas mediante JSON dentro de CSV. Pedidos anteriores muestran datos faltantes
  explícitamente; no se reconstruyen a partir del catálogo actual.
- Checkout móvil: resumen/molienda antes del formulario y de la confirmación.
  Carrito ya no promete pago contra entrega ni cálculo de envío no implementados.

### Validación realizada

- Frontend: compilación de producción, ESLint y 12 pruebas existentes correctas.
- Backend: 6 pruebas correctas, incluidas validación de datos, sesión/cuenta,
  creación invitada/autenticada, persistencia tras cambiar el catálogo y PDF
  actual/antiguo. La prueba nueva se ejecutó también con PostgreSQL real aislado.
- Para reproducir PostgreSQL: `DIRECTO_ORDER_TEST_CONNECTION` usa una base nueva
  cuyo nombre comience con `directo_test_`, host `127.0.0.1`. Es distinta de
  `DIRECTO_TEST_CONNECTION` (onboarding), para evitar compartir fixtures/migraciones.
- La migración se aplicó además a la base local de demostración con datos previos.
- Revisión visual del checkout en escritorio y 360 px, selección de molienda,
  detalle administrativo y formulario manual. PDF generado, renderizado e inspeccionado.
- Pedido ficticio local `OC-2026-560523991254`, marcado «PRUEBA LOCAL. No preparar
  ni despachar», usado solo para comprobar administración/PDF. Sin cobro ni mensajes.

### Siguiente bloque: 1D.2 y 1D.3

1. Condiciones versionadas de escenario, zona/cobertura y costos/descuentos claros.
2. Reservar stock al aprobar; liberar al cancelar; transiciones válidas,
   concurrencia, prevención de sobreventa y reintentos sin duplicar pedidos.
3. Reportes de ventas y rankings por período/estado, inventario y exportaciones;
   objetivos medibles de validación del primer horizonte.
4. Aceptación de todo 1D con PostgreSQL y paso posterior a 1E.

**Estado:** 1D.1 completada. La aprobación/cancelación de stock, condiciones y
medición siguen pendientes; este avance no autoriza operación comercial real.


## 16. Fase 1D.2 — reservas e inventario (23 de septiembre de 2026)

### Cubierto

- Pendiente → Aprobada o Cancelada; Aprobada → Finalizada o Cancelada.
  Cancelada y Finalizada son terminales. Repetir el mismo estado no repite movimientos.
- Aprobar comprueba todos los cafés activos y sus existencias, agregando cantidades
  de líneas del mismo café aunque tengan distintas moliendas. Reserva todo en una
  sola transacción; ante falta de stock o conflicto no guarda cambios parciales.
- Cancelar devuelve solo existencias cuya reserva quedó registrada. Finalizar
  conserva el descuento realizado al aprobar. Los pedidos previos no reciben
  reservas ficticias ni devoluciones automáticas sin evidencia.
- Concurrencia optimista en productos y estado del pedido. Dos aprobaciones de las
  últimas unidades no pueden guardarse ambas. Un conflicto devuelve HTTP 409.
- El catálogo entrega una versión que se requiere al editar. Una edición antigua
  no puede reponer accidentalmente stock reservado después de cargar la pantalla.
- Supervisor consulta estados; Administrador, Compras y Ventas pueden modificarlos.
  La UI ofrece únicamente transiciones válidas, informa errores y permite recargar.
- Migración `ReserveOrderInventory` aditiva: versión del producto y evidencia de
  reserva. No modifica existencias históricas.

### Evidencia y límites

La prueba HTTP de pedidos pasó con PostgreSQL real en una base nueva. Comprueba
permisos, aprobación, stock insuficiente, cancelación repetida, estado obsoleto,
finalización y rechazo de edición de catálogo obsoleta. Dos contextos independientes
leen las mismas últimas unidades antes de guardar: el segundo recibe conflicto;
la base conserva su pedido pendiente y sin reserva, y solo descuenta el primero.
Frontend: build, lint y 12 pruebas correctas. Se agregaron pruebas específicas de
agregación de líneas, producto inactivo y cancelación de pedidos históricos.

Este bloque cierra **reservas y transiciones**, no toda 1D. Permanecen pendientes:
condiciones comerciales versionadas (envíos/descuentos/cobertura), idempotencia de
creación frente a reintentos de red, reportes por fecha/estado y métricas de negocio.
Las devoluciones posteriores a una venta finalizada requieren un flujo separado;
no se representan reabriendo la orden. Confirmar datos oficiales sigue pendiente.


## 17. Cierre técnico 1C/1D — 24 de septiembre de 2026

### Puntos cubiertos

- **B2B-03:** catálogo `/empresas` con tres cafés mayoristas elegibles; simulador de
  cantidades, mínimo 5 kg y descuentos 5/8/10% desde 5/15/30 kg. Los siete cafés
  demo pueden sembrarse en una base nueva con escenario habilitado. No se reemplaza
  un catálogo existente ni se convierten rangos `$` del quiz a HNL automáticamente.
- **CTA-01/02:** cotización de servidor versionada, importe y preparación históricos;
  escenario Tegucigalpa L 80 o gratis desde L 1,000 después del descuento. Fuera de
  cobertura el envío queda sin precio y la aprobación se bloquea hasta registrar
  tarifa/acuerdo manual con nota y protección de versión.
- **Idempotencia:** UUID por envío, hash de contenido y restricción única en base;
  repetición serial o simultánea devuelve la misma orden; cambiar contenido devuelve
  409. La UI conserva un envío incierto en la pestaña y permite recuperarlo.
- **Inventario:** reservas al aprobar, cancelación que devuelve una sola vez,
  finalización terminal, conflictos de producto/orden sin cambios parciales.
- **ADM-02:** fecha de finalización, historial y reportes tipados. Ventas/ranking
  incluyen solo finalizadas en período Honduras; históricos sin fecha se excluyen
  explícitamente. Inventario es actual; movimientos es historial de pedidos, no
  kardex de bodega. PDF/Excel respetan tipo/rango y muestran importes numéricos.
- **Medición:** definiciones y objetivos propuestos de piloto en el documento de
  cierre. Los PDF no fijan umbrales; se separa evidencia técnica de resultados reales.

### Evidencia

Pruebas HTTP con PostgreSQL aislado: contacto, permisos, cotización, cobertura,
reserva/cancelación, edición obsoleta, dos competidores por últimas unidades,
repeticiones concurrentes y exportaciones. Migración `CompleteOrderCommerce`
aditiva; las órdenes existentes no reciben tarifas ni fechas inventadas.

Desde navegador: simulación mayorista de 15 bolsas Blend (5.1 kg), L 4,800 menos
L 240 y envío L 0 = L 4,560; compra ficticia de una bolsa L 320 + L 80 = L 400,
referencia `OC-2026-07AB69693B93`, aprobada y finalizada. Stock de 120 a 119;
dashboard de L 0 a L 400. PDFs ventas/inventario/movimientos renderizados y
revisados; Excel con valor numérico 400. Ningún cobro, despacho o mensaje real.

**Resultado:** 1C/1D técnicamente cerradas con escenarios. Condiciones oficiales y
validación comercial quedan como puertas de salida, no como funciones simuladas reales.

## 18. Integración de main y preparación 1E — 24 de septiembre de 2026

1. Git: guardado `680d0b2`, fetch y merge de `origin/main` (`5729221`). Se resolvieron
   conflictos conservando comercio/reportes y seguridad/auditoría de main. Merge
   `ea1984f` subido a `codex/directo-cafe-fase-1d`. Main no fue sobrescrita.
2. Despliegue: Dockerfile Render corregido para incluir `shared`/`scenarios` y Node 24.
   Configuración revisada; no se ejecutó despliegue ni construcción Docker.
3. Seguridad: se detectó refresh permitido a usuarios inactivos y se corrigió.
   `RevokeTeamSessions` añade versión de sesión: cambios de permisos/contraseña o
   desactivación revocan JWT y refresh. Un JWT real dio 200 antes y 401 después de
   cambiar la versión en una cuenta ficticia de la base local.
4. Recuperación del personal: probado token de un uso, expiración, longitud mínima,
   revocación y bitácora, sin enumerar cuentas. Emisor simulado, sin correo externo.
   Pruebas InMemory y PostgreSQL; no se acredita entrega del proveedor ni recuperación
   de cuentas de tienda.
5. Accesibilidad: formularios/carrito usan diálogo modal con foco confinado, Escape
   y vuelta al botón de origen; contenido largo desplazable. Verificado con teclado.
   Panel administrativo con navegación horizontal móvil; catálogo empresarial y
   formulario de pedidos revisados a 360 px.
6. Respaldo: dump y restauración en otra base local coinciden en órdenes (9), líneas
   (9), total (L 25,890), stock agregado (2) y auditoría (4). Imágenes locales con
   fixture/restauración; infraestructura externa todavía requiere su propio ensayo.
7. Operación: manual de atención, matriz de roles, cotización, recuperación de envío,
   reportes, respaldo y reversión. Criterios propuestos y secuencia de fases 2/3.

Build/lint y pruebas frontend correctas; backend y modelo/migraciones verificados.
`npm audit` y revisión NuGet transitiva sin vulnerabilidades reportadas al ejecutar
los comandos. Esto no constituye una auditoría exhaustiva de seguridad.

**Límites de cierre:** falta entorno operativo elegido/configurado, datos y responsables
reales, prueba del correo/almacenamiento del proveedor y piloto comercial aceptado.
No se declara 1E desplegada ni los horizontes 2/3 implementados. Ver estado vigente
y manual; los pendientes anteriores de cotización/reintentos/reportes quedan resueltos.
