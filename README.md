# Directo Cafe — Café de Honduras

Plataforma hondureña de café. La primera fase ofrece un catálogo curado de Directo Cafe; la incorporación de otros vendedores corresponde a un horizonte posterior.

## Estado

- Frontend: React 19, Vite, TypeScript y Tailwind CSS 4.
- Backend: .NET 10 con Domain, Application, Infrastructure y API.
- Base de datos: PostgreSQL 17 y EF Core.
- Seguridad: contraseñas hasheadas, JWT de corta duración, refresh tokens rotativos en cookies HttpOnly y autorización por roles.
- Ejecución local: frontend, API y PostgreSQL en Docker Compose.

La evolución a Directo Cafe se organiza en [diagnóstico y plan por fases](docs/DIRECTO-CAFE-PLAN-POR-FASES.md), con cobertura contrastada contra el código y los dos documentos de negocio (21 de septiembre de 2026).

El [plan técnico anterior](docs/PLAN-DESARROLLO.md) conserva antecedentes del proyecto; sus checklists no sustituyen la validación del diagnóstico actual.

## Despliegue web

Vercel está conectado al repositorio y publica el portal desde cada cambio en la rama `main`. El proyecto debe usar `frontend` como directorio raíz, el ajuste Vite predeterminado y Node.js 24. Antes de publicar el portal conectado al backend, configurar `VITE_API_URL` en Vercel con la URL HTTPS pública de la API; no guardar secretos en esta variable.

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

Requisitos locales: **SDK .NET 10** y **Node.js 24** (o una versión compatible con los requisitos de Vite y ESLint del lockfile). Node 18 y SDK .NET 8 no permiten verificar este proyecto. La verificación del frontend no requiere levantar la API; las pruebas de negocio completas sí requieren API y PostgreSQL.

```bash
dotnet tool restore
dotnet restore backend/LaReserva.slnx
dotnet build backend/LaReserva.slnx --no-restore
dotnet test backend/LaReserva.slnx --no-build

cd frontend
npm ci
npm test
npm run lint
npm run build
```

Las migraciones se aplican al iniciar la API y los CSV se importan solamente cuando la base está vacía.

Para probar el quiz sin API: ejecutar `npm run dev` en `frontend` y abrir
`/demo/quiz`. Usa siete cafés de escenario y guarda las respuestas únicamente
en el navegador. Esa ruta y sus datos están excluidos de la compilación de producción.
Contrato, reglas y límites: [entrega 1B](docs/DIRECTO-CAFE-ONBOARDING.md).

## Sesiones y autorización

- El access token vive únicamente en `sessionStorage` y expira en 15 minutos.
- El refresh token se guarda en cookie `HttpOnly` y en PostgreSQL solamente como hash.
- Cada refresh revoca y reemplaza el token anterior.
- El cierre de sesión revoca el refresh token en el servidor.
- Los permisos del frontend son solo presentación; la API vuelve a comprobar cada rol.

No agregar secretos a `appsettings*.json`, archivos Docker, commits, issues o pull requests.
