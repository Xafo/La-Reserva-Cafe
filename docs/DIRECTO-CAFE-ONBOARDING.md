# Directo Café — entregas 1B y 1C

## Alcance implementado

Selector inicial con los cinco perfiles del PDF. Nuevo consumidor y apasionado
tienen cinco preguntas cada uno. Empresa, cafetería y productor tienen cuatro
preguntas, resumen propio y registro explícito de solicitud implementados en 1C.
Registro y cuenta permiten guardar y editar respuestas; cambiar de perfil limpia
las respuestas de la rama anterior. Los errores de guardado permiten reintentar.

## Contrato y persistencia

`shared/onboarding-v1.json` es la fuente compartida de opciones exactas para
frontend y backend. Se guarda `{ version: 1, profile, answers, updatedAt }`.
Perfiles: `new`, `enthusiast`, `business`, `cafe`, `producer`; claves
`n1…n5`, `a1…a5`, `e1…e4`, `c1…c4`, `p1…p4`.
La API exige exactamente todas las claves y valores permitidos, sin respuestas
de otra rama. Las etiquetas actúan como valores: cambiarlas requiere considerar
compatibilidad o una versión nueva del esquema.

`PUT /api/accounts/{id}/onboarding` recibe `{ onboarding, recommendedProductId }`.
Requiere una sesión de cliente cuyo identificador coincida con `{id}`. El servidor
establece la fecha de actualización y valida que el producto recomendado, si se
envía, exista, esté activo y tenga stock. La recomendación se calcula en el frontend;
el servidor no certifica su puntuación. Devuelve la cuenta con su onboarding.

La migración `20260921214147_AddCustomerOnboarding` añade una columna nullable
`onboarding_json` de tipo JSONB. Conserva `CustomerPreference` y sus datos históricos.
Las cuentas antiguas pueden seguir consultando su perfil anterior y actualizarlo.
La fábrica de diseño EF permite generar migraciones sin iniciar la API; cualquier
aplicación manual con EF debe indicar explícitamente la conexión de destino.

## Reglas y explicación

Se filtran productos inactivos o sin stock y se devuelven hasta tres disponibles.
Las reglas editoriales tienen prioridad, en este orden:

1. Apasionado con sabor fermentado o molienda gruesa/extra gruesa: Miguel Angel.
2. Apasionado achocolatado con espresso: Roberto Lopez.
3. Sabor floral: Carolina Claros.
4. Nuevo consumidor con sabores dulces y taza equilibrada: La Reserva Blend.

Estos nombres vienen de ejemplos del PDF. La extensión floral a otras combinaciones
y los desempates son decisiones de implementación documentadas. Si falta el café
previsto, se ofrecen alternativas disponibles con una explicación explícita.

Afinidad: 60 puntos por correspondencia sensorial o regla editorial, 25 por tueste
y 15 por método. Sin preferencia fija de tueste se consideran esos 25 puntos neutrales.
Primero se ordena la coincidencia editorial, luego los puntos y finalmente el ID.
Por ello la sugerencia editorial puede preceder a otra de mayor puntuación.
El resultado es determinista y no representa probabilidad de satisfacción.
Se conserva la intención del quiz, pero no se generan porcentajes artificiales
de 92–99% como propone el PDF: se prioriza el compromiso de descripciones honestas.

Las respuestas n1 y a2 se conservan como contexto, sin sumar puntos; n5 añade una
razón en el caso de regalo floral. La presentación y molienda no modifican todavía
la línea del pedido: esa integración corresponde a 1D.

## Escenarios y pruebas

`/demo/quiz` solo está disponible en desarrollo. Importa los siete cafés autorizados
como escenario y guarda las respuestas en `directo-cafe:demo:onboarding:v1`.
No crea cuentas, pedidos, cobros ni mensajes. No sustituye la API cuando falla.
La fixture y la página demo quedan excluidas de la compilación de producción.

- Frontend: cinco ejemplos del PDF, catálogo vacío, agotados/inactivos, estabilidad,
  respuestas inválidas y las 1,792 combinaciones de los dos perfiles.
- Backend: contrato, conservación de preferencias históricas y pruebas HTTP de
  autenticación, propiedad de cuenta, respuestas inválidas y guardado correcto.
- Navegador: ambos recorridos, edición, persistencia al recargar y cambio de perfil.
- Pendiente: aplicar migración y verificar el recorrido cuenta/API/PostgreSQL
  completo; las pruebas actuales usan EF InMemory y TestServer.

## Solicitudes comerciales (1C)

`PUT /api/accounts/{id}/commercial-requests/{profile}` registra o actualiza la
solicitud usando el perfil comercial completo guardado en la cuenta. Requiere
sesión de cliente propietario. No toma respuestas arbitrarias del cuerpo ni
registra la solicitud automáticamente al finalizar el quiz. Rechaza una rama
que no coincida con la guardada. Una solicitud por cuenta/perfil, con snapshot
independiente: cambiar el quiz no modifica solicitudes hasta volver a confirmarlas.
Al cambiar respuestas se conserva la captura anterior en el historial del equipo
y se vuelve a Nueva. Las actualizaciones simultáneas se controlan con versión.

`GET /api/commercial-requests?page=1` exige Team y CustomersView, devuelve
`{ items, hasMore }`, 50 elementos por página ordenados por actualización e ID.
El contacto se obtiene de la cuenta actual; las respuestas provienen del snapshot.
La bandeja está en `/admin/solicitudes`. Estado inicial: Nueva. Seguimiento e historial implementados (ver sección siguiente).

La migración `20260922145438_AddCommercialRequests` crea la tabla, FK e índice
único por cuenta/perfil. No cambia cuentas ni productos existentes.

La demo guarda solicitudes en `directo-cafe:demo:request:{profile}`, sin API.
La confirmación visual dura hasta recargar; repetir el registro conserva la misma
referencia y actualiza los datos. Condiciones y contactos se identifican como simulados.

Ver la sección 12 del plan para pruebas ejecutadas y límites de la entrega.


## Seguimiento del equipo

`GET /api/commercial-requests/assignees` lista personal activo de Administración,
Compras y Ventas. `PATCH /api/commercial-requests/{id}/workflow` recibe
`{ status, assignedUserId, version, note }`; ambos exigen Team y CustomersWrite.
Supervisor mantiene acceso de lectura al listado con CustomersView.

La versión GUID evita sobrescribir cambios concurrentes: un conflicto devuelve 409.
La nota es obligatoria, máximo 1000 caracteres. En contacto y Propuesta enviada
requieren responsable activo. El historial registra actor, fechas y cambios; solo
se entrega al equipo. La respuesta de registro al cliente es un recibo limitado.

El estado es seguimiento manual, sin correos o CRM. No activa vendedores, descuentos
ni permisos adicionales. La matriz de transiciones y evidencia está en la sección
13 del plan. Las pruebas HTTP pueden usar PostgreSQL local con DIRECTO_TEST_CONNECTION.


## Aceptación visual de 1C

Con autorización del usuario se completó en navegador el registro de una cuenta
ficticia, el quiz empresarial, la solicitud y su asignación/cambio de estado desde
la bandeja del equipo. Recarga e historial verificados con PostgreSQL real.
Ver sección 14 del plan. Los datos comerciales de escenario no se convierten por
ello en condiciones oficiales ni se enviaron comunicaciones externas.
