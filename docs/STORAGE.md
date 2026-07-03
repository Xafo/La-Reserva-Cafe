# Storage CSV — placeholder de la base de datos

Sin backend todavia, los datos del demo viven en una capa de repositorios
(`frontend/src/storage/`) que simula una base de datos:

1. **Semilla**: cada entidad tiene un `.csv` en `frontend/public/data/`. En el
   primer acceso el repositorio lo descarga, lo parsea y lo guarda.
2. **Persistencia**: las mutaciones se guardan en `localStorage` bajo la clave
   `csvdb:<entidad>:v1` (JSON de las filas parseadas, para evitar round-trips
   CSV con perdida de tipos).
3. **Export**: cualquier repositorio puede serializar su estado vivo de vuelta
   a CSV (`exportCsv` / `downloadCsv`) — la "tabla" descargable del demo.
4. **Reset**: `window.resetDemoData()` en la consola del navegador borra el
   estado local y vuelve a sembrar desde los CSV.

Los `.csv` son el **contrato de esquema**: sus columnas planas son las columnas
de las tablas futuras.

## Modulos

| Archivo | Rol |
|---|---|
| `storage/csv.ts` | Parser/serializador CSV (subset RFC 4180) |
| `storage/repository.ts` | `Repository<T>` (interfaz) + `CsvRepository<T>` |
| `storage/codecs.ts` | `EntityCodec<T>` por entidad: fila CSV ↔ objeto TS |
| `storage/index.ts` | Instancias unicas de repos + `resetDemoData()` |

## Mapeo entidad ↔ tablas futuras (.NET 10 + EF Core)

| CSV | Entidad TS | Tablas destino |
|---|---|---|
| `products.csv` | `Product` | `Products` + `QualityProfiles` (1:1, columnas `quality_*`) |
| `orders.csv` | `Order` | `Orders` + `OrderItems` (columna `items`, ver abajo) |
| `customers.csv` | `Customer` | `Customers` |
| `users.csv` | `User` | `AspNetUsers` / `Users` (Identity) |
| `accounts.csv` | `CustomerAccount` | `CustomerAccounts` + `CustomerPreferences` (columnas `pref_*`) |

## Convenciones de aplanado

- **Objeto anidado** → columnas con prefijo: `quality_grainType`, `pref_goals`.
- **Array de texto** → valores unidos por `|`: `Cacao|Nuez tostada|Panela`.
- **Items de orden** → `productId~productName~cantidad~precioUnitario`,
  registros unidos por `|`. En la BD real esto se normaliza a `OrderItems`.
- **Preferencias vacias** → columnas `pref_*` en blanco = `preferences: null`.
- **Booleanos** → `true` / `false`. **Fechas** → ISO 8601.

## Plan de swap al backend

`Repository<T>` es el punto de corte. Cuando exista la API .NET:

1. Crear `ApiRepository<T>` que implemente `Repository<T>` usando `api<T>()`
   de `frontend/src/config/api.ts` contra los endpoints de `docs/BACKEND-TODO.md`.
2. Cambiar las instancias en `storage/index.ts` (una linea por entidad).
3. La capa de servicios (`src/services/index.ts`) y la UI no cambian.
4. Importar los `.csv` como datos iniciales de la BD (script de migracion o
   `dotnet ef` seeding).
