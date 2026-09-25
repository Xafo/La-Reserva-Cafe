# La Reserva Café — manual operativo de fase 1

24 de septiembre de 2026. Código de `codex/directo-cafe-fase-1d`. Los ejemplos son
ensayos, sin cobros, despachos ni comunicaciones a terceros.

## 1. Entorno y escenarios

Requisitos de validación local: Node 24, .NET 10 y PostgreSQL 17. La API utiliza
PostgreSQL; los CSV son semillas, no una copia del inventario vivo.

| Configuración | Uso |
|---|---|
| `ConnectionStrings__Postgres` | Conexión privada, específica del entorno. |
| `Jwt__SigningKey` | Secreto de al menos 32 bytes; fuera de Git y del navegador. |
| `Seed__DataPath` | Carpeta de CSV; solo se siembran conjuntos vacíos. |
| `Seed__AdminPassword`, `Seed__CustomerPassword` | Contraseñas iniciales protegidas; reconciliar las cuentas demo antes de operar. |
| `Commerce__ScenarioEnabled` | `true` habilita tarifas ficticias y siete cafés en catálogo vacío. `false` desactiva tarifas demo; no elimina productos ya sembrados. |
| `Uploads__Path` | Carpeta persistente local; incluirla en respaldos. |
| `Uploads__Provider` | `Supabase` para almacenamiento externo; en otro caso, archivos locales. |
| `AllowedHosts`, `Cors__Origins__0` | Dominio y origen concretos del entorno. |
| `Email__Provider` | `Disabled` por defecto; habilitar solo con proveedor/remitente verificados. |

Compose traduce `COMMERCE_SCENARIO_ENABLED` de `.env` a la opción de API. Consultar
`.env.example`; no guardar secretos en Git. Los productos existentes nunca se
sustituyen automáticamente por el catálogo demo. Revisar cada producto, cuenta y
pedido de la base antes de pasar a operación.

## 2. Atender solicitudes

1. Abrir Solicitudes comerciales; verificar perfil y las cuatro respuestas.
2. Asignar a un integrante activo de Administración, Compras o Ventas.
3. Pasar a En contacto y documentar la gestión efectivamente realizada.
4. Registrar la propuesta y su alcance antes de marcar Propuesta enviada.
5. Cerrar con nota. Si el cliente cambia respuestas y vuelve a confirmar, se reabre
   la misma referencia y se conservan las respuestas anteriores en historial.

Cambiar un estado no envía mensajes. Los contactos `.example` no son destinos
operativos. Supervisor consulta este seguimiento; no modifica. Ante conflicto de
versión, recargar y revisar historial. Las notas internas no aparecen al cliente.

## 3. Cotizar y atender pedidos

1. Revisar café, cantidad, molienda, contacto y entrega. El servidor conserva precio,
   presentación y tueste históricos por línea.
2. Revisar cotización antes de confirmar. En escenario, mayorista requiere selección
   expresa, cafés elegibles y mínimo 5 kg: 5% desde 5 kg, 8% desde 15 kg y 10% desde
   30 kg. El perfil empresarial por sí solo no activa descuento.
3. Escenario Tegucigalpa: L 80, gratis desde L 1,000 de productos después del
   descuento. Fuera de cobertura, envío sin precio: registrar tarifa y nota del
   acuerdo manual antes de aprobar. No presentar el subtotal como total definitivo.
4. Pendiente no reserva. Aprobar verifica disponibilidad y reserva todas las líneas
   atómicamente. Ante 409 por competencia de stock, recargar y revisar.
5. Finalizar cuando el equipo confirme atención. Cancelar una aprobada devuelve
   solamente la reserva registrada, una vez.
6. Finalizada/Cancelada no se reabren. Devoluciones posteriores y conciliación de
   pedidos antiguos son procesos separados, todavía no automatizados.

Confirmación/PDF no son factura fiscal ni comprobante de pago. Importes en HNL;
no convertir automáticamente el presupuesto `$` del quiz. No hay suscripción,
crédito mensual ni exclusividad automáticos.

### Respuesta incierta por interrupción de red

Usar **Verificar envío anterior**. La pestaña conserva temporalmente cuerpo e
identificador en `sessionStorage`; el servidor devuelve la misma orden para el mismo
contenido incluso si cambió después el catálogo. Un contenido diferente con ese
identificador se rechaza. No ingresar la operación como un pedido nuevo.
Si venció la sesión, entrar con la misma cuenta y reintentar. Un error temporal o
429 conserva la recuperación. Cerrar la pestaña puede perder ese dato local: consultar
al equipo antes de repetir. Se elimina al confirmar la respuesta.

## 4. Reportes

- Ventas/ranking: solo Finalizada, por fecha de finalización en horario Honduras
  UTC−6 y rango seleccionado. No son cobros conciliados.
- Pedidos: fecha de creación y filtro de estado.
- Productos/inventario: estado actual, no existencias históricas de fin de mes.
- Movimientos: historial operativo real de pedidos, no entradas de bodega ni ajustes
  manuales; no llamarlo kardex.
- Históricos finalizados sin fecha: excluidos del período y contados aparte.
  Conciliar con evidencia; no asignarles una fecha ficticia.

Comparar líneas, descuento, envío, total y estado con PDF/Excel del mismo rango.
Separar los datos de ensayo de las métricas comerciales.

## 5. Acceso y auditoría

| Operación | Permisos actuales |
|---|---|
| Solicitudes/pedidos/clientes: consulta | Administración, Compras, Ventas, Supervisor |
| Solicitudes/pedidos/clientes: cambios | Administración, Compras, Ventas |
| Productos/calidad: cambios | Administración, Compras, Supervisor |
| Reportes | Administración, Ventas, Supervisor |
| Usuarios y bitácora general | Administración |

