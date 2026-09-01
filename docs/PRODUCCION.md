# Puesta en producción

Este documento prepara el despliegue en un único servidor Docker. No sustituye
la decisión de proveedor, DNS o correo transaccional; esas decisiones deben
estar aprobadas antes de exponer el portal públicamente.

## Estado de preparación

El archivo `docker-compose.yml` es para ejecución local: PostgreSQL no es
accesible desde Internet y API y frontend se publican solo en loopback. Para
producción se usa `docker-compose.production.yml`, que añade Caddy con TLS
automático y solo expone los puertos 80/443. API, frontend y PostgreSQL quedan
en redes internas. El frontend reenvía `/api` y `/uploads` a la API por la red
interna de Docker.

No publicar directamente el puerto `5120` de la API ni el de PostgreSQL.

## Datos que deben entregar antes del despliegue

- Dominio definitivo y acceso DNS para emitir TLS.
- Servidor Linux actualizado, con Docker Engine y Docker Compose Plugin.
- Secretos nuevos de producción: `POSTGRES_PASSWORD`, `JWT_SIGNING_KEY`,
  `SEED_ADMIN_PASSWORD` y `SEED_CUSTOMER_PASSWORD`.
- Proveedor SMTP/transaccional, remitente verificado y URL pública de
  recuperación. Sin esto el restablecimiento de contraseña no puede enviar
  correos y la fase 4 no está lista para publicar.
- Política de respaldos y una ubicación externa para conservarlos.
- Responsables del portal para la capacitación y los 30 días de soporte.

Los secretos se guardan únicamente en el gestor de secretos o archivo de
entorno del servidor, con permisos restringidos. No se suben al repositorio.

## Despliegue inicial

1. Apuntar los registros DNS `A` y, si corresponde, `AAAA` del dominio al
   servidor antes de iniciar Caddy.
2. Clonar el repositorio privado en el servidor y crear `.env.production`
   desde `.env.production.example`. Usar valores aleatorios y contraseñas de
   al menos 12 caracteres para los secretos.
3. Construir e iniciar el stack con:

   ```bash
   docker compose --env-file .env.production -f docker-compose.production.yml up --build -d
   ```

   Caddy solicita y renueva el certificado TLS automáticamente cuando el DNS
   ya apunta al servidor y los puertos 80/443 están accesibles.
4. Esperar el estado saludable de `db` y `api` usando `docker compose ps`.
5. Restringir el firewall a SSH, HTTP y HTTPS.
6. Comprobar `https://<dominio>/`, `https://<dominio>/api/health`, inicio de
   sesión, carga de imagen, creación de orden y descarga de PDF/XLSX.
7. Cambiar las contraseñas de cuentas semilla o desactivarlas si no se usarán.

Las migraciones y la semilla se ejecutan al iniciar la API. No ejecutar varias
recreaciones de la API a la vez durante ese primer arranque.

## Operación y recuperación

- Respaldar diariamente `postgres_data` y `product_uploads`; probar la
  restauración antes de la entrega final.
- El script `scripts/backup.sh` genera un `pg_dump` comprimido y un archivo
  de imágenes sin modificar los datos. Con el stack de producción activo:

  ```bash
  BACKUP_DIR=/srv/backups/la-reserva ./scripts/backup.sh
  ```

  El directorio de destino debe estar fuera del repositorio y copiarse a una
  ubicación externa. Programar el comando con el mecanismo de tareas del
  servidor solamente después de probar una restauración en un entorno aislado.
- Actualizar imágenes base y dependencias de manera programada, después de
  pasar CI y mantener una copia del respaldo previo.
- Revisar los logs de `api` y el estado de `docker compose ps` tras cada
  actualización.
- Revocar o rotar inmediatamente `JWT_SIGNING_KEY` y contraseñas si se
  sospecha exposición; el cambio de la clave JWT invalida las sesiones.
- Conservar las claves de ASP.NET Data Protection fuera del contenedor y
  cifradas si en el futuro se añade una función que las requiera. La sesión
  actual usa tokens JWT y refresh tokens propios, no claves de Data Protection.

## Validación de entrega

- El flujo completo se prueba desde HTTPS y con roles de Administrador,
  Compras, Ventas y Supervisor.
- Se valida que `/api` y PostgreSQL no sean accesibles de forma pública.
- Se verifica un respaldo restaurado en un entorno aislado.
- Se entrega [el manual de uso](MANUAL-USO.md), se capacita al equipo y se
  registra la fecha de inicio de garantía.
