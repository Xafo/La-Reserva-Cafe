# LA RESERVA — Café y Tostadería

Portal público y administrativo para la gestión y comercialización de café de LA RESERVA, Honduras.

## Estado

- Frontend: React 19, Vite, TypeScript y Tailwind CSS 4.
- Backend: .NET 10 con Domain, Application, Infrastructure y API.
- Base de datos: PostgreSQL 17 y EF Core.
- Seguridad: contraseñas hasheadas, JWT de corta duración, refresh tokens rotativos en cookies HttpOnly y autorización por roles.
- Ejecución local: frontend, API y PostgreSQL en Docker Compose.

El alcance completo está en [docs/PLAN-DESARROLLO.md](docs/PLAN-DESARROLLO.md).

## Ejecutar con Docker

1. Crear la configuración local:

   ```bash
   cp .env.example .env
   ```

2. Reemplazar todos los valores de `.env` por secretos aleatorios y contraseñas de al menos 12 caracteres. El archivo `.env` está excluido de Git.

3. Construir y levantar el stack:

   ```bash
   docker compose up --build -d
   ```

4. Abrir:

   - Portal: `http://localhost:5173`
   - API: `http://localhost:5120`
   - Salud: `http://localhost:5120/health`

5. Detener sin eliminar los datos:

   ```bash
   docker compose down
   ```

La base de datos no publica un puerto al host. Solamente la API puede acceder a ella mediante la red interna de Docker.

## Credenciales iniciales

Los usuarios de `frontend/public/data/users.csv` reciben durante el seed la contraseña definida en `SEED_ADMIN_PASSWORD`. La cuenta de cliente semilla recibe `SEED_CUSTOMER_PASSWORD`. Las contraseñas nunca se guardan ni se devuelven en texto plano.

Cambiar estas credenciales antes de cualquier despliegue compartido o de producción.

## Desarrollo y verificación

```bash
dotnet tool restore
dotnet restore backend/LaReserva.slnx
dotnet build backend/LaReserva.slnx --no-restore
dotnet test backend/LaReserva.slnx --no-build

cd frontend
npm ci
npm run build
```

Las migraciones se aplican al iniciar la API y los CSV se importan solamente cuando la base está vacía.

## Sesiones y autorización

- El access token vive únicamente en `sessionStorage` y expira en 15 minutos.
- El refresh token se guarda en cookie `HttpOnly` y en PostgreSQL solamente como hash.
- Cada refresh revoca y reemplaza el token anterior.
- El cierre de sesión revoca el refresh token en el servidor.
- Los permisos del frontend son solo presentación; la API vuelve a comprobar cada rol.

No agregar secretos a `appsettings*.json`, archivos Docker, commits, issues o pull requests.