Supervisor no es lectura global: conserva edición de catálogo/calidad de la política
existente. La bitácora registra acciones instrumentadas de usuarios, recuperación y
estados; órdenes/solicitudes tienen también su historial. No registra exhaustivamente
toda lectura o edición del sistema.

Desactivar usuario o cambiar rol/contraseña revoca sesiones. Cada JWT del equipo se
contrasta con actividad, rol y versión actual. Tras migrar versiones de sesión, el
equipo debe volver a entrar. Un desactivado tampoco puede renovar refresh.

Recuperación del **equipo interno**: enlace de 30 minutos, hash de token, un uso,
contraseña de 12 caracteres mínimo. Revoca otras recuperaciones/refresh, cambia la
versión de sesión y registra auditoría. No existe recuperación equivalente para
cuentas de tienda en este alcance. Sin correo configurado muestra indisponibilidad.

Correo: `Email__Provider=Smtp` con `Email__Host`, `Port`, `EnableSsl`, `Username`,
`Password`; o `Brevo` con `Email__ApiKey`. Ambos requieren `Email__From` y
`Email__ResetUrl=https://DOMINIO/admin/reset-password`, sin query ni fragmento.
Secretos en el proveedor, nunca en logs/Git. Probar entrega solo a destinatario
autorizado. El emisor simulado de las pruebas no acredita entrega real.

## 6. Respaldo y restauración

Designar operador técnico. Antes de migrar: pausar escrituras y respaldar base,
imágenes, configuración no secreta y referencia Git. Secretos en gestor seguro.

```powershell
# PGHOST, PGPORT, PGUSER y PGPASSFILE configurados fuera del historial.
# Sustituir los nombres; restaurar en una base NUEVA, nunca encima de producción.
pg_dump --dbname BASE_ORIGEN --format custom --file respaldo.dump
if ($LASTEXITCODE -ne 0) { throw 'Respaldo fallido' }
createdb BASE_RESTAURACION_NUEVA
if ($LASTEXITCODE -ne 0) { throw 'No se creó la base de restauración' }
pg_restore --dbname BASE_RESTAURACION_NUEVA --no-owner --exit-on-error respaldo.dump
if ($LASTEXITCODE -ne 0) { throw 'Restauración fallida' }
```

Copiar `Uploads__Path` y restaurar en otra carpeta; comparar nombres, cantidad y
SHA-256 de cada archivo. En Compose, imágenes en `product_uploads`. El volumen
`postgres_data` no reemplaza un dump validado. Para Supabase, respaldar los objetos
del bucket: el dump SQL guarda URLs, no los archivos.

Comparar conteos de órdenes, líneas, solicitudes, stock, totales, auditoría y
`__EFMigrationsHistory`; iniciar API aislada y comprobar sesión, orden, reporte e
imagen. Desactivar correo real en el ensayo. Registrar fecha, versión, ubicación
privada, hashes, resultado y responsable.

Ensayo ejecutado: `pg_dump -Fc`/`pg_restore --no-owner --exit-on-error` entre bases
locales `directo_test_*`; coinciden órdenes, líneas, total, stock y auditoría.
Archivos locales: prueba de fixture y restauración byte a byte. No se ensayó
restauración en Render/Supabase ni reinicio de contenedores.

Propuesta para aceptar con el operador: copia diaria, 7 diarias y 4 semanales,
cifradas y fuera del servidor; ensayo mensual; pérdida objetivo ≤24 horas y
restauración objetivo ≤4 horas. Son objetivos, no tiempos demostrados ni SLA.

## 7. Publicación y reversión

1. Elegir commit revisado. Ejecutar frontend build/lint/test, validador de escenarios,
   backend tests y `dotnet ef migrations has-pending-model-changes`; revisar dependencias.
2. Respaldar/restaurar en ensayo; verificar migraciones aditivas de contacto, reserva,
   comercio, seguridad y versión de sesión. No reescribir migraciones aplicadas.
3. La API migra al arrancar: coordinar una instancia y ventana sin escrituras.
4. Docker Compose o `deploy/Dockerfile.render` incluyen recursos compartidos y Node 24.
   `render.yaml` apunta a `main` y no tiene despliegue automático: subir esta rama no
   despliega sus cambios. No desplegar main esperando ajustes que solo están en esta rama.
5. Configurar HTTPS, origen, secretos y almacenamiento persistente. La API acepta
   cabeceras reenviadas; mantenerla detrás del proxy confiable, sin acceso directo
   público que permita falsificarlas.
6. Comprobar `/health`, luego base, sesión, catálogo e imagen. Health por sí solo
   no acredita base, almacenamiento, correo ni cobros.
7. Ante fallo, detener escrituras y guardar evidencia. Revisar compatibilidad antes
   de volver al binario anterior. No ejecutar Down ni sobrescribir base automáticamente;
   restaurar requiere reconciliar escrituras posteriores al respaldo.

## 8. Ficha que debe completar el operador

| Dato | Estado actual |
|---|---|
| Responsable comercial/técnico y reemplazo | Por designar |
| Commit y entorno de publicación | Rama preparada; entorno operativo sin verificar |
| Siete fichas, stock y evidencia de origen/tueste | Escenarios; aprobación pendiente |
| Contactos, entrega, pago y beneficios | Escenarios; aprobación pendiente |
| Remitente/destinatario autorizado para ensayo | Sin configurar; ningún envío realizado |
| Destino de copias y restauración operativa | Prueba local completada; operativo pendiente |
| Fecha/resultados de piloto de negocio | No iniciado |

Ver [criterios y pilotos](DIRECTO-CAFE-CIERRE-Y-PILOTOS.md). Estos pendientes permiten
seguir ensayando escenarios; no autorizan por sí mismos publicar oferta real.
